const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const db = require("../database/index");

const TEMP_DIR = "/var/www/api.pratyushh.online/temp";
const ASSETS_DIR = "/var/www/api.pratyushh.online/assets";
const LOG_FILE = path.join(__dirname, "../logs/video_processor.log");

function log(msg) {
    const line = `[${new Date().toISOString()}] ${msg}\n`;
    console.log(line.trim());
    fs.appendFileSync(LOG_FILE, line);
}

function ensureDir(dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readXml(file) {
    try {
        return fs.readFileSync(file, "utf8");
    } catch {
        return "";
    }
}

function getVideoMeta(file) {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(file, (err, meta) => {
            if (err) return reject(err);
            try {
                const stream = meta.streams.find(s => s.codec_type === "video");
                const duration = meta.format.duration || 0;
                const width = stream.width;
                const height = stream.height;
                const bitrate = meta.format.bit_rate ? parseInt(meta.format.bit_rate) / 1000 : 4000;
                resolve({ duration, width, height, bitrate });
            } catch (e) {
                reject(e);
            }
        });
    });
}

function estimateTime(duration, width, height) {
    const pixels = width * height;
    let speedFactor = 1.5; // baseline
    if (pixels > 1920 * 1080) speedFactor = 2.0;
    else if (pixels < 1280 * 720) speedFactor = 1.2;
    const estimated = Math.round(duration * speedFactor);
    return estimated; // in seconds
}

function encodeDash(input, outputDir, width, height, bitrate, label, id) {
    return new Promise((resolve, reject) => {
        ensureDir(outputDir);
        const mpdPath = path.join(outputDir, `${label}.mpd`);
        const start = Date.now();

        ffmpeg(input)
            .outputOptions([
                "-preset veryfast",
                "-g 48",
                "-keyint_min 48",
                "-sc_threshold 0",
                "-c:v libx264",
                "-c:a aac",
                "-b:a 128k",
                `-b:v ${bitrate}`,
                `-s ${width}x${height}`,
                "-use_template 1",
                "-use_timeline 1",
                "-seg_duration 5",
                "-f dash"
            ])
            .output(mpdPath)
            .on("start", cmd => log(`🎬 [${id}] ${label} ffmpeg: ${cmd}`))
            .on("progress", p => p.percent && log(`📈 [${id}] ${label}: ${p.percent.toFixed(1)}%`))
            .on("end", () => {
                const sec = Math.floor((Date.now() - start) / 1000);
                log(`✅ [${id}] ${label} completed in ${sec}s`);
                resolve({ label, mpdPath, sec });
            })
            .on("error", err => {
                log(`❌ [${id}] ${label} error: ${err.message}`);
                reject(err);
            })
            .run();
    });
}

function generateThumbnails(input, outDir, id) {
    return new Promise((resolve, reject) => {
        ensureDir(outDir);
        ffmpeg(input)
            .outputOptions(["-vf", "fps=1/5"])
            .output(path.join(outDir, "thumb_%03d.jpg"))
            .on("start", cmd => log(`🖼️ [${id}] Thumbnails: ${cmd}`))
            .on("end", () => {
                log(`🖼️ [${id}] Thumbnails done`);
                resolve();
            })
            .on("error", err => {
                log(`❌ [${id}] Thumbnail error: ${err.message}`);
                reject(err);
            })
            .run();
    });
}

function generateThumbnailXML(thumbnailsDir, id) {
    try {
        const files = fs.readdirSync(thumbnailsDir).filter(f => f.endsWith(".jpg"));
        const xml = [
            '<?xml version="1.0" encoding="utf-8"?>',
            '<Thumbnails>',
            ...files.map(f => `  <Image>/assets/${id}/thumbnails/${f}</Image>`),
            '</Thumbnails>'
        ].join('\n');
        return xml;
    } catch (err) {
        log(`⚠️ [${id}] Failed to create thumbnail XML: ${err.message}`);
        return '';
    }
}

async function processPendingVideos() {
    db.query("SELECT * FROM videos WHERE process = 0 AND video = 1 AND thumnail = 1", async(err, rows) => {
        if (err) return log("❌ DB error: " + err.message);
        if (!rows.length) return log("⏳ No pending videos.");

        for (const row of rows) {
            const id = row.id;
            const input = path.join(TEMP_DIR, id, `${id}.mp4`);
            const outDir = path.join(ASSETS_DIR, id);

            if (!fs.existsSync(input)) {
                log(`⚠️ [${id}] Missing input file.`);
                continue;
            }

            ensureDir(outDir);
            const start = Date.now();

            // ✅ Step 1: Estimate duration & processing time
            const meta = await getVideoMeta(input);
            const estimated = estimateTime(meta.duration, meta.width, meta.height);
            db.query("UPDATE videos SET estimated_processing_time_sec=? WHERE id=?", [estimated, id]);
            log(`🧮 [${id}] Estimated processing time: ${estimated}s`);

            db.query("UPDATE videos SET processing_started_at=? WHERE id=?", [new Date(), id]);

            try {
                const v1080Dir = path.join(outDir, "1080p");
                const v720Dir = path.join(outDir, "720p");
                const v480Dir = path.join(outDir, "480p");

                const [v1080, v720, v480] = await Promise.all([
                    encodeDash(input, v1080Dir, 1920, 1080, "5000k", "1080p", id),
                    encodeDash(input, v720Dir, 1280, 720, "3000k", "720p", id),
                    encodeDash(input, v480Dir, 854, 480, "1200k", "480p", id)
                ]);

                const thumbDir = path.join(outDir, "thumbnails");
                await generateThumbnails(input, thumbDir, id);
                const thumbXml = generateThumbnailXML(thumbDir, id);

                const xml1080 = readXml(v1080.mpdPath);
                const xml720 = readXml(v720.mpdPath);
                const xml480 = readXml(v480.mpdPath);

                const timeTaken = Math.floor((Date.now() - start) / 1000);

                db.query(
                    `UPDATE videos SET 
            process = 1,
            mpd_1080p_xml = ?,
            mpd_720p_xml = ?,
            mpd_480p_xml = ?,
            thumbnails_xml = ?,
            processing_completed_at = ?,
            processing_time_sec = ?,
            url_video = ?,
            url_thumnail = ?
           WHERE id = ?`, [
                        xml1080,
                        xml720,
                        xml480,
                        thumbXml,
                        new Date(),
                        timeTaken,
                        JSON.stringify({
                            "1080p": `/assets/${id}/1080p/1080p.mpd`,
                            "720p": `/assets/${id}/720p/720p.mpd`,
                            "480p": `/assets/${id}/480p/480p.mpd`
                        }),
                        `/assets/${id}/thumbnails/`,
                        id
                    ],
                    (err2) => {
                        if (err2) log(`⚠️ [${id}] DB update failed: ${err2.message}`);
                        else log(`✅ [${id}] Stored MPDs, thumbnails, and actual time (${timeTaken}s).`);
                    }
                );

                try {
                    fs.rmSync(path.join(TEMP_DIR, id), { recursive: true, force: true });
                    log(`🧹 [${id}] Temp folder removed.`);
                } catch (e) {
                    log(`⚠️ [${id}] Cleanup error: ${e.message}`);
                }

            } catch (e) {
                log(`❌ [${id}] Processing failed: ${e.message}`);
            }
        }
    });
}

(async() => {
    log("🕒 DASH processor booting...");
    await processPendingVideos();
    setInterval(processPendingVideos, 15 * 60 * 1000);
})();
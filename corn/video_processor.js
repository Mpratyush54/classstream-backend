    const fs = require("fs");
    const path = require("path");
    const crypto = require("crypto");
    const ffmpeg = require("fluent-ffmpeg");
    const db = require("../database/index");
    const { exec } = require("child_process");
    const { DOMParser, XMLSerializer } = require("xmldom");

    const TEMP_DIR = "/var/www/api.pratyushh.online/temp";
    const ASSETS_DIR = "/var/www/api.pratyushh.online/assets";
    const LOG_FILE = path.join(__dirname, "../logs/cron/video_processor.log");
    const LA_URL = "https://api.pratyushh.online/api/video/get-key";

    function log(msg) {
        const line = `[${new Date().toISOString()}] ${msg}\n`;
        console.log(line.trim());
        try { fs.appendFileSync(LOG_FILE, line); } catch {}
    }

    function ensureDir(dir) {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    }

    function randomHex(len = 16) {
        return crypto.randomBytes(len).toString("hex");
    }

    function hexToUUID(hex) {
        const clean = (hex || "").replace(/-/g, "");
        if (clean.length !== 32) return hex;
        return `${clean.substr(0, 8)}-${clean.substr(8, 4)}-${clean.substr(12, 4)}-${clean.substr(16, 4)}-${clean.substr(20)}`;
    }

    function execPromise(cmd, cwd) {
        // --- START: MODIFICATION ---
        const bento4Path = '/Bento4/Bento4/build:/Bento4/Bento4/Source/Python/wrappers';
        const executionEnv = {
            ...process.env,
            PATH: `${bento4Path}:${process.env.PATH}`
        };
        // --- END: MODIFICATION ---

        return new Promise((resolve, reject) => {
            // Pass the modified environment to the exec command
            exec(cmd, { cwd, env: executionEnv }, (err, stdout, stderr) => {
                if (err) {
                    log(`⚠️ Command failed: ${cmd}\nSTDERR: ${stderr}`);
                    return reject(new Error(stderr || stdout || err.message));
                }
                resolve(stdout || stderr);
            });
        });
    }

    function readXml(file) {
        try { return fs.readFileSync(file, "utf8"); } catch { return ""; }
    }

    async function getVideoMeta(file) {
        return new Promise((resolve, reject) => {
            ffmpeg.ffprobe(file, (err, meta) => {
                if (err) return reject(err);
                try {
                    const stream = meta.streams.find(s => s.codec_type === "video");
                    const duration = meta.format.duration || 0;
                    resolve({
                        duration,
                        width: stream.width,
                        height: stream.height,
                        bitrate: meta.format.bit_rate ? parseInt(meta.format.bit_rate) / 1000 : 4000
                    });
                } catch (e) { reject(e); }
            });
        });
    }

    function estimateTime(duration, width, height) {
        const pixels = width * height;
        let speedFactor = 1.5;
        if (pixels > 1920 * 1080) speedFactor = 2.0;
        else if (pixels < 1280 * 720) speedFactor = 1.2;
        return Math.round(duration * speedFactor);
    }

    function injectContentProtection(mpdPath, kidHex) {
        try {
            let xml = fs.readFileSync(mpdPath, "utf8");
            if (!xml.includes('xmlns:cenc')) {
                xml = xml.replace(
                    /<MPD([^>]*)>/,
                    `<MPD$1 xmlns:cenc="urn:mpeg:cenc:2013" xmlns:clearkey="http://dashif.org/guidelines/clearKey">`
                );
            }
            const doc = new DOMParser().parseFromString(xml, "application/xml");
            const sets = doc.getElementsByTagName("AdaptationSet");
            const kidUUID = hexToUUID(kidHex);

            for (let i = 0; i < sets.length; i++) {
                const as = sets[i];
                const old = as.getElementsByTagName("ContentProtection");
                for (let j = old.length - 1; j >= 0; j--) as.removeChild(old[j]);

                const cp = doc.createElement("ContentProtection");
                cp.setAttribute("schemeIdUri", "urn:uuid:1077efec-c0b2-4d02-ace3-3c1e52e2fb4b");
                cp.setAttribute("value", "ClearKey1.0");
                cp.setAttribute("cenc:default_KID", kidUUID);

                const la = doc.createElement("clearkey:Laurl");
                la.appendChild(doc.createTextNode(LA_URL));
                cp.appendChild(la);

                const rep = as.getElementsByTagName("Representation")[0];
                if (rep) as.insertBefore(cp, rep);
                else as.appendChild(cp);
            }

            fs.writeFileSync(mpdPath, new XMLSerializer().serializeToString(doc));
            log(`🧩 Injected ClearKey into ${mpdPath}`);
        } catch (err) {
            log(`⚠️ MPD patch failed: ${err.message}`);
        }
    }

    // 🎬 Encode + Encrypt + Package
    async function encodeDashEncrypted(input, outputDir, width, height, bitrate, label, id, keyHex, kidHex) {
        ensureDir(outputDir);
        const clear = path.join(outputDir, `${label}_clear.mp4`);
        const frag = path.join(outputDir, `${label}_frag.mp4`);
        const enc = path.join(outputDir, `${label}_enc.mp4`);

        const start = Date.now();
        log(`🎬 [${id}] ${label} Encoding...`);

        // Encode base MP4
        await new Promise((resolve, reject) => {
            ffmpeg(input)
                .outputOptions([
                    "-preset veryfast",
                    "-g 48",
                    "-keyint_min 48",
                    "-sc_threshold 0",
                    "-c:v libx264",
                    "-c:a aac",
                    "-profile:a aac_low",
                    "-b:a 128k",
                    `-b:v ${bitrate}`,
                    `-s ${width}x${height}`,
                    "-movflags +faststart"
                ])
                .save(clear)
                .on("end", resolve)
                .on("error", (e) => reject(new Error(`ffmpeg encode failed: ${e.message}`)));
        });

        log(`🧩 [${id}] Fragmenting...`);
        await execPromise(`mp4fragment "${clear}" "${frag}"`);

        log(`🔐 [${id}] Encrypting with Bento4...`);
        await execPromise(`mp4encrypt --method MPEG-CENC --key 1:${keyHex}:cenc --property 1:KID:${kidHex} "${frag}" "${enc}"`);

        log(`📦 [${id}] Packaging with mp4dash...`);
        await execPromise(`mp4dash --force --use-segment-template --mpd-name "${label}.mpd" --output-dir "${outputDir}" "${enc}"`);

        const mpd = path.join(outputDir, `${label}.mpd`);
        injectContentProtection(mpd, kidHex);

        try { fs.rmSync(clear, { force: true }); } catch {}
        try { fs.rmSync(frag, { force: true }); } catch {}
        try { fs.rmSync(enc, { force: true }); } catch {}

        const sec = Math.floor((Date.now() - start) / 1000);
        log(`✅ [${id}] ${label} done (${sec}s)`);
        return { label, mpdPath: mpd, sec };
    }

    // 🖼️ Thumbnail
    function generateThumbnails(input, outDir, id) {
        return new Promise((resolve, reject) => {
            ensureDir(outDir);
            ffmpeg(input)
                .outputOptions(["-vf", "fps=1/5"])
                .output(path.join(outDir, "thumb_%03d.jpg"))
                .on("end", () => {
                    log(`🖼️ [${id}] Thumbnails done`);
                    resolve();
                })
                .on("error", (err) => {
                    log(`❌ [${id}] Thumbnail error: ${err.message}`);
                    reject(err);
                })
                .run();
        });
    }

    function generateThumbnailXML(thumbnailsDir, id) {
        const files = fs.readdirSync(thumbnailsDir).filter(f => f.endsWith(".jpg"));
        return [
            '<?xml version="1.0" encoding="utf-8"?>',
            "<Thumbnails>",
            ...files.map(f => `  <Image>/assets/${id}/thumbnails/${f}</Image>`),
            "</Thumbnails>",
        ].join("\n");
    }

    async function assertTools() {
        for (const bin of["ffmpeg", "mp4fragment", "mp4encrypt", "mp4dash"]) {
            try { await execPromise(`which ${bin}`); } catch { throw new Error(`${bin} not found in PATH; install or add to PATH`); }
        }
        log("🧰 Tools verified.");
    }

    // 🚀 Main Processor
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

                const meta = await getVideoMeta(input);
                const estimated = estimateTime(meta.duration, meta.width, meta.height);
                db.query("UPDATE videos SET estimated_processing_time_sec=?, processing_started_at=? WHERE id=?", [estimated, new Date(), id]);
                log(`🧮 [${id}] Estimated processing time: ${estimated}s`);

                const keys = {
                    "1080p": { key: row.enc_1080p_key || randomHex(16), kid: row.enc_1080p_kid || randomHex(16) },
                    "720p": { key: row.enc_720p_key || randomHex(16), kid: row.enc_720p_kid || randomHex(16) },
                    "480p": { key: row.enc_480p_key || randomHex(16), kid: row.enc_480p_kid || randomHex(16) }
                };

                db.query(
                    `UPDATE videos SET enc_enabled=1,
            enc_1080p_key=?, enc_1080p_kid=?,
            enc_720p_key=?, enc_720p_kid=?,
            enc_480p_key=?, enc_480p_kid=? WHERE id=?`, [keys["1080p"].key, keys["1080p"].kid, keys["720p"].key, keys["720p"].kid, keys["480p"].key, keys["480p"].kid, id]
                );

                try {
                    const v1080 = await encodeDashEncrypted(input, path.join(outDir, "1080p"), 1920, 1080, "5000k", "1080p", id, keys["1080p"].key, keys["1080p"].kid);
                    const v720 = await encodeDashEncrypted(input, path.join(outDir, "720p"), 1280, 720, "3000k", "720p", id, keys["720p"].key, keys["720p"].kid);
                    const v480 = await encodeDashEncrypted(input, path.join(outDir, "480p"), 854, 480, "1200k", "480p", id, keys["480p"].key, keys["480p"].kid);

                    const thumbDir = path.join(outDir, "thumbnails");
                    await generateThumbnails(input, thumbDir, id);
                    const thumbXml = generateThumbnailXML(thumbDir, id);

                    const xml1080 = readXml(v1080.mpdPath);
                    const xml720 = readXml(v720.mpdPath);
                    const xml480 = readXml(v480.mpdPath);
                    const timeTaken = Math.floor((Date.now() - start) / 1000);

                    db.query(
                        `UPDATE videos SET process=1,
            mpd_1080p_xml=?, mpd_720p_xml=?, mpd_480p_xml=?,
            thumbnails_xml=?, processing_completed_at=?, processing_time_sec=?,
            url_video=?, url_thumnail=? WHERE id=?`, [
                            xml1080, xml720, xml480,
                            thumbXml, new Date(), timeTaken,
                            JSON.stringify({
                                "1080p": `/assets/${id}/1080p/1080p.mpd`,
                                "720p": `/assets/${id}/720p/720p.mpd`,
                                "480p": `/assets/${id}/480p/480p.mpd`
                            }),
                            `/assets/${id}/thumbnails/`, id
                        ],
                        err2 => {
                            if (err2) log(`⚠️ [${id}] DB update failed: ${err2.message}`);
                            else log(`✅ [${id}] Stored MPDs and thumbnails (${timeTaken}s).`);
                        }
                    );

                    fs.rmSync(path.join(TEMP_DIR, id), { recursive: true, force: true });
                    log(`🧹 [${id}] Temp cleaned.`);
                } catch (e) {
                    log(`❌ [${id}] Processing failed: ${e.message}`);
                }
            }
        });
    }

    (async() => {
        try {
            log("🕒 Encrypted DASH processor booting...");
            await assertTools();
            await processPendingVideos();
            setInterval(processPendingVideos, 15 * 60 * 1000);
        } catch (e) {
            // Non-fatal: API + streaming still work without the transcoding worker
            // (local Windows runs lack `which`/ffmpeg; server runs with tools in PATH).
            log(`⚠️ Video processor disabled: ${e.message}`);
        }
    })();
const crypto = require("crypto");
const db = require("../database/index");
const VideoKeyLog = require("../models/VideoKeyLog");
const VideoKeyHistory = require("../models/VideoKeyHistory");

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

async function issueOrGetKeys({ username, email, query_token, videoId, ip, userAgent }) {
    // 1️⃣ Validate User
    const [userRows] = await new Promise((resolve, reject) => {
        db.query(
            "SELECT username, role, class FROM login WHERE username=? OR email=? LIMIT 1", [username, email],
            (err, rows) => (err ? reject(err) : resolve(rows))
        );
    });
    if (!userRows) throw new Error("Invalid user");

    const user = userRows;
    const userType = parseInt(user.role) === 2 ? "teacher" : "student";
    const userClass = user.class;

    // 2️⃣ Validate Token
    const [tokenRows] = await new Promise((resolve, reject) => {
        db.query(
            "SELECT * FROM loginlog WHERE username=? AND email=? AND token=? LIMIT 1", [username, email, query_token],
            (err, rows) => (err ? reject(err) : resolve(rows))
        );
    });
    if (!tokenRows) throw new Error("Invalid or expired session token");

    // 3️⃣ Fetch Video
    const [videoRows] = await new Promise((resolve, reject) => {
        db.query("SELECT * FROM videos WHERE id=?", [videoId], (err, rows) =>
            err ? reject(err) : resolve(rows)
        );
    });
    if (!videoRows) throw new Error("Video not found");

    const video = videoRows;
    // url_video schema drift: data.sql defines it as INT, processor writes JSON string.
    // Parse defensively so un-migrated rows give a clear error instead of a crash.
    let videoUrls;
    try {
        if (!video.url_video || video.url_video === 0 || video.url_video === "0") {
            throw new Error(
                "Video has no processed streams yet (url_video is empty). " +
                "Run DB migration videos_url_video_text.sql and process the video via corn/video_processor."
            );
        }
        videoUrls = typeof video.url_video === "string" ? JSON.parse(video.url_video) : video.url_video;
    } catch (e) {
        if (e.message && e.message.includes("no processed streams")) throw e;
        throw new Error("Video url_video is corrupt (not valid JSON): " + e.message);
    }
    if (!videoUrls["1080p"] && !videoUrls["720p"] && !videoUrls["480p"]) {
        throw new Error("Video has no playable renditions (1080p/720p/480p all missing)");
    }

    // 4️⃣ Access Rules
    if (userType === "teacher" && video.username !== username)
        throw new Error("Access denied: Not your upload");

    if (userType === "student" && parseInt(video.class) !== parseInt(userClass))
        throw new Error("Access denied: Not your class");

    // 5️⃣ Reuse or Issue new keys
    const existingKeyset = await VideoKeyLog.findOne({
        videoId,
        username,
        action: "issued",
        expiresAt: { $gt: new Date() },
    }).sort({ timestamp: -1 });

    let issuedKeys = [];
    let cached = false;

    if (existingKeyset) {
        issuedKeys = existingKeyset.keys;
        cached = true;
    } else {
        const qualities = ["1080p", "720p", "480p"];
        issuedKeys = qualities.map((q) => ({
            quality: q,
            encKey: crypto.randomBytes(16).toString("hex"),
            kid: crypto.randomBytes(8).toString("hex"),
        }));

        const now = new Date();
        const expiresAt = new Date(now.getTime() + CACHE_TTL_MS);

        await VideoKeyLog.findOneAndUpdate({ videoId, username }, {
            videoId,
            username,
            userType,
            keys: issuedKeys,
            ipAddress: ip,
            userAgent: userAgent,
            action: "issued",
            timestamp: now,
            expiresAt,
        }, { upsert: true });

        await new VideoKeyHistory({
            videoId,
            username,
            userType,
            keys: issuedKeys,
            ipAddress: ip,
            userAgent: userAgent,
            action: "issued",
            timestamp: now,
        }).save();
    }
    // console.log(video);

    // 6️⃣ Return result (metadata drives the player header/poster — keep additive)
    return {
        cached,
        video: {
            id: videoId,
            title: video.title,
            urls: videoUrls,
            chapterName: video.ChapterName || '',
            chapterNumber: video.ChapterNumber ?? '',
            class: video.class ?? '',
            poster: video.url_thumnail && video.url_thumnail !== '0' && video.url_thumnail !== "'0'" ? video.url_thumnail : '',
        },
        keys: issuedKeys,
        expiresAt: cached ?
            existingKeyset.expiresAt : new Date(Date.now() + CACHE_TTL_MS),
    };
}

module.exports = { issueOrGetKeys };
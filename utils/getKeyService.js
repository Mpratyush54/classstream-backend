const db = require("../database/index");
const VideoAccessLog = require("../models/VideoAccessLog");
const VideoKeyLog = require("../models/VideoKeyLog");

// Convert hex → Base64URL
function toBase64Url(hex) {
    if (!hex) return "";
    return Buffer.from(hex, "hex")
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

async function getKeyService({
    username,
    email,
    query_token,
    kids, // array of dummy kids from player
    videoId,
    ip,
    userAgent,
}) {
    if (!videoId) throw new Error("Missing videoId");
    if (!ip) throw new Error("Missing IP for getKeyService()");
    // Normalize possibly nested kids (e.g. [[kid]] from older callers)
    kids = (Array.isArray(kids) ? kids : [kids]).flat(Infinity).filter(Boolean);
    if (!kids || kids.length === 0) throw new Error("Missing KID(s)");

    let userType = "student";
    let quality = "unknown";

    try {
        // 1️⃣ Validate user
        const [userRows] = await new Promise((resolve, reject) => {
            db.query(
                "SELECT username, role FROM login WHERE username=? OR email=? LIMIT 1", [username, email],
                (err, rows) => (err ? reject(err) : resolve([rows]))
            );
        });
        if (!userRows || userRows.length === 0) throw new Error("Invalid user");

        const user = userRows[0];
        userType = parseInt(user.role) === 2 ? "teacher" : "student";

        // 2️⃣ Validate token/session
        const [tokenRows] = await new Promise((resolve, reject) => {
            db.query(
                "SELECT * FROM loginlog WHERE username=? AND email=? AND token=? LIMIT 1", [username, email, query_token],
                (err, rows) => (err ? reject(err) : resolve([rows]))
            );
        });
        if (!tokenRows || tokenRows.length === 0)
            throw new Error("Invalid or expired session token");

        // 3️⃣ Find which quality the dummy KID corresponds to (in Mongo)
        const keyDoc = await VideoKeyLog.findOne({
            videoId,
            "keys.kid": { $in: Array.isArray(kids) ? kids : [kids] },
        }).sort({ timestamp: -1 });

        if (!keyDoc) throw new Error("No record found in Mongo for provided KID");

        const matchedKey = keyDoc.keys.find((k) =>
            (Array.isArray(kids) ? kids : [kids]).includes(k.kid)
        );

        if (!matchedKey) throw new Error("KID not found in Mongo key set");

        quality = matchedKey.quality;

        // 4️⃣ Fetch real AES key + kid from MySQL for that quality
        const [videoRows] = await new Promise((resolve, reject) => {
            db.query("SELECT * FROM videos WHERE id=?", [videoId], (err, rows) =>
                err ? reject(err) : resolve([rows])
            );
        });

        if (!videoRows || videoRows.length === 0) throw new Error("Video not found in MySQL");
        const video = videoRows[0];

        let realKeyHex, realKidHex;
        switch (quality) {
            case "1080p":
                realKeyHex = video.enc_1080p_key;
                realKidHex = video.enc_1080p_kid;
                break;
            case "720p":
                realKeyHex = video.enc_720p_key;
                realKidHex = video.enc_720p_kid;
                break;
            case "480p":
                realKeyHex = video.enc_480p_key;
                realKidHex = video.enc_480p_kid;
                break;
            default:
                throw new Error(`Unsupported or missing quality: ${quality}`);
        }

        if (!realKeyHex || !realKidHex)
            throw new Error(`Missing actual encryption key for ${quality}`);

        // 5️⃣ Convert real key → Base64URL (ClearKey format)
        const formattedKey = {
            kty: "oct",
            kid: toBase64Url(realKidHex),
            k: toBase64Url(realKeyHex),
            quality,
        };

        // 6️⃣ Log access (Mongo)
        await new VideoAccessLog({
            videoId,
            username,
            userType,
            quality,
            kid: realKidHex,
            encKey: realKeyHex,
            ipAddress: ip,
            userAgent,
            action: "accessed",
        }).save();

        // ✅ 7️⃣ Return only the *real* key from MySQL
        return {
            keys: [formattedKey],
            type: "temporary",
            cached: false,
        };
    } catch (err) {
        console.error("❌ getKeyService error:", err.message);

        await new VideoAccessLog({
            videoId: videoId || "unknown",
            username: username || "unknown",
            userType: userType || "student",
            quality: quality || "unknown",
            kid: "unknown",
            encKey: "none",
            ipAddress: ip || "unknown",
            userAgent: userAgent || "unknown",
            action: "requested",
        }).save();

        throw err;
    }
}

module.exports = { getKeyService };
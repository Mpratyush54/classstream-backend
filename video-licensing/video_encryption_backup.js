    const express = require("express");
    const router = express.Router();
    const crypto = require("crypto");
    const db = require("../database/index");
    const VideoKeyLog = require("../models/VideoKeyLog");
    const VideoKeyHistory = require("../models/VideoKeyHistory"); // new permanent log collection
    const { issueOrGetKeys } = require("../utils/keyManager");
    const VideoAccessLog = require("../models/VideoAccessLog");
    const util = require("util"); // helps convert callbacks → promises

    // ---------- Utility helpers ----------
    function toBase64Url(buf) {
        return buf.toString("base64")
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");
    }

    function base64urlToBytes(b64url) {
        const pad = "=".repeat((4 - (b64url.length % 4)) % 4);
        const b64 = (b64url + pad).replace(/-/g, "+").replace(/_/g, "/");
        // ✅ FIX: use Buffer instead of atob()
        return Uint8Array.from(Buffer.from(b64, "base64"));
    }

    function deriveUserKey(query_token, salt_b64, iterations = 100000) {
        const password = Buffer.from(String(query_token), "utf8");
        const salt = Buffer.from(
            salt_b64.replace(/-/g, "+").replace(/_/g, "/"),
            "base64"
        );

        // PBKDF2 → 32 bytes key for AES-256-GCM
        return crypto.pbkdf2Sync(password, salt, iterations, 32, "sha256");
    }






    router.post("/issue-key", async(req, res) => {
        const { username, email, query_token, videoId } = req.body;

        try {
            const data = await issueOrGetKeys({
                username,
                email,
                query_token,
                videoId,
                ip: req.ip,
                userAgent: req.headers["user-agent"],
            });

            res.json({
                status: true,
                message: data.cached ? "Reused active keyset" : "New keyset issued",
                ...data,
            });
        } catch (error) {
            console.error("❌ /issue-key error:", error);
            res.status(500).json({ status: false, message: error.message });
        }
    });


    const query = util.promisify(db.query).bind(db);

    // ---------- Utility Helpers ----------
    function toBase64UrlFromHex(hexStr) {
        const buf = Buffer.from(hexStr.replace(/-/g, '').trim().toLowerCase(), 'hex');
        return buf
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    }

    function toBase64Url(buf) {
        return buf
            .toString("base64")
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");
    }

    function deriveUserKey(query_token, salt_b64, iterations = 100000) {
        const password = Buffer.from(String(query_token), "utf8");
        const salt = Buffer.from(salt_b64.replace(/-/g, "+").replace(/_/g, "/"), "base64");
        return crypto.pbkdf2Sync(password, salt, iterations, 32, "sha256"); // AES-256-GCM key
    }

    function encryptWithAesGcm(plaintextKeyBuf, kekBuf, aad) {
        const iv = crypto.randomBytes(12);
        const cipher = crypto.createCipheriv("aes-256-gcm", kekBuf, iv);
        cipher.setAAD(aad);
        const ct = Buffer.concat([cipher.update(plaintextKeyBuf), cipher.final()]);
        const tag = cipher.getAuthTag();
        const combined = Buffer.concat([ct, tag]);
        return { iv, ct: combined };
    }

    // ---------- MAIN ROUTE ----------
    router.post("/get-key", async(req, res) => {
        try {
            const { videoId, quality, query_token } = req.body;

            if (!videoId || !quality || !query_token) {
                return res.status(400).json({ error: "Missing required fields" });
            }

            // 1️⃣ Query the video info from DB
            const rows = await query("SELECT * FROM `videos` WHERE `id` = ?", [videoId]);
            if (!rows || rows.length === 0) {
                console.error("❌ Video not found for id:", videoId);
                return res.status(404).json({ error: "Video not found" });
            }

            const row = rows[0];

            // 2️⃣ Extract key & KID
            const kidHex = row[`enc_${quality}_kid`];
            const keyHex = row[`enc_${quality}_key`];

            if (!kidHex || !keyHex) {
                console.error("❌ Missing key/KID for quality:", quality);
                return res.status(404).json({ error: `Missing key/KID for ${quality}` });
            }

            // 3️⃣ Prepare encryption details
            const rawKeyBuf = Buffer.from(keyHex, "hex");
            const fullKid = toBase64UrlFromHex(kidHex); // ✅ Correct KID conversion
            const salt = crypto.randomBytes(16);
            const kekBuf = deriveUserKey(String(query_token), toBase64Url(salt));
            const aad = Buffer.from(`video:${videoId}:${quality}:${fullKid}`, "utf8");

            const { iv, ct } = encryptWithAesGcm(rawKeyBuf, kekBuf, aad);

            // Debug Logs
            console.log("🎥 Video:", videoId, "Quality:", quality);
            console.log("🧩 Raw kidHex from DB:", kidHex);
            console.log("🧩 Correct base64url KID:", fullKid);
            console.log("🧂 Salt:", toBase64Url(salt));
            console.log("🔑 KEK(server,b64url):", toBase64Url(kekBuf));

            // 4️⃣ Respond with wrapped key payload
            res.json({
                kid: fullKid,
                iv: toBase64Url(iv),
                ct: toBase64Url(ct),
                salt: toBase64Url(salt),
                iterations: 100000,
                alg: "A256GCM",
                videoId,
                quality,
            });

        } catch (err) {
            console.error("❌ Error in /get-key:", err);
            res.status(500).json({ error: "Server error" });
        }
    });

    module.exports = router;
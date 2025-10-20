    const express = require("express");
    const router = express.Router();
    const crypto = require("crypto");
    const { issueOrGetKeys } = require("../utils/keyManager");
    const { getKeyService } = require("../utils/getKeyService");

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

    router.post("/get-key", async(req, res) => {
        try {
            const {
                kids,
                username,
                email,
                query_token,
                deviceId,
                deviceName,
                platform,
                browser,
                appVersion,
                ipAddress,
                userAgent,
                videoId,
            } = req.body;

            // Handle KID input
            const kidB64 = Array.isArray(kids) ? kids[0] : kids;
            if (!kidB64) {
                return res.status(400).json({ error: "Missing KID in request" });
            }

            // Get client IP address
            const ip =
                ipAddress ||
                req.headers["x-forwarded-for"].split(",")[0].trim() ||
                req.socket.remoteAddress ||
                "unknown";

            // Call service to retrieve key
            const response = await getKeyService({
                username,
                email,
                query_token,
                'kids': [kids],
                kidB64, // ✅ correct parameter
                videoId,
                ip, // ✅ string, not array
                userAgent,
                deviceId,
                deviceName,
                platform,
                browser,
                appVersion,
            });

            res.json(response);
        } catch (err) {
            console.error("❌ /get-key error:", err);
            res.status(500).json({ error: err.message });
        }
    });



    module.exports = router;
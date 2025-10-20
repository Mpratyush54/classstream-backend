const mongoose = require("mongoose");

const VideoKeyLogSchema = new mongoose.Schema({
    videoId: String,
    username: String,
    userType: String,
    keys: [{
        quality: String,
        encKey: String,
        kid: String,
    }, ],
    ipAddress: String,
    userAgent: String,
    action: { type: String, enum: ["issued", "revoked"], default: "issued" },
    timestamp: { type: Date, default: Date.now },
    expiresAt: { type: Date },
});

module.exports = mongoose.models.VideoKeyLog || mongoose.model("VideoKeyLog", VideoKeyLogSchema);
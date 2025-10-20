const mongoose = require("mongoose");

const VideoKeyHistorySchema = new mongoose.Schema({
    videoId: String,
    username: String,
    userType: String,
    keys: [{
        quality: String,
        encKey: String,
        kid: String
    }],
    ipAddress: String,
    userAgent: String,
    action: { type: String, enum: ["issued", "reused"], default: "issued" },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("VideoKeyHistory", VideoKeyHistorySchema);
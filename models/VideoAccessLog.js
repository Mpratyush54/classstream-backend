const mongoose = require("mongoose");

const VideoAccessLogSchema = new mongoose.Schema({
    videoId: { type: String, required: true },
    username: { type: String, required: true },
    userType: { type: String, enum: ["teacher", "student"], required: true },
    quality: { type: String, required: true },
    kid: { type: String, required: true },
    encKey: { type: String, required: true },
    ipAddress: { type: String },
    userAgent: { type: String },
    action: { type: String, enum: ["requested", "accessed", "expired"], default: "accessed" },
    timestamp: { type: Date, default: Date.now },
});

module.exports =
    mongoose.models.VideoAccessLog || mongoose.model("VideoAccessLog", VideoAccessLogSchema);
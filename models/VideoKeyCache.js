const mongoose = require("mongoose");

const VideoKeyCacheSchema = new mongoose.Schema({
    videoId: { type: String, required: true },
    quality: { type: String, required: true },
    kid: { type: String, required: true, unique: true },
    key: { type: String, required: true },
    expiresAt: { type: Date, required: true },
});

module.exports = mongoose.model("VideoKeyCache", VideoKeyCacheSchema);
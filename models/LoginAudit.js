const mongoose = require('mongoose');

const SessionLogSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String },
    class: { type: String },

    // Device info 🔽
    deviceId: { type: String },
    deviceName: { type: String },
    platform: { type: String },
    browser: { type: String },
    appVersion: { type: String },

    ipAddress: { type: String },
    userAgent: { type: String },

    query_token: { type: Number },
    jwt: { type: String },
    action: { type: String, enum: ['login', 'logout', 'refresh'], required: true },
    status: { type: String, enum: ['active', 'revoked'], default: 'active' },
    message: { type: String },
    timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('SessionLog', SessionLogSchema);
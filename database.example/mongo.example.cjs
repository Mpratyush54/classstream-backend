// LOCAL DEV EXAMPLE ONLY — copy to database/mongo.cjs for local runs.
// Production database/ stays on the server (gitignored) — never commit real URIs.
const mongoose = require('mongoose');

const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/school_dev?authSource=admin';

mongoose.connect(uri).then(
  () => console.log('[mongo] connected (local dev)'),
  (err) => console.warn('[mongo] connection failed (local dev, continuing):', err.message)
);

module.exports = mongoose;

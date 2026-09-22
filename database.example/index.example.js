// LOCAL DEV EXAMPLE ONLY — copy to database/index.js for local runs.
// Production database/ stays on the server (gitignored) — never commit real credentials.
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.host || 'localhost',
  user: process.env.user || 'root',
  password: process.env.password || '',
  database: process.env.database || 'school',
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;

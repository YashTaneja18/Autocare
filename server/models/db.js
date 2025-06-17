// server/models/db.js
const mysql = require('mysql2/promise');

// 1.  Read connection details from .env
const {
  DB_HOST,
  DB_USER,
  DB_PASS,
  DB_NAME,
  DB_PORT = 3306,        // default MySQL port
} = process.env;

// 2.  Create a connection pool (better than a single connection)
const pool = mysql.createPool({
  host:            DB_HOST,
  user:            DB_USER,
  password:        DB_PASS,
  database:        DB_NAME,
  port:            DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// 3.  Tiny helper to test the connection at server startup
(async () => {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    console.log('✅ MySQL pool connected.');
    conn.release();
  } catch (err) {
    console.error('❌ MySQL connection failed:', err.message);
  }
})();

module.exports = pool;

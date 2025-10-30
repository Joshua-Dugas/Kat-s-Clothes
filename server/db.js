require("dotenv").config();
const mysql = require('mysql2/promise');

console.log("DATABASE_URL:", process.env.DATABASE_URL);

try {

  const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    socketPath: process.env.DB_SOCKET_PATH, // Use environment variable
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

  const pool = mysql.createPool(config);

  (async () => {
    try {
      const conn = await pool.getConnection();
      console.log("DB CONNECTED: SUCCESS");
      conn.release();
    } catch (err) {
      console.error("DB CONNECTION FAILED:");
      console.error("   Message:", err.message);
      console.error("   Code:", err.code);
      console.error("   Stack:", err.stack);
    }
  })();

  module.exports = pool;
} catch (err) {
  console.error("URL PARSE FAILED:", err.message);
}
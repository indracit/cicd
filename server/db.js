const mysql = require('mysql2/promise');
const crypto = require('crypto');
const dotenv = require('dotenv');
dotenv.config();


const {
  DB_HOST = '172.22.0.3',
  DB_USER = 'cicduser',
  DB_PASSWORD = 'ArR68MdF2jYwGidk',
  DB_NAME = 'cicddb',
  DB_PORT = '3306'
} = process.env;

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function createPool() {
  // Ensure database exists first
  const tmpConn = await mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    port: DB_PORT,
    multipleStatements: true,
  });
  await tmpConn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
  await tmpConn.end();

  const pool = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
  return pool;
}

async function init(defaultUser, defaultPass) {
  const pool = await createPool();

  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS \`user\` (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `;

  await pool.query(createTableSQL);

  if (defaultUser && defaultPass) {
    const hashed = hashPassword(defaultPass);
    // Insert default user or update password if username exists
    await pool.query(
      'INSERT INTO `user` (username, password) VALUES (?, ?) ON DUPLICATE KEY UPDATE password = VALUES(password)',
      [defaultUser, hashed]
    );
  }

  return { pool, hashPassword };
}

module.exports = { init };

require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

let pool;

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Auth endpoint: verifies username/password from DB and returns JWT
app.post('/auth', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ success: false, error: 'username and password required' });
    const [rows] = await pool.query('SELECT id, username, password FROM `user` WHERE username = ?', [username]);
    if (!rows || rows.length === 0) return res.status(401).json({ success: false, error: 'invalid credentials' });
    const user = rows[0];
    const hashed = require('crypto').createHash('sha256').update(password).digest('hex');
    if (hashed !== user.password) return res.status(401).json({ success: false, error: 'invalid credentials' });

    const token = jwt.sign({ userId: user.id, username: user.username }, process.env.JWT_SECRET || 'change-me', { expiresIn: '1h' });
    res.json({ success: true, token });
  } catch (err) {
    console.error('Auth error', err);
    res.status(500).json({ success: false, error: 'internal error' });
  }
});

async function start() {
  try {
    const defaultUser = process.env.DEFAULT_USER;
    const defaultPass = process.env.DEFAULT_PASS;
    const initialized = await db.init(defaultUser, defaultPass);
    pool = initialized.pool;

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();

module.exports = app;

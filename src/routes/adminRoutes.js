const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/users', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM users ORDER BY created_at DESC');
    res.json({ users: result.rows });
  } catch(e) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.get('/pending', async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM users WHERE status = 'pending' ORDER BY created_at DESC");
    res.json({ users: result.rows });
  } catch(e) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.post('/approve/:id', async (req, res) => {
  try {
    await db.query("UPDATE users SET status = 'active' WHERE id = $1", [req.params.id]);
    res.json({ message: 'User approved' });
  } catch(e) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.post('/ban/:id', async (req, res) => {
  try {
    await db.query("UPDATE users SET status = 'banned' WHERE id = $1", [req.params.id]);
    res.json({ message: 'User banned' });
  } catch(e) {
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;

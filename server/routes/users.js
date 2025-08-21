const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

// GET /api/users - 获取所有用户
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({ error: '获取用户列表失败' });
  }
});

module.exports = router;
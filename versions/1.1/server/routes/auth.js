const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

// POST /api/login - 用户登录
router.post('/login', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: '用户ID不能为空' });
    }
    
    // 查询用户是否存在
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('用户登录失败:', error);
    res.status(500).json({ error: '登录失败' });
  }
});

module.exports = router;
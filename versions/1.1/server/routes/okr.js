const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

// GET /api/okr-sets - 获取所有OKR周期集合
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM okr_sets ORDER BY "periodId"');
    res.json(result.rows);
  } catch (error) {
    console.error('获取OKR集合失败:', error);
    res.status(500).json({ error: '获取OKR集合失败' });
  }
});

// POST /api/okr-sets - 创建新OKR周期
router.post('/', async (req, res) => {
  try {
    const { periodId, periodName } = req.body;
    
    if (!periodId || !periodName) {
      return res.status(400).json({ error: '周期ID和周期名称不能为空' });
    }
    
    // 检查周期ID是否已存在
    const existingResult = await pool.query('SELECT id FROM okr_sets WHERE "periodId" = $1', [periodId]);
    if (existingResult.rows.length > 0) {
      return res.status(409).json({ error: '周期ID已存在' });
    }
    
    // 创建新周期
    const result = await pool.query(
      'INSERT INTO okr_sets ("periodId", "periodName", okrs) VALUES ($1, $2, $3) RETURNING *',
      [periodId, periodName, JSON.stringify([])]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('创建OKR周期失败:', error);
    res.status(500).json({ error: '创建OKR周期失败' });
  }
});

// PUT /api/okr-sets/:periodId - 更新指定周期的OKR数组
router.put('/:periodId', async (req, res) => {
  try {
    const { periodId } = req.params;
    const { okrs } = req.body;
    
    if (!okrs || !Array.isArray(okrs)) {
      return res.status(400).json({ error: 'OKR数组格式不正确' });
    }
    
    const result = await pool.query(
      'UPDATE okr_sets SET okrs = $1 WHERE "periodId" = $2 RETURNING *',
      [JSON.stringify(okrs), periodId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'OKR周期不存在' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('更新OKR失败:', error);
    res.status(500).json({ error: '更新OKR失败' });
  }
});

module.exports = router;
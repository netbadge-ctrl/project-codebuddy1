const express = require('express');
const db = require('../db');
const router = express.Router();

// GET /api/okr-sets - Get all OKR sets
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM okr_sets ORDER BY periodId DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/okr-sets - Create a new OKR set
router.post('/', async (req, res) => {
  const { periodId, periodName } = req.body;
  if (!periodId || !periodName) {
    return res.status(400).json({ error: 'periodId and periodName are required' });
  }

  try {
    // Check for conflict
    const existing = await db.query('SELECT * FROM okr_sets WHERE periodId = $1', [periodId]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'periodId already exists' });
    }

    const { rows } = await db.query(
      'INSERT INTO okr_sets (periodId, periodName, okrs) VALUES ($1, $2, $3) RETURNING *',
      [periodId, periodName, '[]']
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/okr-sets/:periodId - Update an OKR set
router.put('/:periodId', async (req, res) => {
  const { periodId } = req.params;
  const { okrs, periodName } = req.body; // Assuming the whole OkrSet object is sent

  if (!okrs || !periodName) {
    return res.status(400).json({ error: 'Full OkrSet object is required for update' });
  }

  try {
    const { rows } = await db.query(
      'UPDATE okr_sets SET okrs = $1, periodName = $2 WHERE periodId = $3 RETURNING *',
      [JSON.stringify(okrs), periodName, periodId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'OkrSet not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
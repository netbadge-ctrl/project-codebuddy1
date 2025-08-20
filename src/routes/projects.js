const express = require('express');
const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

const FIELD_TO_CHINESE = {
  name: '项目名称',
  priority: '优先级',
  status: '状态',
  weeklyUpdate: '本周进展',
  productManagers: '产品经理',
  backendDevelopers: '后端开发',
  frontendDevelopers: '前端开发',
  qaTesters: 'QA',
  launchDate: '上线日期',
};

// GET /api/projects - Get all projects
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM projects ORDER BY proposalDate DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects - Create a new project
router.post('/', async (req, res) => {
  const projectData = req.body;

  // Validation
  if (projectData.priority === '部门OKR相关' && (!projectData.keyResultIds || projectData.keyResultIds.length === 0)) {
    return res.status(400).json({ error: '“部门OKR相关”项目必须关联至少一个KR。' });
  }

  // Add creation entry to changeLog
  const creationLog = {
    id: `cl-${uuidv4()}`,
    userId: projectData.productManagers[0]?.userId || 'system', // Assume first PM creates it
    field: '项目',
    oldValue: '',
    newValue: '创建成功',
    changedAt: new Date().toISOString(),
  };

  projectData.changeLog = [creationLog, ...(projectData.changeLog || [])];

  const fields = Object.keys(projectData);
  const values = Object.values(projectData);
  const valuePlaceholders = fields.map((_, i) => `$${i + 1}`).join(', ');

  const queryString = `INSERT INTO projects (${fields.join(', ')}) VALUES (${valuePlaceholders}) RETURNING *`;

  try {
    const { rows } = await db.query(queryString, values);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/projects/:id - Update a project (partial update)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    // Get current project state
    const currentResult = await db.query('SELECT * FROM projects WHERE id = $1', [id]);
    if (currentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    const currentProject = currentResult.rows[0];

    // Validation
    const mergedProject = { ...currentProject, ...updates };
    if (mergedProject.priority === '部门OKR相关' && (!mergedProject.keyResultIds || mergedProject.keyResultIds.length === 0)) {
      return res.status(400).json({ error: '“部门OKR相关”项目必须关联至少一个KR。' });
    }

    // Generate change log entries
    const newChangeLogs = [];
    const actorId = 'system'; // In a real app, this would be the logged-in user's ID

    for (const field in updates) {
      if (FIELD_TO_CHINESE[field] && JSON.stringify(currentProject[field]) !== JSON.stringify(updates[field])) {
        newChangeLogs.push({
          id: `cl-${uuidv4()}`,
          userId: actorId,
          field: FIELD_TO_CHINESE[field],
          oldValue: currentProject[field],
          newValue: updates[field],
          changedAt: new Date().toISOString(),
        });
      }
    }

    // Prepend new logs to existing ones
    const finalChangeLog = [...newChangeLogs, ...currentProject.changeLog];
    updates.changeLog = finalChangeLog;

    const updateFields = Object.keys(updates).map((key, i) => `${key} = $${i + 1}`).join(', ');
    const updateValues = Object.values(updates);

    const queryString = `UPDATE projects SET ${updateFields} WHERE id = $${updateValues.length + 1} RETURNING *`;
    const { rows } = await db.query(queryString, [...updateValues, id]);

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/projects/:id - Delete a project
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM projects WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
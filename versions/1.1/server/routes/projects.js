const express = require('express');
const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// 字段名映射（用于变更记录）
const FIELD_NAME_MAP = {
  name: '项目名称',
  priority: '优先级',
  status: '状态',
  weeklyUpdate: '本周进展',
  productManagers: '产品经理',
  backendDevelopers: '后端开发',
  frontendDevelopers: '前端开发',
  qaTesters: '测试人员',
  launchDate: '上线日期'
};

// 验证部门OKR相关项目的KR关联
function validateOkrRequirement(priority, keyResultIds) {
  if (priority === '部门OKR相关' && (!keyResultIds || keyResultIds.length === 0)) {
    return '"部门OKR相关"项目必须关联至少一个KR才能保存。';
  }
  return null;
}

// 创建变更记录
function createChangeLogEntry(userId, field, oldValue, newValue) {
  return {
    id: uuidv4(),
    userId,
    field: FIELD_NAME_MAP[field] || field,
    oldValue,
    newValue,
    changedAt: new Date().toISOString()
  };
}

// GET /api/projects - 获取所有项目
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM projects 
      ORDER BY "createdAt" DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('获取项目列表失败:', error);
    res.status(500).json({ error: '获取项目列表失败' });
  }
});

// POST /api/projects - 创建新项目
router.post('/', async (req, res) => {
  try {
    const projectData = req.body;
    const { userId = 'u1' } = req.body; // 默认用户ID，实际应从认证中获取
    
    // 验证部门OKR相关项目的KR关联
    const validationError = validateOkrRequirement(projectData.priority, projectData.keyResultIds);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }
    
    const projectId = uuidv4();
    const createdAt = new Date().toISOString();
    
    // 创建项目创建的变更记录
    const changeLog = [createChangeLogEntry(userId, '项目创建', null, '项目已创建')];
    
    const result = await pool.query(`
      INSERT INTO projects (
        id, name, priority, "businessProblem", "keyResultIds", status,
        "productManagers", "backendDevelopers", "frontendDevelopers", "qaTesters",
        "proposalDate", "launchDate", followers, "weeklyUpdate", "lastWeekUpdate",
        comments, "changeLog"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *
    `, [
      projectId,
      projectData.name,
      projectData.priority,
      projectData.businessProblem || null,
      projectData.keyResultIds || [],
      projectData.status,
      JSON.stringify(projectData.productManagers || []),
      JSON.stringify(projectData.backendDevelopers || []),
      JSON.stringify(projectData.frontendDevelopers || []),
      JSON.stringify(projectData.qaTesters || []),
      projectData.proposalDate || null,
      projectData.launchDate || null,
      projectData.followers || [],
      projectData.weeklyUpdate || null,
      projectData.lastWeekUpdate || null,
      JSON.stringify([]),
      JSON.stringify(changeLog)
    ]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('创建项目失败:', error);
    res.status(500).json({ error: '创建项目失败' });
  }
});

// PUT /api/projects/:id - 更新项目
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const { userId = 'u1' } = req.body; // 默认用户ID，实际应从认证中获取
    
    // 获取当前项目数据
    const currentResult = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
    if (currentResult.rows.length === 0) {
      return res.status(404).json({ error: '项目不存在' });
    }
    
    const currentProject = currentResult.rows[0];
    
    // 合并当前数据和更新数据
    const mergedData = { ...currentProject, ...updateData };
    
    // 验证部门OKR相关项目的KR关联
    const validationError = validateOkrRequirement(mergedData.priority, mergedData.keyResultIds);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }
    
    // 生成变更记录
    const changeLogEntries = [];
    const trackableFields = ['name', 'priority', 'status', 'weeklyUpdate', 'productManagers', 'backendDevelopers', 'frontendDevelopers', 'qaTesters', 'launchDate'];
    
    for (const field of trackableFields) {
      if (updateData.hasOwnProperty(field)) {
        const oldValue = currentProject[field];
        const newValue = updateData[field];
        
        // 对于JSON字段，需要比较字符串化后的值
        const oldValueStr = typeof oldValue === 'object' ? JSON.stringify(oldValue) : oldValue;
        const newValueStr = typeof newValue === 'object' ? JSON.stringify(newValue) : newValue;
        
        if (oldValueStr !== newValueStr) {
          changeLogEntries.push(createChangeLogEntry(userId, field, oldValue, newValue));
        }
      }
    }
    
    // 更新变更记录
    let updatedChangeLog = [...(currentProject.changeLog || [])];
    if (changeLogEntries.length > 0) {
      updatedChangeLog = [...changeLogEntries, ...updatedChangeLog];
    }
    
    // 构建更新查询
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;
    
    for (const [key, value] of Object.entries(updateData)) {
      if (key !== 'userId' && key !== 'id') {
        updateFields.push(`"${key}" = $${paramIndex}`);
        if (typeof value === 'object' && value !== null) {
          updateValues.push(JSON.stringify(value));
        } else {
          updateValues.push(value);
        }
        paramIndex++;
      }
    }
    
    // 添加变更记录更新
    updateFields.push(`"changeLog" = $${paramIndex}`);
    updateValues.push(JSON.stringify(updatedChangeLog));
    paramIndex++;
    
    // 添加ID参数
    updateValues.push(id);
    
    const updateQuery = `
      UPDATE projects 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    
    const result = await pool.query(updateQuery, updateValues);
    res.json(result.rows[0]);
    
  } catch (error) {
    console.error('更新项目失败:', error);
    res.status(500).json({ error: '更新项目失败' });
  }
});

// DELETE /api/projects/:id - 删除项目
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM projects WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '项目不存在' });
    }
    
    res.json({ message: '项目删除成功', id });
  } catch (error) {
    console.error('删除项目失败:', error);
    res.status(500).json({ error: '删除项目失败' });
  }
});

module.exports = router;

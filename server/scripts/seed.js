require('dotenv').config();
const { pool } = require('../config/database');
const { initDatabase } = require('./initDatabase');
const { ALL_USERS, OKR_SETS, PROJECTS } = require('../constants/initialData');
const { v4: uuidv4 } = require('uuid');

async function seedDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('开始数据填充...');
    
    // 先初始化数据库结构
    await initDatabase();
    
    // 清空现有数据
    await client.query('DELETE FROM projects');
    await client.query('DELETE FROM okr_sets');
    await client.query('DELETE FROM users');
    
    // 填充用户数据
    console.log('填充用户数据...');
    for (const user of ALL_USERS) {
      await client.query(
        'INSERT INTO users (id, name, "avatarUrl") VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING',
        [user.id, user.name, user.avatarUrl]
      );
    }
    
    // 填充OKR数据
    console.log('填充OKR数据...');
    for (const okrSet of OKR_SETS) {
      await client.query(
        'INSERT INTO okr_sets ("periodId", "periodName", okrs) VALUES ($1, $2, $3) ON CONFLICT ("periodId") DO NOTHING',
        [okrSet.periodId, okrSet.periodName, JSON.stringify(okrSet.okrs)]
      );
    }
    
    // 填充项目数据
    console.log('填充项目数据...');
    for (const project of PROJECTS) {
      const projectId = uuidv4();
      const createdAt = new Date().toISOString();
      
      // 创建项目创建的变更记录
      const changeLog = [{
        id: uuidv4(),
        userId: 'u1', // 假设是第一个用户创建的
        field: '项目创建',
        oldValue: null,
        newValue: '项目已创建',
        changedAt: createdAt
      }];
      
      await client.query(`
        INSERT INTO projects (
          id, name, priority, "businessProblem", "keyResultIds", status,
          "productManagers", "backendDevelopers", "frontendDevelopers", "qaTesters",
          "proposalDate", "launchDate", followers, "weeklyUpdate", "lastWeekUpdate",
          comments, "changeLog"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      `, [
        projectId,
        project.name,
        project.priority,
        project.businessProblem,
        project.keyResultIds,
        project.status,
        JSON.stringify(project.productManagers || []),
        JSON.stringify(project.backendDevelopers || []),
        JSON.stringify(project.frontendDevelopers || []),
        JSON.stringify(project.qaTesters || []),
        project.proposalDate,
        project.launchDate,
        project.followers,
        project.weeklyUpdate,
        project.lastWeekUpdate,
        JSON.stringify([]), // 空评论数组
        JSON.stringify(changeLog)
      ]);
    }
    
    console.log('数据填充完成');
    
  } catch (error) {
    console.error('数据填充失败:', error);
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('数据填充成功');
      process.exit(0);
    })
    .catch((error) => {
      console.error('数据填充失败:', error);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
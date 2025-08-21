const { pool } = require('../config/database');

async function weeklyProgressTransfer() {
  const client = await pool.connect();
  
  try {
    console.log('开始执行每周进展结转任务...');
    
    // 查询所有有本周进展的项目
    const result = await client.query(`
      SELECT id, "weeklyUpdate"
      FROM projects 
      WHERE "weeklyUpdate" IS NOT NULL AND "weeklyUpdate" != ''
    `);
    
    let transferCount = 0;
    
    for (const project of result.rows) {
      // 将本周进展移动到上周进展，并清空本周进展
      await client.query(`
        UPDATE projects 
        SET "lastWeekUpdate" = $1, "weeklyUpdate" = NULL
        WHERE id = $2
      `, [project.weeklyUpdate, project.id]);
      
      transferCount++;
    }
    
    console.log(`成功结转 ${transferCount} 个项目的进展`);
    
  } catch (error) {
    console.error('每周进展结转任务执行失败:', error);
  } finally {
    client.release();
  }
}

module.exports = {
  weeklyProgressTransfer
};
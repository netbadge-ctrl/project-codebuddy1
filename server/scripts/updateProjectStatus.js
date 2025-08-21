require('dotenv').config({ path: '../.env' });
const { Pool } = require('pg');

// 直接使用环境变量创建连接池
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function updateProjectStatus() {
  const client = await pool.connect();
  
  try {
    console.log('开始更新项目状态...');
    
    // 1. 删除旧的枚举类型并创建新的
    await client.query('BEGIN');
    
    // 临时修改所有使用该枚举的列为text类型
    await client.query(`
      ALTER TABLE projects 
      ALTER COLUMN status TYPE text;
    `);
    
    // 删除旧的枚举类型
    await client.query('DROP TYPE IF EXISTS project_status CASCADE;');
    
    // 创建新的枚举类型
    await client.query(`
      CREATE TYPE project_status AS ENUM (
        '未开始', '需求讨论', '需求完成', '待开发', '开发中', '待测试', '测试中', '测试完成待上线', '已上线'
      );
    `);
    
    // 2. 更新现有项目的状态映射
    const statusMapping = {
      '规划中': '需求讨论',
      '进行中': '开发中',
      '已完成': '已上线',
      '暂停': '未开始',
      '测试': '测试中'
    };
    
    // 批量更新状态
    for (const [oldStatus, newStatus] of Object.entries(statusMapping)) {
      await client.query(
        'UPDATE projects SET status = $1 WHERE status = $2',
        [newStatus, oldStatus]
      );
    }
    
    // 3. 更新具体项目数据
    const projectUpdates = [
      { name: 'Q3 用户增长计划', status: '开发中' },
      { name: '数据中台建设', status: '测试中' },
      { name: '管理后台 V2.0', status: '需求讨论' },
      { name: 'AI智能客服机器人', status: '开发中' },
      { name: '管网2024版改版', status: '待测试' },
      { name: '支付系统重构', status: '已上线' }
    ];
    
    for (const update of projectUpdates) {
      await client.query(
        'UPDATE projects SET status = $1 WHERE name = $2',
        [update.status, update.name]
      );
    }
    
    // 4. 将列类型改回枚举类型
    await client.query(`
      ALTER TABLE projects 
      ALTER COLUMN status TYPE project_status USING status::project_status;
    `);
    
    await client.query('COMMIT');
    console.log('项目状态更新完成！');
    
    // 5. 验证更新结果
    const result = await client.query('SELECT name, status FROM projects ORDER BY name');
    console.log('更新后的项目状态：');
    result.rows.forEach(row => {
      console.log(`- ${row.name}: ${row.status}`);
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('更新项目状态失败:', error);
    throw error;
  } finally {
    client.release();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  updateProjectStatus()
    .then(() => {
      console.log('项目状态更新脚本执行完成');
      process.exit(0);
    })
    .catch(error => {
      console.error('脚本执行失败:', error);
      process.exit(1);
    });
}

module.exports = { updateProjectStatus };
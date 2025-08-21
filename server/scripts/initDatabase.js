const { pool } = require('../config/database');

async function initDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('开始初始化数据库...');
    
    // 创建枚举类型
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE project_status AS ENUM (
          '未开始', '需求讨论', '需求完成', '待开发', '开发中', '待测试', '测试中', '测试完成待上线', '已上线'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE project_priority AS ENUM (
          '部门OKR相关', '个人OKR相关', '临时重要需求', '日常需求'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    // 创建用户表
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        "avatarUrl" TEXT NOT NULL
      );
    `);
    
    // 创建OKR集合表
    await client.query(`
      CREATE TABLE IF NOT EXISTS okr_sets (
        "periodId" TEXT PRIMARY KEY,
        "periodName" TEXT NOT NULL,
        okrs JSONB NOT NULL DEFAULT '[]'
      );
    `);
    
    // 创建项目表
    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        priority project_priority NOT NULL,
        "businessProblem" TEXT,
        "keyResultIds" TEXT[] DEFAULT '{}',
        "weeklyUpdate" TEXT,
        "lastWeekUpdate" TEXT,
        status project_status NOT NULL,
        "productManagers" JSONB DEFAULT '[]',
        "backendDevelopers" JSONB DEFAULT '[]',
        "frontendDevelopers" JSONB DEFAULT '[]',
        "qaTesters" JSONB DEFAULT '[]',
        "proposalDate" DATE,
        "launchDate" DATE,
        followers TEXT[] DEFAULT '{}',
        comments JSONB DEFAULT '[]',
        "changeLog" JSONB DEFAULT '[]',
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // 创建更新时间触发器
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW."updatedAt" = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);
    
    await client.query(`
      DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
      CREATE TRIGGER update_projects_updated_at
        BEFORE UPDATE ON projects
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);
    
    console.log('数据库初始化完成');
    
  } catch (error) {
    console.error('数据库初始化失败:', error);
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log('数据库初始化成功');
      process.exit(0);
    })
    .catch((error) => {
      console.error('数据库初始化失败:', error);
      process.exit(1);
    });
}

module.exports = { initDatabase };
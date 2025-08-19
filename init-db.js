import pool from './db.js';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initializeDatabase() {
  try {
    console.log('开始初始化数据库...');
    
    // 读取SQL脚本
    const sqlScript = await fs.readFile(path.join(__dirname, 'db-setup.sql'), 'utf8');
    
    // 分割SQL语句
    const statements = sqlScript
      .split(';')
      .filter(statement => statement.trim() !== '');
    
    const connection = await pool.getConnection();
    
    try {
      // 执行每个SQL语句
      for (const statement of statements) {
        if (statement.trim()) {
          await connection.query(statement);
          console.log('执行SQL语句成功');
        }
      }
      
      console.log('数据库初始化完成！');
    } catch (error) {
      console.error('执行SQL语句时出错:', error);
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('初始化数据库时出错:', error);
  } finally {
    // 关闭连接池
    await pool.end();
  }
}

initializeDatabase();
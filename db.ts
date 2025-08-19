import mysql from 'mysql2/promise';

// 从环境变量中读取数据库配置
const dbConfig = {
  host: process.env.DB_HOST || '120.92.76.6',
  port: parseInt(process.env.DB_PORT || '30884'),
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'Kingsoft0531',
  database: process.env.DB_NAME || 'project_management'
};

// 创建连接池
const pool = mysql.createPool(dbConfig);

export default pool;

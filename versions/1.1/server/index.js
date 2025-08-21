const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();

const { pool } = require('./config/database');
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const okrRoutes = require('./routes/okr');
const projectRoutes = require('./routes/projects');
const { weeklyProgressTransfer } = require('./services/cronJobs');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 路由
app.use('/api/users', userRoutes);
app.use('/api', authRoutes);
app.use('/api/okr-sets', okrRoutes);
app.use('/api/projects', projectRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 每周一凌晨1点执行进展结转任务
cron.schedule('0 1 * * 1', () => {
  console.log('执行每周进展结转任务...');
  weeklyProgressTransfer();
}, {
  timezone: "UTC"
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器内部错误' });
});

app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});
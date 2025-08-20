const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const userRoutes = require('./routes/users');
const okrSetsRoutes = require('./routes/okrSets');
const projectRoutes = require('./routes/projects');
const { startCronJobs } = require('./cron_jobs');

app.use('/api/users', userRoutes);
app.use('/api/okr-sets', okrSetsRoutes);
app.use('/api/projects', projectRoutes);

app.get('/', (req, res) => {
  res.send('Project Management API is running!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  startCronJobs();
});

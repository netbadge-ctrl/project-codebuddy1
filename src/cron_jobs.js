const cron = require('node-cron');
const db = require('./db');

const weeklyRollover = async () => {
  console.log('Running weekly rollover job...');
  try {
    const { rows: projects } = await db.query("SELECT id, weeklyUpdate FROM projects WHERE weeklyUpdate IS NOT NULL AND weeklyUpdate != ''");

    for (const project of projects) {
      await db.query('UPDATE projects SET lastWeekUpdate = $1, weeklyUpdate = $2 WHERE id = $3', [
        project.weeklyUpdate,
        '',
        project.id,
      ]);
      console.log(`Rolled over weekly update for project ${project.id}`);
    }
    console.log('Weekly rollover job finished.');
  } catch (error) {
    console.error('Error during weekly rollover:', error);
  }
};

// Schedule to run every Monday at 1:00 AM UTC
const startCronJobs = () => {
  cron.schedule('0 1 * * 1', weeklyRollover);
  console.log('Cron job for weekly rollover scheduled.');
};

module.exports = { startCronJobs };
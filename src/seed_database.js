const db = require('./db');
const { ALL_USERS, OKR_SETS, PROJECTS } = require('./constants');

const seedDatabase = async () => {
  try {
    console.log('Starting to seed database...');

    // Seed users
    console.log('Seeding users...');
    for (const user of ALL_USERS) {
      await db.query('INSERT INTO users (id, name, avatarUrl) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING', [
        user.id,
        user.name,
        user.avatarUrl,
      ]);
    }
    console.log('Users seeded.');

    // Seed OKR sets
    console.log('Seeding OKR sets...');
    for (const set of OKR_SETS) {
      await db.query(
        'INSERT INTO okr_sets (periodId, periodName, okrs) VALUES ($1, $2, $3) ON CONFLICT (periodId) DO NOTHING',
        [set.periodId, set.periodName, JSON.stringify(set.okrs)]
      );
    }
    console.log('OKR sets seeded.');

    // Seed projects
    console.log('Seeding projects...');
    for (const project of PROJECTS) {
      await db.query(
        `INSERT INTO projects (name, priority, businessProblem, keyResultIds, weeklyUpdate, lastWeekUpdate, status, productManagers, backendDevelopers, frontendDevelopers, qaTesters, proposalDate, launchDate, followers, comments, changeLog)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
        [
          project.name,
          project.priority,
          project.businessProblem,
          project.keyResultIds,
          project.weeklyUpdate,
          project.lastWeekUpdate,
          project.status,
          JSON.stringify(project.productManagers),
          JSON.stringify(project.backendDevelopers),
          JSON.stringify(project.frontendDevelopers),
          JSON.stringify(project.qaTesters),
          project.proposalDate,
          project.launchDate,
          project.followers,
          JSON.stringify(project.comments),
          JSON.stringify(project.changeLog),
        ]
      );
    }
    console.log('Projects seeded.');

    console.log('Database seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding the database:', error);
  } finally {
    // The pool will be closed by the application's lifecycle
  }
};

seedDatabase();
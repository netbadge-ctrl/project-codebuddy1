const fs = require('fs');
const path = require('path');
const db = require('./db');

const setupDatabase = async () => {
  try {
    const sql = fs.readFileSync(path.join(__dirname, '../db_init.sql')).toString();
    console.log('Executing SQL script to initialize database...');
    await db.query(sql);
    console.log('Database initialization successful.');
  } catch (error) {
    console.error('Error setting up the database:', error);
  } finally {
    // The pool will be closed by the application's lifecycle, no need to end it here.
  }
};

setupDatabase();
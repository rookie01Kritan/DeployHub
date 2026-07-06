// backend/src/config/db.js
//
// Creates one shared connection pool for the entire application.
// Every repository file imports `pool` from here, rather than each
// creating its own separate connection.

require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = pool;
//this file serves as a connection pool to the database and the entire backend. instead of opening new databse connection every time an API is made, where this pool is used to manage and create new connections to the database.

const { Pool } = require("pg");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Handles SSL encryption required by hosted Postgres providers
  },
});

// Exporting a helper query function
module.exports = {
  query: (text, params) => pool.query(text, params),
};

import pool from "../src/config/database.js";

try {
  if (!process.env.DATABASE_URL?.trim()) {
    throw new Error("DATABASE_URL is not set. Configure it in server/.env.");
  }

  await pool.query("SELECT 1");
  console.log("Database connection successful.");
} catch (error) {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`Database connection failed: ${message}`);
  process.exitCode = 1;
} finally {
  await pool.end();
}

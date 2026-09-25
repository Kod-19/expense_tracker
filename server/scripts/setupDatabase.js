import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pool from "../src/config/database";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const schemaPath = path.join(__dirname, "../database/schema.sql");

const schema = fs.readFileSync(schemaPath, "utf-8");

async function setupDatabase() {
  try {
    await pool.query(schema);

    console.log("Database schema applied successfully.");
  } catch (error) {
    console.error("Database setup failed:");
    console.error(error);
  } finally {
    await pool.end();
  }
}

setupDatabase();
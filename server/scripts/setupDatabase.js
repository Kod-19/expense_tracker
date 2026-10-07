import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import pool from "../src/config/database.js";

const migrationDirectory = fileURLToPath(new URL("../migrations/", import.meta.url));

try {
  if (!process.env.DATABASE_URL?.trim()) {
    throw new Error("DATABASE_URL is not set. Configure it in server/.env.");
  }

  const migrationFiles = (await readdir(migrationDirectory))
    .filter((fileName) => /^\d+_.+\.sql$/.test(fileName))
    .sort();
  if (migrationFiles.length === 0) {
    throw new Error("No SQL migration files were found in server/migrations.");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    for (const fileName of migrationFiles) {
      const migration = await readFile(
        new URL(`../migrations/${fileName}`, import.meta.url),
        "utf8"
      );
      await client.query(migration);
    }
    await client.query("COMMIT");
    console.log(`Database setup completed successfully (${migrationFiles.length} migrations).`);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
} catch (error) {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`Transaction database setup failed: ${message}`);
  process.exitCode = 1;
} finally {
  await pool.end();
}

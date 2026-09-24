import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import pool from './config/database.js';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL,
  })
);

// Parse JSON request bodies
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Expense Tracker API is running",
  });
});

app.get("/api/health/database", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      success: true,
      message: "Database connection successful",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error("Database connection error:", error);

    res.status(500).json({
      success:false,
      message: "Databse connection failed",
    });
  }
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
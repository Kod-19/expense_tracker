import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import pool from "./config/database.js";
import errorHandler from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

export const app = express();

const PORT = process.env.PORT || 5000;

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
  })
);

app.use(express.json());

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
      success: false,
      message: "Database connection failed",
    });
  }
});

app.use("/api/auth", authRoutes);

//Error-handling middleware
app.use(errorHandler);

//404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

if (process.env.NODE_ENV !== "test") {
  const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(
        `Port ${PORT} is already in use. Close the other server instance or set a different PORT.`
      );
      process.exit(1);
    }

    console.error("Server startup error:", error);
    process.exit(1);
  });
}

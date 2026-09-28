import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import pool from "../config/database.js";

const router = express.Router();

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT id, full_name, created_at, updated_at
      FROM public.profiles
      WHERE id = $1
      `,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    res.json({
      success: true,
      profile: result.rows[0],
    });
  } catch (error) {
    console.error("Profile error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve profile",
    });
  }
});

export default router;
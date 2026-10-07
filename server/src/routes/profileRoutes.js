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

router.patch("/me", authMiddleware, async (req, res) => {
  const fullName = typeof req.body?.full_name === "string" ? req.body.full_name.trim() : "";

  if (!fullName || fullName.length > 100) {
    return res.status(400).json({
      success: false,
      message: "Full name is required and must be 100 characters or fewer",
    });
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO public.profiles (id, full_name)
      VALUES ($1, $2)
      ON CONFLICT (id) DO UPDATE
      SET full_name = EXCLUDED.full_name,
          updated_at = NOW()
      RETURNING id, full_name, created_at, updated_at
      `,
      [req.user.id, fullName]
    );

    res.json({
      success: true,
      profile: result.rows[0],
    });
  } catch (error) {
    console.error("Profile update error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
});

export default router;
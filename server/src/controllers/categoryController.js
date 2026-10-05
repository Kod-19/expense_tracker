import pool from "../config/database.js";
import { validateCategoryInput } from "../utils/validation.js";

export const createCategory = async (req, res) => {
  try {
    const { name, type } = req.body;
    const userId = req.user.id;
    const validation = validateCategoryInput({ name, type });

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.errors.join(", "),
      });
    }

    // Create category
    const result = await pool.query(
      `
      INSERT INTO public.categories (user_id, name, type)
      VALUES ($1, $2, $3)
      RETURNING id, user_id, name, type, created_at
      `,
      [userId, name, type]
    );

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category: result.rows[0],
    });
  } catch (error) {
    console.error("Create category error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create category",
    });
  }
};

export const getCategories = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT id, user_id, name, type, created_at
      FROM public.categories
      WHERE user_id = $1
      ORDER BY created_at DESC
      `,
      [userId]
    );

    res.status(200).json({
      success: true,
      categories: result.rows,
    });
  } catch (error) {
    console.error("Get categories error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve categories",
    });
  }
};

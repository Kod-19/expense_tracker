import pool from "../config/database.js";
import { validateCategoryInput } from "../utils/validation.js";

const respondWithCategoryError = (res, error, operation) => {
  console.error(`${operation} category error:`, error);

  if (error?.code === "42P01") {
    return res.status(503).json({
      success: false,
      message: "The categories table is not set up in the database.",
    });
  }

  if (error?.code === "23505") {
    return res.status(409).json({
      success: false,
      message: "A category with that name and type already exists.",
    });
  }
  if (error?.code === "23503") {
    return res.status(409).json({
      success: false,
      message: "This category is assigned to a budget and cannot be deleted until that budget is removed.",
    });
  }

  return res.status(500).json({
    success: false,
    message: `Failed to ${operation} categor${operation === "retrieve" ? "ies" : "y"}`,
  });
};

const getCategoryInput = (body) => {
  const validation = validateCategoryInput(body);
  if (!validation.valid) {
    return { error: validation.errors.join(", ") };
  }

  return {
    value: {
      name: String(body.name).trim(),
      type: String(body.type).trim().toLowerCase(),
    },
  };
};

export const createCategory = async (req, res) => {
  const { error, value } = getCategoryInput(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error });
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO public.categories (user_id, name, type)
      VALUES ($1, $2, $3)
      RETURNING id, user_id, name, type, created_at
      `,
      [req.user.id, value.name, value.type]
    );

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      category: result.rows[0],
    });
  } catch (error) {
    return respondWithCategoryError(res, error, "create");
  }
};

export const getCategories = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT id, user_id, name, type, created_at
      FROM public.categories
      WHERE user_id = $1
      ORDER BY type ASC, name ASC
      `,
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      categories: result.rows,
    });
  } catch (error) {
    return respondWithCategoryError(res, error, "retrieve");
  }
};

export const updateCategory = async (req, res) => {
  if (!req.params.id || req.params.id.length > 64) {
    return res.status(400).json({ success: false, message: "A valid category ID is required" });
  }

  const { error, value } = getCategoryInput(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error });
  }

  try {
    const result = await pool.query(
      `
      UPDATE public.categories
      SET name = $3, type = $4
      WHERE id = $1 AND user_id = $2
      RETURNING id, user_id, name, type, created_at
      `,
      [req.params.id, req.user.id, value.name, value.type]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category: result.rows[0],
    });
  } catch (error) {
    return respondWithCategoryError(res, error, "update");
  }
};

export const deleteCategory = async (req, res) => {
  if (!req.params.id || req.params.id.length > 64) {
    return res.status(400).json({ success: false, message: "A valid category ID is required" });
  }

  try {
    const result = await pool.query(
      "DELETE FROM public.categories WHERE id = $1 AND user_id = $2 RETURNING id",
      [req.params.id, req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    return respondWithCategoryError(res, error, "delete");
  }
};

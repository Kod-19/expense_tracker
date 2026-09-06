const db = require("../db/pool");

const getCategories = async (req, res) => {
  try {
    const { rows } = await db.query(
      "SELECT id, name, type FROM categories WHERE user_id = $1 ORDER BY name",
      [req.user.id],
    );
    res.json(rows);
  } catch (err) {
    console.error("Get categories error:", err);
    res.status(500).json({ error: "Failed to fetch categories." });
  }
};

const createCategory = async (req, res) => {
  const { name, type } = req.body;

  if (!name || !type) {
    return res
      .status(400)
      .json({ error: "Please provide a category name and type." });
  }

  try {
    const { rows } = await db.query(
      `INSERT INTO categories (user_id, name, type)
       VALUES ($1, $2, $3)
       RETURNING id, name, type`,
      [req.user.id, name.trim(), type],
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Create category error:", err);
    res.status(500).json({ error: "Failed to create category." });
  }
};

const updateCategory = async (req, res) => {
  const { name, type } = req.body;

  try {
    const { rows } = await db.query(
      `UPDATE categories
       SET name = COALESCE($1, name), type = COALESCE($2, type)
       WHERE id = $3 AND user_id = $4
       RETURNING id, name, type`,
      [name?.trim(), type, req.params.id, req.user.id],
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Category not found." });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Update category error:", err);
    res.status(500).json({ error: "Failed to update category." });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { rows } = await db.query(
      "DELETE FROM categories WHERE id = $1 AND user_id = $2 RETURNING id",
      [req.params.id, req.user.id],
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Category not found." });
    }

    res.status(204).send();
  } catch (err) {
    console.error("Delete category error:", err);
    res.status(500).json({ error: "Cannot delete category in use." });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};

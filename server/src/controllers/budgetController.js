import pool from "../config/database.js";
import { validateBudgetInput } from "../utils/validation.js";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const getBudgetInput = (body) => {
  const validation = validateBudgetInput(body);
  if (!validation.valid) {
    return { error: validation.errors.join(", ") };
  }
  return { value: validation.value };
};

const getExpenseCategoryId = async (userId, categoryName) => {
  const result = await pool.query(
    `
    SELECT id
    FROM public.categories
    WHERE user_id = $1 AND type = 'expense' AND LOWER(name) = LOWER($2)
    LIMIT 1
    `,
    [userId, categoryName]
  );
  return result.rows[0]?.id ?? null;
};

const respondWithBudgetError = (res, error, operation) => {
  console.error(`${operation} budget error:`, error);
  if (error?.code === "42P01") {
    return res.status(503).json({
      success: false,
      message:
        "A required budgets, transactions, or categories table is not set up. Run npm run db:setup from the server directory.",
    });
  }
  if (error?.code === "23505") {
    return res.status(409).json({
      success: false,
      message: "A budget for this category and month already exists.",
    });
  }
  return res.status(500).json({
    success: false,
    message: `Failed to ${operation} budget${operation === "retrieve" ? "s" : ""}`,
  });
};

export const getBudgets = async (req, res) => {
  const month = String(req.query.month ?? "");
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
    return res.status(400).json({
      success: false,
      message: "A valid budget month in YYYY-MM format is required",
    });
  }

  try {
    const result = await pool.query(
      `
      SELECT
        b.id::text AS id,
        c.name AS category,
        TO_CHAR(b.month, 'YYYY-MM') AS month,
        b.amount AS "limit",
        COALESCE(SUM(t.amount), 0) AS spent,
        GREATEST(b.amount - COALESCE(SUM(t.amount), 0), 0) AS remaining
      FROM public.budgets b
      JOIN public.categories c
        ON c.id = b.category_id AND c.user_id = b.user_id
      LEFT JOIN public.transactions t
        ON t.user_id = b.user_id
        AND t.category_id = b.category_id
        AND t.type = 'expense'
        AND t.date >= b.month
        AND t.date < b.month + INTERVAL '1 month'
      WHERE b.user_id = $1 AND b.month = ($2 || '-01')::date
      GROUP BY b.id, c.name, b.month, b.amount
      ORDER BY c.name ASC
      `,
      [req.user.id, month]
    );
    return res.status(200).json({ success: true, budgets: result.rows });
  } catch (error) {
    return respondWithBudgetError(res, error, "retrieve");
  }
};

export const createBudget = async (req, res) => {
  const { error, value } = getBudgetInput(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error });
  }

  try {
    const categoryId = await getExpenseCategoryId(req.user.id, value.category);
    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "Choose an expense category that belongs to your account.",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO public.budgets (user_id, category_id, month, amount)
      VALUES ($1, $2, ($3 || '-01')::date, $4)
      RETURNING id::text AS id, category_id, TO_CHAR(month, 'YYYY-MM') AS month,
                amount AS "limit"
      `,
      [req.user.id, categoryId, value.month, value.limit]
    );
    return res.status(201).json({
      success: true,
      message: "Budget created successfully",
      budget: {
        id: result.rows[0].id,
        category: value.category,
        month: result.rows[0].month,
        limit: result.rows[0].limit,
        spent: "0",
        remaining: result.rows[0].limit,
      },
    });
  } catch (error) {
    return respondWithBudgetError(res, error, "create");
  }
};

export const updateBudget = async (req, res) => {
  if (!UUID_PATTERN.test(String(req.params.id))) {
    return res.status(400).json({ success: false, message: "A valid budget ID is required" });
  }
  const { error, value } = getBudgetInput(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error });
  }

  try {
    const categoryId = await getExpenseCategoryId(req.user.id, value.category);
    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "Choose an expense category that belongs to your account.",
      });
    }

    const result = await pool.query(
      `
      WITH updated AS (
        UPDATE public.budgets
        SET category_id = $3, month = ($4 || '-01')::date,
            amount = $5, updated_at = NOW()
        WHERE id = $1 AND user_id = $2
        RETURNING *
      )
      SELECT
        b.id::text AS id,
        c.name AS category,
        TO_CHAR(b.month, 'YYYY-MM') AS month,
        b.amount AS "limit",
        COALESCE(SUM(t.amount), 0) AS spent,
        GREATEST(b.amount - COALESCE(SUM(t.amount), 0), 0) AS remaining
      FROM updated b
      JOIN public.categories c
        ON c.id = b.category_id AND c.user_id = b.user_id
      LEFT JOIN public.transactions t
        ON t.user_id = b.user_id
        AND t.category_id = b.category_id
        AND t.type = 'expense'
        AND t.date >= b.month
        AND t.date < b.month + INTERVAL '1 month'
      GROUP BY b.id, c.name, b.month, b.amount
      `,
      [req.params.id, req.user.id, categoryId, value.month, value.limit]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Budget not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Budget updated successfully",
      budget: result.rows[0],
    });
  } catch (error) {
    return respondWithBudgetError(res, error, "update");
  }
};

export const deleteBudget = async (req, res) => {
  if (!UUID_PATTERN.test(String(req.params.id))) {
    return res.status(400).json({ success: false, message: "A valid budget ID is required" });
  }

  try {
    const result = await pool.query(
      "DELETE FROM public.budgets WHERE id = $1 AND user_id = $2 RETURNING id",
      [req.params.id, req.user.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Budget not found" });
    }
    return res.status(200).json({ success: true, message: "Budget deleted successfully" });
  } catch (error) {
    return respondWithBudgetError(res, error, "delete");
  }
};

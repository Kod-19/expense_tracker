import pool from "../config/database.js";
import { validateTransactionInput } from "../utils/validation.js";

const transactionFields = `
  t.id::text AS id,
  COALESCE(NULLIF(t.description, ''), 'Transaction') AS name,
  COALESCE(c.name, 'Uncategorized') AS category,
  t.type,
  t.amount,
  t.date,
  t.method,
  t.notes,
  t.created_at
`;

const validateId = (id) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(id)
  );

const getTransactionInput = (body) => {
  const validation = validateTransactionInput(body);
  if (!validation.valid) {
    return { error: validation.errors.join(", ") };
  }

  return { value: validation.value };
};

const getCategoryId = async (userId, category, type) => {
  const result = await pool.query(
    `
    SELECT id
    FROM public.categories
    WHERE user_id = $1 AND type = $2 AND LOWER(name) = LOWER($3)
    LIMIT 1
    `,
    [userId, type, category]
  );
  return result.rows[0]?.id ?? null;
};

const respondWithTransactionError = (res, error, operation) => {
  console.error(`${operation} transaction error:`, error);

  if (error?.code === "42P01") {
    return res.status(503).json({
      success: false,
      message:
        "The transactions table is not set up. Run npm run db:setup from the server directory, then retry.",
    });
  }

  return res.status(500).json({
    success: false,
    message: `Failed to ${operation} transaction${operation === "retrieve" ? "s" : ""}`,
  });
};

export const getTransactions = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT ${transactionFields}
      FROM public.transactions t
      LEFT JOIN public.categories c
        ON c.id = t.category_id AND c.user_id = t.user_id
      WHERE t.user_id = $1
      ORDER BY t.date DESC, t.created_at DESC
      `,
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      transactions: result.rows,
    });
  } catch (error) {
    return respondWithTransactionError(res, error, "retrieve");
  }
};

export const createTransaction = async (req, res) => {
  const { error, value } = getTransactionInput(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error });
  }

  try {
    const categoryId = await getCategoryId(req.user.id, value.category, value.type);
    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "Choose a category of the same type that belongs to your account.",
      });
    }

    const result = await pool.query(
      `
      WITH inserted AS (
        INSERT INTO public.transactions
          (user_id, category_id, type, amount, description, date, method, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      )
      SELECT ${transactionFields}
      FROM inserted t
      LEFT JOIN public.categories c
        ON c.id = t.category_id AND c.user_id = t.user_id
      `,
      [
        req.user.id,
        categoryId,
        value.type,
        value.amount,
        value.name,
        value.date,
        value.method,
        value.notes,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      transaction: result.rows[0],
    });
  } catch (error) {
    return respondWithTransactionError(res, error, "create");
  }
};

export const updateTransaction = async (req, res) => {
  if (!validateId(req.params.id)) {
    return res.status(400).json({ success: false, message: "A valid transaction ID is required" });
  }

  const { error, value } = getTransactionInput(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error });
  }

  try {
    const categoryId = await getCategoryId(req.user.id, value.category, value.type);
    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "Choose a category of the same type that belongs to your account.",
      });
    }

    const result = await pool.query(
      `
      WITH updated AS (
        UPDATE public.transactions
        SET category_id = $3,
            type = $4,
            amount = $5,
            description = $6,
            date = $7,
            method = $8,
            notes = $9,
            updated_at = NOW()
        WHERE id = $1 AND user_id = $2
        RETURNING *
      )
      SELECT ${transactionFields}
      FROM updated t
      LEFT JOIN public.categories c
        ON c.id = t.category_id AND c.user_id = t.user_id
      `,
      [
        req.params.id,
        req.user.id,
        categoryId,
        value.type,
        value.amount,
        value.name,
        value.date,
        value.method,
        value.notes,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Transaction updated successfully",
      transaction: result.rows[0],
    });
  } catch (error) {
    return respondWithTransactionError(res, error, "update");
  }
};

export const deleteTransaction = async (req, res) => {
  if (!validateId(req.params.id)) {
    return res.status(400).json({ success: false, message: "A valid transaction ID is required" });
  }

  try {
    const result = await pool.query(
      "DELETE FROM public.transactions WHERE id = $1 AND user_id = $2 RETURNING id",
      [req.params.id, req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    return respondWithTransactionError(res, error, "delete");
  }
};

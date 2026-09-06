//this file is responsible for handling transaction-related operations, such as adding a new transaction to the database.

const db = require("../db/pool");

const getTransactions = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT t.*, c.name AS category_name
       FROM transactions t
       LEFT JOIN categories c ON c.id = t.category_id
       WHERE t.user_id = $1
       ORDER BY t.transaction_date DESC, t.id DESC`,
      [req.user.id],
    );
    res.json(rows);
  } catch (err) {
    console.error("Get transactions error:", err);
    res.status(500).json({ error: "Failed to fetch transactions." });
  }
};

const addTransaction = async (req, res) => {
  const userId = req.user.id; // Passed down from authMiddleware JWT payload
  const { category_id, amount, type, note, transaction_date } = req.body;

  try {
    const queryText = `
      INSERT INTO transactions (user_id, category_id, amount, type, note, transaction_date)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const values = [userId, category_id, amount, type, note, transaction_date];

    const { rows } = await db.query(queryText, values);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to record transaction." });
  }
};

const updateTransaction = async (req, res) => {
  const { category_id, amount, type, note, transaction_date } = req.body;

  try {
    const { rows } = await db.query(
      `UPDATE transactions
       SET category_id = $1, amount = $2, type = $3, note = $4, transaction_date = $5
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [
        category_id,
        amount,
        type,
        note,
        transaction_date,
        req.params.id,
        req.user.id,
      ],
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Transaction not found." });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Update transaction error:", err);
    res.status(500).json({ error: "Failed to update transaction." });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const { rows } = await db.query(
      "DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING id",
      [req.params.id, req.user.id],
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Transaction not found." });
    }

    res.status(204).send();
  } catch (err) {
    console.error("Delete transaction error:", err);
    res.status(500).json({ error: "Failed to delete transaction." });
  }
};

module.exports = {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
};

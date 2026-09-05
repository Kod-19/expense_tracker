//this file is responsible for handling transaction-related operations, such as adding a new transaction to the database.

const db = require('../db/pool');

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
    res.status(500).json({ error: 'Failed to record transaction.' });
  }
};

module.exports = { addTransaction };
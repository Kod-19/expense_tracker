//this controller handles the report generation for category spending

const db = require('../db/pool');

const getCategorySpending = async (req, res) => {
  const userId = req.user.id;
  const { date } = req.query; // e.g. '2026-09-01'

  try {
    const queryText = `
      SELECT c.name, SUM(t.amount) AS total_spent
      FROM transactions t
      JOIN categories c ON c.id = t.category_id
      WHERE t.user_id = $1
        AND t.type = 'expense'
        AND DATE_TRUNC('month', t.transaction_date) = DATE_TRUNC('month', $2::date)
      GROUP BY c.name
      ORDER BY total_spent DESC;
    `;

    const { rows } = await db.query(queryText, [userId, date]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch spending report.' });
  }
};

module.exports = { getCategorySpending };
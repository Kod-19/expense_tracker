import pool from "../config/database.js";
import {
  generateFinancialInsights,
  parseQuickLog,
  parseReceiptImage,
} from "../services/aiService.js";

const getUserCategories = async (userId) => {
  try {
    const result = await pool.query(
      `
      SELECT id, name, type
      FROM public.categories
      WHERE user_id = $1
      ORDER BY name ASC
      `,
      [userId]
    );
    return result.rows || [];
  } catch (error) {
    console.warn("Could not retrieve categories for AI context:", error.message);
    return [];
  }
};

export const handleQuickLog = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide a description or sentence to parse.",
      });
    }

    if (text.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Quick log text must be 500 characters or fewer.",
      });
    }

    const categories = await getUserCategories(req.user.id);
    const parsedTransaction = await parseQuickLog(text.trim(), categories);

    return res.status(200).json({
      success: true,
      transaction: parsedTransaction,
    });
  } catch (error) {
    console.error("AI quick log error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to parse transaction right now. Please try again or enter details manually.",
    });
  }
};

export const handleReceiptScan = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a receipt image or document.",
      });
    }

    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/heic",
      "application/pdf",
    ];

    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Unsupported file type. Please upload a JPEG, PNG, WEBP, or PDF.",
      });
    }

    const categories = await getUserCategories(req.user.id);
    const parsedTransaction = await parseReceiptImage(
      req.file.buffer,
      req.file.mimetype,
      categories
    );

    return res.status(200).json({
      success: true,
      transaction: parsedTransaction,
    });
  } catch (error) {
    console.error("AI receipt scan error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to extract information from receipt. Please verify image clarity and try again.",
    });
  }
};

export const handleFinancialInsights = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Fetch user's transactions
    const txResult = await pool.query(
      `
      SELECT
        t.type,
        t.amount,
        COALESCE(c.name, 'Uncategorized') AS category
      FROM public.transactions t
      LEFT JOIN public.categories c ON c.id = t.category_id
      WHERE t.user_id = $1
      ORDER BY t.date DESC
      `,
      [userId]
    );

    const transactions = txResult.rows || [];

    let income = 0;
    let expenses = 0;
    const categoryTotals = new Map();

    transactions.forEach((tx) => {
      const amt = Number(tx.amount) || 0;
      if (tx.type === "income") {
        income += amt;
      } else if (tx.type === "expense") {
        expenses += amt;
        const cat = tx.category || "General";
        categoryTotals.set(cat, (categoryTotals.get(cat) || 0) + amt);
      }
    });

    const categoryBreakdown = [...categoryTotals.entries()]
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // 2. Fetch current month budgets
    const currentMonth = new Date().toISOString().slice(0, 7);
    let budgetOverruns = [];

    try {
      const budgetResult = await pool.query(
        `
        SELECT
          b.amount AS limit_amount,
          c.name AS category
        FROM public.budgets b
        JOIN public.categories c ON c.id = b.category_id
        WHERE b.user_id = $1 AND b.month = $2
        `,
        [userId, currentMonth]
      );

      budgetOverruns = (budgetResult.rows || [])
        .map((b) => {
          const spent = categoryTotals.get(b.category) || 0;
          const limit = Number(b.limit_amount) || 0;
          return { category: b.category, spent, limit, over: spent > limit };
        })
        .filter((b) => b.over);
    } catch {
      // Budgets table might not be queried if none exist
    }

    const insights = await generateFinancialInsights({
      income,
      expenses,
      categoryBreakdown,
      budgetOverruns,
      transactionCount: transactions.length,
    });

    return res.status(200).json({
      success: true,
      insights,
    });
  } catch (error) {
    console.error("AI insights error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not generate financial insights at this time.",
    });
  }
};

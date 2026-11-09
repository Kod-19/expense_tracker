import dotenv from "dotenv";
import path from "path";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

dotenv.config();
if (!process.env.GEMINI_API_KEY) {
  dotenv.config({ path: path.resolve(process.cwd(), "server", ".env") });
}

const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in server environment variables.");
  }
  return new GoogleGenerativeAI(apiKey);
};

const transactionSchema = {
  type: SchemaType.OBJECT,
  properties: {
    name: {
      type: SchemaType.STRING,
      description: "Short merchant or transaction title (e.g., 'Starbucks', 'Apartment Rent', 'Freelance Project'). Maximum 80 characters.",
    },
    amount: {
      type: SchemaType.NUMBER,
      description: "Total positive numeric amount. Numbers only, no currency symbols.",
    },
    type: {
      type: SchemaType.STRING,
      enum: ["income", "expense"],
      description: "Whether this transaction is an income or an expense.",
    },
    category: {
      type: SchemaType.STRING,
      description: "The name of the most fitting category from the user's category list.",
    },
    date: {
      type: SchemaType.STRING,
      description: "Transaction date formatted strictly as YYYY-MM-DD.",
    },
    method: {
      type: SchemaType.STRING,
      description: "Payment method used (e.g., 'Card', 'Cash', 'Mobile Money', 'Bank Transfer').",
    },
    notes: {
      type: SchemaType.STRING,
      description: "Any extra notes, items, or context mentioned.",
    },
  },
  required: ["name", "amount", "type", "date"],
};

const insightsSchema = {
  type: SchemaType.OBJECT,
  properties: {
    healthScore: {
      type: SchemaType.NUMBER,
      description: "Financial health score between 0 and 100 based on net savings and spending discipline.",
    },
    status: {
      type: SchemaType.STRING,
      description: "Status label: Excellent, Good, Fair, or Needs Attention.",
    },
    headline: {
      type: SchemaType.STRING,
      description: "A motivational and clear 1-sentence assessment of the user's current finances (max 90 characters).",
    },
    observations: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          type: { type: SchemaType.STRING, description: "'positive', 'warning', or 'tip'" },
          message: { type: SchemaType.STRING },
        },
        required: ["title", "type", "message"],
      },
      description: "2 or 3 concise, highly actionable observations or recommendations.",
    },
  },
  required: ["healthScore", "status", "headline", "observations"],
};

const getGenerativeModel = (genAI, schema, modelName = "gemini-3.8-flash") => {
  return genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: schema,
      temperature: 0.2,
    },
  });
};

/**
 * Deterministic fallback regex/heuristic parser in case the external AI API is unreachable,
 * rate limited, times out, or has an unconfigured key.
 */
export const fallbackQuickLogParser = (text, userCategories = [], currentDate) => {
  const normalized = String(text || "").trim();
  const today = currentDate || new Date().toISOString().slice(0, 10);

  // Extract amount ($12.34, 45 cedis, 1,200)
  const amountMatch = normalized.match(/(?:\$|ghs|cedis|cedi|€|£)?\s*(\d+(?:,\d{3})*(?:\.\d{1,2})?)/i);
  let amount = 0;
  if (amountMatch) {
    amount = parseFloat(amountMatch[1].replace(/,/g, ""));
  }

  // Determine type
  const isIncome = /\b(earned|salary|deposit|freelance|bonus|received|sold|refund|income|paycheck)\b/i.test(normalized);
  const type = isIncome ? "income" : "expense";

  // Determine relative date
  let date = today;
  if (/\byesterday\b/i.test(normalized)) {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    date = d.toISOString().slice(0, 10);
  }

  // Find category match
  const matchingCategories = userCategories.filter((c) => c.type === type);
  let category = matchingCategories[0]?.name || (type === "income" ? "Salary" : "General");

  for (const cat of matchingCategories) {
    if (new RegExp(`\\b${cat.name}\\b`, "i").test(normalized)) {
      category = cat.name;
      break;
    }
  }

  // Infer payment method
  let method = "Card";
  if (/\b(cash)\b/i.test(normalized)) method = "Cash";
  else if (/\b(momo|mobile money|telecel|mtn)\b/i.test(normalized)) method = "Mobile Money";
  else if (/\b(bank|transfer|wire)\b/i.test(normalized)) method = "Bank Transfer";

  // Clean description
  let name = normalized
    .replace(/(?:\$|ghs|cedis|cedi|€|£)?\s*(\d+(?:,\d{3})*(?:\.\d{1,2})?)/gi, "")
    .replace(/\b(spent|paid|bought|yesterday|today|for|on|via|received|earned|with|cedis|ghs)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!name || name.length < 2) {
    name = type === "income" ? "Income Entry" : "Expense Entry";
  }

  return {
    name: name.slice(0, 80),
    amount: amount || 0,
    type,
    category,
    date,
    method,
    notes: `Quick-logged: "${text}"`,
  };
};

/**
 * Parses natural language input using Gemini 3.8 Flash (with automatic heuristic fallback)
 */
export const parseQuickLog = async (text, userCategories = [], currentDate = new Date().toISOString().slice(0, 10)) => {
  try {
    const genAI = getGenAI();
    const model = getGenerativeModel(genAI, transactionSchema, "gemini-3.8-flash");

    const categoryList = userCategories.map((c) => `${c.name} (${c.type})`).join(", ");

    const prompt = `
You are WatchMoni's personal finance assistant.
Extract structured transaction data from the user's natural language input.

Context:
- Today's date is: ${currentDate}.
- User's existing categories: [${categoryList || "No custom categories yet"}].

Input:
"${text}"

Rules:
1. 'name' should be a concise title or merchant name (e.g., 'Starbucks', 'Apartment Rent', 'Uber Ride').
2. 'amount' must be a strictly positive number.
3. 'type' must be either 'expense' or 'income'.
4. 'category': Pick the best match from the user's existing categories that matches the transaction type.
5. 'date': Format as YYYY-MM-DD. Calculate relative dates like 'yesterday', 'last Friday', '2 days ago' relative to today's date (${currentDate}).
6. 'method': Infer payment method if mentioned (e.g., 'Card', 'Cash', 'Mobile Money', 'Bank Transfer'), or leave blank.
7. 'notes': Any helpful remaining context.
`;

    // Timeout after 15 seconds to give network sufficient time while preventing indefinite stalls
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("AI generation timed out")), 15000)
    );

    const result = await Promise.race([model.generateContent(prompt), timeoutPromise]);
    const parsed = JSON.parse(result.response.text());

    return {
      name: parsed.name || "Expense",
      amount: Math.abs(Number(parsed.amount) || 0),
      type: parsed.type === "income" ? "income" : "expense",
      category: parsed.category || (parsed.type === "income" ? "Salary" : "General"),
      date: parsed.date || currentDate,
      method: parsed.method || "",
      notes: parsed.notes || "",
    };
  } catch (error) {
    console.warn("AI parseQuickLog falling back to heuristic parser:", error.message);
    return fallbackQuickLogParser(text, userCategories, currentDate);
  }
};

/**
 * Multimodal Receipt OCR and itemization using Gemini 3.8 Flash
 */
export const parseReceiptImage = async (
  imageBuffer,
  mimeType,
  userCategories = [],
  currentDate = new Date().toISOString().slice(0, 10)
) => {
  try {
    const genAI = getGenAI();
    const model = getGenerativeModel(genAI, transactionSchema, "gemini-3.8-flash");

    const categoryList = userCategories.map((c) => `${c.name} (${c.type})`).join(", ");

    const imagePart = {
      inlineData: {
        data: imageBuffer.toString("base64"),
        mimeType,
      },
    };

    const prompt = `
You are WatchMoni's receipt and invoice scanner.
Analyze this receipt or invoice image and extract the transaction details.

Context:
- Today's date is: ${currentDate}.
- User's existing categories: [${categoryList || "None"}].

Rules:
1. 'name': Identify the vendor/store/merchant name at the top of the receipt.
2. 'amount': Extract the final grand total paid (including taxes and fees).
3. 'type': Almost always 'expense' unless it is clearly a refund receipt or credit note.
4. 'category': Choose the most appropriate category from the user's categories.
5. 'date': Extract the printed date on the receipt in YYYY-MM-DD format. If no date is found or legible, use today's date (${currentDate}).
6. 'method': Infer payment method if visible (e.g., 'Visa', 'Mastercard', 'Cash', 'Apple Pay', 'Mobile Money').
7. 'notes': Mention any prominent purchased items or line item summary.
`;

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("AI receipt scanning timed out")), 20000)
    );

    const result = await Promise.race([model.generateContent([prompt, imagePart]), timeoutPromise]);
    const parsed = JSON.parse(result.response.text());

    return {
      name: parsed.name || "Receipt Expense",
      amount: Math.abs(Number(parsed.amount) || 0),
      type: parsed.type === "income" ? "income" : "expense",
      category: parsed.category || "Food & Dining",
      date: parsed.date || currentDate,
      method: parsed.method || "",
      notes: parsed.notes || "",
    };
  } catch (error) {
    console.error("Gemini parseReceiptImage error:", error.message);
    throw new Error(`Receipt scanning failed: ${error.message}`);
  }
};

/**
 * Heuristic fallback for financial insights when API is unreachable
 */
export const fallbackFinancialInsights = (data) => {
  const { income = 0, expenses = 0, categoryBreakdown = [], budgetOverruns = [] } = data;
  const net = income - expenses;
  const topCategory = categoryBreakdown[0] || { category: "General", amount: 0 };

  if (income === 0 && expenses === 0) {
    return {
      healthScore: 70,
      status: "Good",
      headline: "Start logging your transactions to unlock personalized financial insights.",
      observations: [
        {
          title: "Quick-Log Enabled",
          type: "tip",
          message: "Type naturally or scan a receipt to log your first income or expense.",
        },
        {
          title: "Automated Categorization",
          type: "positive",
          message: "WatchMoni sorts your entries into categories and tracks your spending limits.",
        },
      ],
    };
  }

  if (net < 0) {
    return {
      healthScore: Math.max(35, Math.round(50 - (Math.abs(net) / (expenses || 1)) * 30)),
      status: "Needs Attention",
      headline: `Spending currently exceeds income by GHS ${Math.abs(net).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`,
      observations: [
        {
          title: "Top Spending Area",
          type: "warning",
          message: `Your highest expense is ${topCategory.category} (GHS ${Number(topCategory.amount).toFixed(2)}). Trimming this could restore positive cash flow.`,
        },
        {
          title: "Budget Optimization",
          type: "tip",
          message: budgetOverruns.length > 0
            ? `${budgetOverruns[0].category} has exceeded its monthly limit. Try setting weekly spending checks.`
            : "Set category spending limits in Budgets to prevent end-of-month overruns.",
        },
      ],
    };
  }

  const savingsRate = income > 0 ? ((net / income) * 100) : 0;
  return {
    healthScore: Math.min(96, Math.max(72, Math.round(60 + savingsRate * 0.4))),
    status: savingsRate >= 20 ? "Excellent" : "Good",
    headline: `Healthy cash flow! You are currently saving ${savingsRate.toFixed(0)}% of your income.`,
    observations: [
      {
        title: "Strong Savings Momentum",
        type: "positive",
        message: `You've retained GHS ${net.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} this period. Keep up the disciplined spending!`,
      },
      {
        title: "Category Focus",
        type: "tip",
        message: topCategory.amount > 0
          ? `${topCategory.category} is your largest outlay (GHS ${Number(topCategory.amount).toFixed(2)}). Review recurring expenses to save even more.`
          : "Consider assigning monthly budgets to keep your savings on auto-pilot.",
      },
    ],
  };
};

/**
 * Generates personalized AI Financial Insights and Advisor tips
 */
export const generateFinancialInsights = async (data) => {
  try {
    const genAI = getGenAI();
    const model = getGenerativeModel(genAI, insightsSchema, "gemini-3.8-flash");

    const {
      income = 0,
      expenses = 0,
      categoryBreakdown = [],
      budgetOverruns = [],
      transactionCount = 0,
    } = data;

    const net = income - expenses;
    const catList = categoryBreakdown.map((c) => `${c.category}: GHS ${c.amount}`).join(", ") || "None";
    const overrunList = budgetOverruns.map((b) => `${b.category} exceeded budget (spent GHS ${b.spent} vs limit GHS ${b.limit})`).join("; ") || "All budgets within limits";

    const prompt = `
You are WatchMoni's personal financial health advisor.
Analyze this user's current spending & income numbers and return structured, personalized advice.

Financial Snapshot:
- Total Income: GHS ${income.toFixed(2)}
- Total Expenses: GHS ${expenses.toFixed(2)}
- Net Cash Flow: GHS ${net.toFixed(2)}
- Top Spending Categories: ${catList}
- Budget Overruns / Alerts: ${overrunList}
- Total Transactions Logged: ${transactionCount}

Instructions:
1. 'healthScore': An integer 0-100 reflecting overall health, savings rate, and budget discipline.
2. 'status': Exactly one of 'Excellent', 'Good', 'Fair', or 'Needs Attention'.
3. 'headline': 1 punchy, encouraging sentence (max 90 chars).
4. 'observations': Exactly 2 or 3 items with 'title' (short), 'type' ('positive', 'warning', or 'tip'), and 'message' (concrete advice under 140 chars).
`;

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("AI insights generation timed out")), 15000)
    );

    const result = await Promise.race([model.generateContent(prompt), timeoutPromise]);
    const parsed = JSON.parse(result.response.text());

    return {
      healthScore: Number(parsed.healthScore) || 75,
      status: parsed.status || "Good",
      headline: parsed.headline || "Your financial snapshot is up to date.",
      observations: Array.isArray(parsed.observations) && parsed.observations.length > 0
        ? parsed.observations
        : fallbackFinancialInsights(data).observations,
    };
  } catch (error) {
    console.warn("AI generateFinancialInsights falling back to heuristic engine:", error.message);
    return fallbackFinancialInsights(data);
  }
};

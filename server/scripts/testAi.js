import dotenv from "dotenv";
dotenv.config();
import { parseQuickLog } from "../src/services/aiService.js";

async function runDiagnostics() {
  console.log("=========================================");
  console.log("   WATCHMONI AI DIAGNOSTIC REPORT       ");
  console.log("=========================================\n");

  const key = process.env.GEMINI_API_KEY || "";
  console.log("[1] API Key Inspection:");
  console.log("    - Key present:", key ? "YES" : "NO");
  console.log("    - Key length :", key.length, "characters");
  console.log("    - Key prefix :", key.slice(0, 6) + "...");
  if (!key.startsWith("AIzaSy")) {
    console.log("    ⚠️ Warning: Keys from Google AI Studio begin with 'AIzaSy'.");
    console.log("       Your key prefix is different. If Google rejects it,");
    console.log("       the system will automatically switch to the fallback parser.");
  } else {
    console.log("    ✓ Key prefix matches Google AI Studio format.");
  }

  const mockCategories = [
    { name: "Food & Dining", type: "expense" },
    { name: "Salary", type: "income" },
    { name: "Transportation", type: "expense" },
    { name: "Groceries", type: "expense" },
  ];

  console.log("\n[2] Testing Expense Parsing (Relative date & currency):");
  console.log('    Input: "Spent 45 cedis on lunch at KFC yesterday"');
  const test1 = await parseQuickLog("Spent 45 cedis on lunch at KFC yesterday", mockCategories);
  console.log("    Result:", JSON.stringify(test1, null, 2));

  console.log("\n[3] Testing Income Parsing:");
  console.log('    Input: "Received 1200 freelance payment for website design"');
  const test2 = await parseQuickLog("Received 1200 freelance payment for website design", mockCategories);
  console.log("    Result:", JSON.stringify(test2, null, 2));

  console.log("\n[4] Testing Google Gemini Direct Connectivity:");
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`
    );
    const data = await response.json();
    if (response.ok && data.models) {
      console.log("    ✓ Google AI Studio API key verified and working!");
      console.log(`    ✓ ${data.models.length} models accessible.`);
    } else {
      console.log("    ❌ Google API returned an error:", data.error?.message || response.statusText);
      console.log("       Status Code:", response.status);
    }
  } catch (err) {
    console.log("    ❌ Network connection to Google API failed:", err.message);
  }

  console.log("\n=========================================");
  console.log("              END OF REPORT              ");
  console.log("=========================================\n");
}

runDiagnostics().catch(console.error);


import test from "node:test";
import assert from "node:assert/strict";

import {
  validateRegistrationInput,
  validateLoginInput,
  validateCategoryInput,
  validateTransactionInput,
  validateBudgetInput,
} from "../src/utils/validation.js";

test("validateRegistrationInput accepts valid payloads", () => {
  const result = validateRegistrationInput({
    email: "user@example.com",
    password: "StrongPass123!",
    full_name: "Jane Doe",
  });

  assert.deepEqual(result, { valid: true, errors: [] });
});

test("validateRegistrationInput rejects missing values", () => {
  const result = validateRegistrationInput({
    email: "user@example.com",
    password: "short",
  });

  assert.equal(result.valid, false);
  assert.ok(result.errors.length >= 1);
});

test("validateLoginInput requires email and password", () => {
  const result = validateLoginInput({ email: "user@example.com" });

  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => /password/i.test(error)));
});

test("validateCategoryInput accepts valid category data", () => {
  const result = validateCategoryInput({
    name: "Groceries",
    type: "expense",
  });

  assert.deepEqual(result, { valid: true, errors: [] });
});

test("validateCategoryInput rejects invalid category type", () => {
  const result = validateCategoryInput({
    name: "Groceries",
    type: "bonus",
  });

  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes("income")));
});

test("validateCategoryInput trims category names and normalizes the type", () => {
  const result = validateCategoryInput({
    name: "  Food  ",
    type: "EXPENSE",
  });

  assert.deepEqual(result, { valid: true, errors: [] });
});

test("validateCategoryInput rejects names longer than the database limit", () => {
  const result = validateCategoryInput({
    name: "x".repeat(81),
    type: "expense",
  });

  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes("80 characters")));
});

test("validateTransactionInput accepts a valid expense", () => {
  const result = validateTransactionInput({
    name: "Groceries",
    category: "Food",
    type: "expense",
    amount: "156.40",
    date: "2026-10-04",
    method: "Debit card",
  });

  assert.equal(result.valid, true);
  assert.deepEqual(result.value, {
    name: "Groceries",
    category: "Food",
    type: "expense",
    amount: 156.4,
    date: "2026-10-04",
    method: "Debit card",
    notes: null,
  });
});

test("validateTransactionInput rejects invalid type, amount, and date", () => {
  const result = validateTransactionInput({
    name: "Groceries",
    category: "Food",
    type: "transfer",
    amount: "-10",
    date: "2026-02-30",
  });

  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes("income or expense")));
  assert.ok(result.errors.some((error) => error.includes("greater than zero")));
  assert.ok(result.errors.some((error) => error.includes("valid transaction date")));
});

test("validateTransactionInput rejects a non-object payload", () => {
  const result = validateTransactionInput(null);

  assert.equal(result.valid, false);
  assert.ok(result.errors.length > 0);
});

test("validateBudgetInput accepts a valid monthly expense budget", () => {
  const result = validateBudgetInput({
    category: " Food ",
    limit: "600.00",
    month: "2026-10",
  });

  assert.deepEqual(result, {
    valid: true,
    errors: [],
    value: { category: "Food", limit: 600, month: "2026-10" },
  });
});

test("validateBudgetInput rejects invalid limits, categories, and months", () => {
  const result = validateBudgetInput({
    category: "x".repeat(81),
    limit: 0,
    month: "2026-13",
  });

  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes("80 characters")));
  assert.ok(result.errors.some((error) => error.includes("greater than zero")));
  assert.ok(result.errors.some((error) => error.includes("YYYY-MM")));
});

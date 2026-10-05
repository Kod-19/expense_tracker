import test from "node:test";
import assert from "node:assert/strict";

import {
  validateRegistrationInput,
  validateLoginInput,
  validateCategoryInput,
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

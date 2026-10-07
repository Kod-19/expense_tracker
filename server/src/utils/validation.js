const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRegistrationInput = ({
  email,
  password,
  full_name,
  fullName,
}) => {
  const normalizedName = full_name || fullName || "";
  const errors = [];

  if (!email || !String(email).trim()) {
    errors.push("Email is required");
  } else if (!emailRegex.test(String(email).trim())) {
    errors.push("Email must be a valid email address");
  }

  if (!password || !String(password).trim()) {
    errors.push("Password is required");
  } else if (String(password).trim().length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!normalizedName || !String(normalizedName).trim()) {
    errors.push("Full name is required");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export const validateLoginInput = ({ email, password }) => {
  const errors = [];

  if (!email || !String(email).trim()) {
    errors.push("Email is required");
  } else if (!emailRegex.test(String(email).trim())) {
    errors.push("Email must be a valid email address");
  }

  if (!password || !String(password).trim()) {
    errors.push("Password is required");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export const validateCategoryInput = (input = {}) => {
  const { name, type } =
    input && typeof input === "object" && !Array.isArray(input) ? input : {};
  const normalizedName = String(name ?? "").trim();
  const normalizedType = String(type ?? "").trim().toLowerCase();
  const errors = [];

  if (!normalizedName) {
    errors.push("Category name is required");
  } else if (normalizedName.length > 80) {
    errors.push("Category name must be 80 characters or fewer");
  }

  if (!normalizedType) {
    errors.push("Category type is required");
  } else if (!["income", "expense"].includes(normalizedType)) {
    errors.push("Category type must be income or expense");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export const validateTransactionInput = (input = {}) => {
  const { name, category, type, amount, date, method = "", notes = "" } =
    input && typeof input === "object" && !Array.isArray(input) ? input : {};
  const errors = [];
  const normalizedName = String(name ?? "").trim();
  const normalizedCategory = String(category ?? "").trim();
  const normalizedType = String(type ?? "").trim().toLowerCase();
  const normalizedAmount = Number(amount);
  const normalizedDate = String(date ?? "").trim();
  const normalizedMethod = String(method ?? "").trim();
  const normalizedNotes = String(notes ?? "").trim();

  if (!normalizedName) {
    errors.push("Transaction name is required");
  } else if (normalizedName.length > 120) {
    errors.push("Transaction name must be 120 characters or fewer");
  }

  if (!normalizedCategory) {
    errors.push("Category is required");
  } else if (normalizedCategory.length > 80) {
    errors.push("Category must be 80 characters or fewer");
  }

  if (!["income", "expense"].includes(normalizedType)) {
    errors.push("Transaction type must be income or expense");
  }

  if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
    errors.push("Amount must be a number greater than zero");
  } else if (normalizedAmount > 9999999999.99) {
    errors.push("Amount exceeds the maximum supported value");
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizedDate)) {
    errors.push("A valid transaction date is required");
  } else {
    const parsedDate = new Date(`${normalizedDate}T00:00:00.000Z`);
    if (Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== normalizedDate) {
      errors.push("A valid transaction date is required");
    }
  }

  if (normalizedMethod.length > 80) {
    errors.push("Payment method must be 80 characters or fewer");
  }

  if (normalizedNotes.length > 500) {
    errors.push("Notes must be 500 characters or fewer");
  }

  return {
    valid: errors.length === 0,
    errors,
    value: {
      name: normalizedName,
      category: normalizedCategory,
      type: normalizedType,
      amount: normalizedAmount,
      date: normalizedDate,
      method: normalizedMethod || null,
      notes: normalizedNotes || null,
    },
  };
};

export const validateBudgetInput = (input = {}) => {
  const { category, limit, month } =
    input && typeof input === "object" && !Array.isArray(input) ? input : {};
  const errors = [];
  const normalizedCategory = String(category ?? "").trim();
  const normalizedLimit = Number(limit);
  const normalizedMonth = String(month ?? "").trim();

  if (!normalizedCategory) {
    errors.push("An expense category is required");
  } else if (normalizedCategory.length > 80) {
    errors.push("Category must be 80 characters or fewer");
  }

  if (!Number.isFinite(normalizedLimit) || normalizedLimit <= 0) {
    errors.push("Monthly limit must be a number greater than zero");
  } else if (normalizedLimit > 9999999999.99) {
    errors.push("Monthly limit exceeds the maximum supported value");
  }

  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(normalizedMonth)) {
    errors.push("A valid budget month in YYYY-MM format is required");
  }

  return {
    valid: errors.length === 0,
    errors,
    value: {
      category: normalizedCategory,
      limit: normalizedLimit,
      month: normalizedMonth,
    },
  };
};

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

export const validateCategoryInput = ({ name, type }) => {
  const errors = [];

  if (!name || !String(name).trim()) {
    errors.push("Category name is required");
  }

  if (!type || !String(type).trim()) {
    errors.push("Category type is required");
  } else if (
    !["income", "expense"].includes(String(type).trim().toLowerCase())
  ) {
    errors.push("Category type must be income or expense");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

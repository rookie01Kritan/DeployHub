// src/validators/authValidator.js
//
// Validates raw request input before it reaches the service layer.
// Answers: "is this data well-formed?" — not "is this user allowed?"
// Returns an array of error messages (empty array = valid).

function validateRegister(name, email, password) {
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push("Name must be at least 2 characters.");
  }

  if (!email || !email.includes("@")) {
    errors.push("A valid email address is required.");
  }

  if (!password || password.length < 8) {
    errors.push("Password must be at least 8 characters.");
  }

  return errors;
}

function validateLogin(email, password) {
  const errors = [];

  if (!email || !email.includes("@")) {
    errors.push("A valid email address is required.");
  }

  if (!password) {
    errors.push("Password is required.");
  }

  return errors;
}

module.exports = { validateRegister, validateLogin };
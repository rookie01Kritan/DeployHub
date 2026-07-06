// src/validators/teamValidator.js

function validateCreateTeam(name) {
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push("Team name must be at least 2 characters.");
  }

  if (name && name.trim().length > 100) {
    errors.push("Team name cannot exceed 100 characters.");
  }

  return errors;
}

module.exports = { validateCreateTeam };
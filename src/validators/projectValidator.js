// src/validators/projectValidator.js

function validateCreateProject(name) {
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push("Project name must be at least 2 characters.");
  }

  if (name && name.trim().length > 150) {
    errors.push("Project name cannot exceed 150 characters.");
  }

  return errors;
}

function validateUpdateProject(name) {
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push("Project name must be at least 2 characters.");
  }

  if (name && name.trim().length > 150) {
    errors.push("Project name cannot exceed 150 characters.");
  }

  return errors;
}

module.exports = { validateCreateProject, validateUpdateProject };
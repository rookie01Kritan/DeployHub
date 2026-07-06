// src/validators/taskValidator.js

const VALID_STATUSES = ["todo", "in_progress", "done"];

function validateCreateTask(title) {
  const errors = [];

  if (!title || title.trim().length < 2) {
    errors.push("Task title must be at least 2 characters.");
  }

  if (title && title.trim().length > 200) {
    errors.push("Task title cannot exceed 200 characters.");
  }

  return errors;
}

function validateUpdateTask(updates) {
  const errors = [];

  if (updates.title !== undefined) {
    if (!updates.title || updates.title.trim().length < 2) {
      errors.push("Task title must be at least 2 characters.");
    }
  }

  if (updates.status !== undefined) {
    if (!VALID_STATUSES.includes(updates.status)) {
      errors.push(`Status must be one of: ${VALID_STATUSES.join(", ")}.`);
    }
  }

  return errors;
}

module.exports = { validateCreateTask, validateUpdateTask };
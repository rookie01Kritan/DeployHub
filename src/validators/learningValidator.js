// src/validators/learningValidator.js

function validateModule(title) {
  const errors = [];
  if (!title || title.trim().length < 2) {
    errors.push("Module title must be at least 2 characters.");
  }
  if (title && title.trim().length > 200) {
    errors.push("Module title cannot exceed 200 characters.");
  }
  return errors;
}

function validateLesson(title) {
  const errors = [];
  if (!title || title.trim().length < 2) {
    errors.push("Lesson title must be at least 2 characters.");
  }
  if (title && title.trim().length > 200) {
    errors.push("Lesson title cannot exceed 200 characters.");
  }
  return errors;
}

module.exports = { validateModule, validateLesson };
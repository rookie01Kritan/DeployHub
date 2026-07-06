// src/validators/quizValidator.js

function validateQuiz(title) {
  const errors = [];
  if (!title || title.trim().length < 2) {
    errors.push("Quiz title must be at least 2 characters.");
  }
  return errors;
}

function validateQuestion(questionText) {
  const errors = [];
  if (!questionText || questionText.trim().length < 5) {
    errors.push("Question text must be at least 5 characters.");
  }
  return errors;
}

function validateOption(optionText, isCorrect) {
  const errors = [];
  if (!optionText || optionText.trim().length < 1) {
    errors.push("Option text is required.");
  }
  if (typeof isCorrect !== "boolean") {
    errors.push("isCorrect must be true or false.");
  }
  return errors;
}

function validateAttempt(answers) {
  const errors = [];
  if (!answers || !Array.isArray(answers) || answers.length === 0) {
    errors.push("Answers must be a non-empty array.");
  } else {
    answers.forEach((answer, index) => {
      if (!answer.questionId || !answer.optionId) {
        errors.push(`Answer at index ${index} must have questionId and optionId.`);
      }
    });
  }
  return errors;
}

module.exports = {
  validateQuiz,
  validateQuestion,
  validateOption,
  validateAttempt
};
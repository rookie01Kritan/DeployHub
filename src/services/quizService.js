// src/services/quizService.js

const quizRepository = require("../repositories/quizRepository");
const {
  requireAdmin,
  requireMember,
  requireValidProject
} = require("../utils/authorizationHelpers");
const learningRepository = require("../repositories/learningRepository");
const {
  validateQuiz,
  validateQuestion,
  validateOption,
  validateAttempt
} = require("../validators/quizValidator");

// ── Helper: verify module belongs to team ─────────────────────
async function requireValidModule(moduleId, teamId) {
  const module = await learningRepository.getModuleById(moduleId);
  if (!module) {
    throw { status: 404, message: "Module not found." };
  }
  if (module.team_id !== teamId) {
    throw { status: 403, message: "Module does not belong to this team." };
  }
  return module;
}

// ── Helper: get quiz for module (must exist) ──────────────────
async function requireQuiz(moduleId) {
  const quiz = await quizRepository.getQuizByModuleId(moduleId);
  if (!quiz) {
    throw { status: 404, message: "No quiz found for this module." };
  }
  return quiz;
}

// ── Create quiz ───────────────────────────────────────────────
async function createQuiz(teamId, moduleId, requesterId, title) {
  await requireAdmin(requesterId, teamId);
  await requireValidModule(moduleId, teamId);

  // Check quiz doesn't already exist (UNIQUE constraint backup)
  const existing = await quizRepository.getQuizByModuleId(moduleId);
  if (existing) {
    throw { status: 409, message: "A quiz already exists for this module." };
  }

  const errors = validateQuiz(title);
  if (errors.length > 0) {
    throw { status: 400, message: errors.join(", ") };
  }

  return await quizRepository.createQuiz(moduleId, title);
}

// ── Get quiz with questions ───────────────────────────────────
async function getQuiz(teamId, moduleId, requesterId) {
  const membership = await requireMember(requesterId, teamId);
  await requireValidModule(moduleId, teamId);
  const quiz = await requireQuiz(moduleId);

  // Admins see correct answers, Members don't
  const includeCorrect = membership.role === "Admin";
  return await quizRepository.getQuizWithQuestions(quiz.id, includeCorrect);
}

// ── Add question ──────────────────────────────────────────────
async function addQuestion(teamId, moduleId, requesterId, questionText) {
  await requireAdmin(requesterId, teamId);
  await requireValidModule(moduleId, teamId);
  const quiz = await requireQuiz(moduleId);

  const errors = validateQuestion(questionText);
  if (errors.length > 0) {
    throw { status: 400, message: errors.join(", ") };
  }

  const maxIndex = await quizRepository.getMaxQuestionOrderIndex(quiz.id);
  return await quizRepository.createQuestion(
    quiz.id,
    questionText,
    maxIndex + 1
  );
}

// ── Add option to question ────────────────────────────────────
async function addOption(teamId, moduleId, questionId, requesterId, optionText, isCorrect) {
  await requireAdmin(requesterId, teamId);
  await requireValidModule(moduleId, teamId);
  const quiz = await requireQuiz(moduleId);

  const question = await quizRepository.getQuestionById(questionId);
  if (!question) {
    throw { status: 404, message: "Question not found." };
  }
  if (question.quiz_id !== quiz.id) {
    throw { status: 403, message: "Question does not belong to this quiz." };
  }

  const errors = validateOption(optionText, isCorrect);
  if (errors.length > 0) {
    throw { status: 400, message: errors.join(", ") };
  }

  return await quizRepository.createOption(questionId, optionText, isCorrect);
}

// ── Submit quiz attempt ───────────────────────────────────────
async function submitAttempt(teamId, moduleId, requesterId, answers) {
  await requireMember(requesterId, teamId);
  await requireValidModule(moduleId, teamId);
  const quiz = await requireQuiz(moduleId);

  const errors = validateAttempt(answers);
  if (errors.length > 0) {
    throw { status: 400, message: errors.join(", ") };
  }

  // Server-side scoring — never trust client
  const correctOptions = await quizRepository.getCorrectOptions(quiz.id);
  const totalQuestions = await quizRepository.getTotalQuestions(quiz.id);

  if (totalQuestions === 0) {
    throw { status: 400, message: "Cannot attempt a quiz with no questions." };
  }

  // Build a map of questionId → correct optionId
  const correctMap = {};
  correctOptions.forEach(({ question_id, option_id }) => {
    correctMap[question_id] = option_id;
  });

  // Count correct answers
  let correctCount = 0;
  answers.forEach(({ questionId, optionId }) => {
    if (correctMap[questionId] === optionId) {
      correctCount++;
    }
  });

  // Calculate percentage score (rounded to nearest integer)
  const score = Math.round((correctCount / totalQuestions) * 100);

  const attempt = await quizRepository.createAttempt(quiz.id, requesterId, score);

  return {
    ...attempt,
    correctCount,
    totalQuestions,
    percentage: score
  };
}

// ── Get my attempts ───────────────────────────────────────────
async function getMyAttempts(teamId, moduleId, requesterId) {
  await requireMember(requesterId, teamId);
  await requireValidModule(moduleId, teamId);
  const quiz = await requireQuiz(moduleId);
  return await quizRepository.getAttemptsByUser(quiz.id, requesterId);
}

module.exports = {
  createQuiz,
  getQuiz,
  addQuestion,
  addOption,
  submitAttempt,
  getMyAttempts
};
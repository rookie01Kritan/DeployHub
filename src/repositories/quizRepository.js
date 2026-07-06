// src/repositories/quizRepository.js

const pool = require("../config/db");

// ── Quiz ──────────────────────────────────────────────────────

async function getQuizByModuleId(moduleId) {
  const result = await pool.query(
    `SELECT id, module_id, title, created_at
     FROM quizzes
     WHERE module_id = $1`,
    [moduleId]
  );
  return result.rows[0] || null;
}

async function getQuizById(quizId) {
  const result = await pool.query(
    `SELECT id, module_id, title, created_at
     FROM quizzes
     WHERE id = $1`,
    [quizId]
  );
  return result.rows[0] || null;
}

async function createQuiz(moduleId, title) {
  const result = await pool.query(
    `INSERT INTO quizzes (module_id, title)
     VALUES ($1, $2)
     RETURNING id, module_id, title, created_at`,
    [moduleId, title]
  );
  return result.rows[0];
}

// ── Get quiz WITH questions AND options ───────────────────────
// Three-level nested structure: quiz → questions → options
// Options marked is_correct=true are hidden from members
// (shown only to Admins) to prevent cheating
async function getQuizWithQuestions(quizId, includeCorrect = false) {
  const quizResult = await pool.query(
    `SELECT id, module_id, title, created_at
     FROM quizzes WHERE id = $1`,
    [quizId]
  );
  if (!quizResult.rows[0]) return null;

  const questionsResult = await pool.query(
    `SELECT id, quiz_id, question_text, order_index, created_at
     FROM questions
     WHERE quiz_id = $1
     ORDER BY order_index ASC`,
    [quizId]
  );

  // For each question, fetch its options
  const questions = await Promise.all(
    questionsResult.rows.map(async (question) => {
      const optionsResult = await pool.query(
        `SELECT id, question_id, option_text
         ${includeCorrect ? ", is_correct" : ""}
         FROM question_options
         WHERE question_id = $1`,
        [question.id]
      );
      return { ...question, options: optionsResult.rows };
    })
  );

  return { ...quizResult.rows[0], questions };
}

// ── Questions ─────────────────────────────────────────────────

async function getMaxQuestionOrderIndex(quizId) {
  const result = await pool.query(
    `SELECT COALESCE(MAX(order_index), -1) AS max_index
     FROM questions WHERE quiz_id = $1`,
    [quizId]
  );
  return result.rows[0].max_index;
}

async function createQuestion(quizId, questionText, orderIndex) {
  const result = await pool.query(
    `INSERT INTO questions (quiz_id, question_text, order_index)
     VALUES ($1, $2, $3)
     RETURNING id, quiz_id, question_text, order_index, created_at`,
    [quizId, questionText, orderIndex]
  );
  return result.rows[0];
}

async function getQuestionById(questionId) {
  const result = await pool.query(
    `SELECT id, quiz_id, question_text, order_index
     FROM questions WHERE id = $1`,
    [questionId]
  );
  return result.rows[0] || null;
}

// ── Options ───────────────────────────────────────────────────

async function createOption(questionId, optionText, isCorrect) {
  const result = await pool.query(
    `INSERT INTO question_options (question_id, option_text, is_correct)
     VALUES ($1, $2, $3)
     RETURNING id, question_id, option_text, is_correct`,
    [questionId, optionText, isCorrect]
  );
  return result.rows[0];
}

// ── Scoring ───────────────────────────────────────────────────

// Get all correct option IDs for a quiz (for scoring)
async function getCorrectOptions(quizId) {
  const result = await pool.query(
    `SELECT qo.id AS option_id, qo.question_id
     FROM question_options qo
     INNER JOIN questions q ON qo.question_id = q.id
     WHERE q.quiz_id = $1 AND qo.is_correct = TRUE`,
    [quizId]
  );
  return result.rows;
}

async function getTotalQuestions(quizId) {
  const result = await pool.query(
    `SELECT COUNT(*) AS total
     FROM questions
     WHERE quiz_id = $1`,
    [quizId]
  );
  return parseInt(result.rows[0].total);
}

// ── Attempts ──────────────────────────────────────────────────

async function createAttempt(quizId, userId, score) {
  const result = await pool.query(
    `INSERT INTO quiz_attempts (quiz_id, user_id, score)
     VALUES ($1, $2, $3)
     RETURNING id, quiz_id, user_id, score, completed_at`,
    [quizId, userId, score]
  );
  return result.rows[0];
}

async function getAttemptsByUser(quizId, userId) {
  const result = await pool.query(
    `SELECT id, quiz_id, user_id, score, completed_at
     FROM quiz_attempts
     WHERE quiz_id = $1 AND user_id = $2
     ORDER BY completed_at DESC`,
    [quizId, userId]
  );
  return result.rows;
}

module.exports = {
  getQuizByModuleId,
  getQuizById,
  createQuiz,
  getQuizWithQuestions,
  getMaxQuestionOrderIndex,
  createQuestion,
  getQuestionById,
  createOption,
  getCorrectOptions,
  getTotalQuestions,
  createAttempt,
  getAttemptsByUser
};
// src/repositories/learningRepository.js

const pool = require("../config/db");

// ── Learning Modules ──────────────────────────────────────────

async function getModulesByTeamId(teamId) {
  const result = await pool.query(
    `SELECT id, team_id, title, description, created_at
     FROM learning_modules
     WHERE team_id = $1
     ORDER BY created_at DESC`,
    [teamId]
  );
  return result.rows;
}

async function getModuleById(moduleId) {
  const result = await pool.query(
    `SELECT id, team_id, title, description, created_at
     FROM learning_modules
     WHERE id = $1`,
    [moduleId]
  );
  return result.rows[0] || null;
}

// Gets module WITH its lessons (ordered)
async function getModuleWithLessons(moduleId) {
  const moduleResult = await pool.query(
    `SELECT id, team_id, title, description, created_at
     FROM learning_modules
     WHERE id = $1`,
    [moduleId]
  );

  if (!moduleResult.rows[0]) return null;

  const lessonsResult = await pool.query(
    `SELECT id, module_id, title, content, order_index, created_at
     FROM lessons
     WHERE module_id = $1
     ORDER BY order_index ASC`,
    [moduleId]
  );

  return {
    ...moduleResult.rows[0],
    lessons: lessonsResult.rows
  };
}

async function createModule(teamId, title, description) {
  const result = await pool.query(
    `INSERT INTO learning_modules (team_id, title, description)
     VALUES ($1, $2, $3)
     RETURNING id, team_id, title, description, created_at`,
    [teamId, title, description]
  );
  return result.rows[0];
}

async function updateModule(moduleId, title, description) {
  const result = await pool.query(
    `UPDATE learning_modules
     SET title = $1, description = $2
     WHERE id = $3
     RETURNING id, team_id, title, description, created_at`,
    [title, description, moduleId]
  );
  return result.rows[0] || null;
}

async function deleteModule(moduleId) {
  const result = await pool.query(
    `DELETE FROM learning_modules
     WHERE id = $1
     RETURNING id, title`,
    [moduleId]
  );
  return result.rows[0] || null;
}

// ── Lessons ───────────────────────────────────────────────────

async function getLessonById(lessonId) {
  const result = await pool.query(
    `SELECT id, module_id, title, content, order_index, created_at
     FROM lessons
     WHERE id = $1`,
    [lessonId]
  );
  return result.rows[0] || null;
}

// Get the highest current order_index for a module
async function getMaxOrderIndex(moduleId) {
  const result = await pool.query(
    `SELECT COALESCE(MAX(order_index), -1) AS max_index
     FROM lessons
     WHERE module_id = $1`,
    [moduleId]
  );
  return result.rows[0].max_index;
}

// Shift lessons at or above a position up by 1 (for insertion)
async function shiftLessonsUp(moduleId, fromIndex) {
  await pool.query(
    `UPDATE lessons
     SET order_index = order_index + 1
     WHERE module_id = $1 AND order_index >= $2`,
    [moduleId, fromIndex]
  );
}

async function createLesson(moduleId, title, content, orderIndex) {
  const result = await pool.query(
    `INSERT INTO lessons (module_id, title, content, order_index)
     VALUES ($1, $2, $3, $4)
     RETURNING id, module_id, title, content, order_index, created_at`,
    [moduleId, title, content, orderIndex]
  );
  return result.rows[0];
}

async function updateLesson(lessonId, updates) {
  const fields = [];
  const values = [];
  let paramCount = 1;

  if (updates.title !== undefined) {
    fields.push(`title = $${paramCount++}`);
    values.push(updates.title);
  }
  if (updates.content !== undefined) {
    fields.push(`content = $${paramCount++}`);
    values.push(updates.content);
  }

  if (fields.length === 0) return null;

  values.push(lessonId);
  const result = await pool.query(
    `UPDATE lessons
     SET ${fields.join(", ")}
     WHERE id = $${paramCount}
     RETURNING id, module_id, title, content, order_index, created_at`,
    values
  );
  return result.rows[0] || null;
}

async function deleteLesson(lessonId) {
  const result = await pool.query(
    `DELETE FROM lessons
     WHERE id = $1
     RETURNING id, title, order_index, module_id`,
    [lessonId]
  );
  return result.rows[0] || null;
}

// Shift lessons above a deleted position down by 1 (fill gap)
async function shiftLessonsDown(moduleId, fromIndex) {
  await pool.query(
    `UPDATE lessons
     SET order_index = order_index - 1
     WHERE module_id = $1 AND order_index > $2`,
    [moduleId, fromIndex]
  );
}

module.exports = {
  getModulesByTeamId,
  getModuleById,
  getModuleWithLessons,
  createModule,
  updateModule,
  deleteModule,
  getLessonById,
  getMaxOrderIndex,
  shiftLessonsUp,
  createLesson,
  updateLesson,
  deleteLesson,
  shiftLessonsDown
};
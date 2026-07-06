// src/repositories/taskRepository.js

const pool = require("../config/db");

// ── Get all tasks for a project ───────────────────────────────
// JOINs with users to include assignee name/email
async function getTasksByProjectId(projectId) {
  const result = await pool.query(
    `SELECT
       t.id,
       t.project_id,
       t.title,
       t.description,
       t.status,
       t.created_at,
       u.id AS assignee_id,
       u.name AS assignee_name,
       u.email AS assignee_email
     FROM tasks t
     LEFT JOIN users u ON t.assignee_id = u.id
     WHERE t.project_id = $1
     ORDER BY t.created_at ASC`,
    [projectId]
  );
  return result.rows;
}

// ── Get a single task by id ───────────────────────────────────
async function getTaskById(taskId) {
  const result = await pool.query(
    `SELECT
       t.id,
       t.project_id,
       t.title,
       t.description,
       t.status,
       t.created_at,
       u.id AS assignee_id,
       u.name AS assignee_name,
       u.email AS assignee_email
     FROM tasks t
     LEFT JOIN users u ON t.assignee_id = u.id
     WHERE t.id = $1`,
    [taskId]
  );
  return result.rows[0] || null;
}

// ── Create a new task ─────────────────────────────────────────
async function createTask(projectId, title, description, assigneeId) {
  const result = await pool.query(
    `INSERT INTO tasks (project_id, title, description, assignee_id)
     VALUES ($1, $2, $3, $4)
     RETURNING id, project_id, title, description,
               status, assignee_id, created_at`,
    [projectId, title, description, assigneeId || null]
  );
  return result.rows[0];
}

// ── Partial update a task ─────────────────────────────────────
// Dynamically builds SET clause from provided fields only
async function updateTask(taskId, updates) {
  const fields = [];
  const values = [];
  let paramCount = 1;

  if (updates.title !== undefined) {
    fields.push(`title = $${paramCount++}`);
    values.push(updates.title);
  }

  if (updates.description !== undefined) {
    fields.push(`description = $${paramCount++}`);
    values.push(updates.description);
  }

  if (updates.status !== undefined) {
    fields.push(`status = $${paramCount++}`);
    values.push(updates.status);
  }

  if (updates.assigneeId !== undefined) {
    fields.push(`assignee_id = $${paramCount++}`);
    values.push(updates.assigneeId || null);
  }

  // Nothing to update
  if (fields.length === 0) {
    return null;
  }

  // Add taskId as the final parameter for WHERE clause
  values.push(taskId);

  const result = await pool.query(
    `UPDATE tasks
     SET ${fields.join(", ")}
     WHERE id = $${paramCount}
     RETURNING id, project_id, title, description,
               status, assignee_id, created_at`,
    values
  );

  return result.rows[0] || null;
}

// ── Delete a task ─────────────────────────────────────────────
async function deleteTask(taskId) {
  const result = await pool.query(
    `DELETE FROM tasks
     WHERE id = $1
     RETURNING id, title`,
    [taskId]
  );
  return result.rows[0] || null;
}

module.exports = {
  getTasksByProjectId,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
};
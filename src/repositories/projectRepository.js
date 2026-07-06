// src/repositories/projectRepository.js

const pool = require("../config/db");

// ── Get all projects for a team ───────────────────────────────
async function getProjectsByTeamId(teamId) {
  const result = await pool.query(
    `SELECT id, team_id, name, description, created_at
     FROM projects
     WHERE team_id = $1
     ORDER BY created_at DESC`,
    [teamId]
  );
  return result.rows;
}

// ── Get a single project by id ────────────────────────────────
async function getProjectById(projectId) {
  const result = await pool.query(
    `SELECT id, team_id, name, description, created_at
     FROM projects
     WHERE id = $1`,
    [projectId]
  );
  return result.rows[0] || null;
}

// ── Create a new project ──────────────────────────────────────
async function createProject(teamId, name, description) {
  const result = await pool.query(
    `INSERT INTO projects (team_id, name, description)
     VALUES ($1, $2, $3)
     RETURNING id, team_id, name, description, created_at`,
    [teamId, name, description]
  );
  return result.rows[0];
}

// ── Update a project ──────────────────────────────────────────
async function updateProject(projectId, name, description) {
  const result = await pool.query(
    `UPDATE projects
     SET name = $1, description = $2
     WHERE id = $3
     RETURNING id, team_id, name, description, created_at`,
    [name, description, projectId]
  );
  return result.rows[0] || null;
}

// ── Delete a project ──────────────────────────────────────────
async function deleteProject(projectId) {
  const result = await pool.query(
    `DELETE FROM projects
     WHERE id = $1
     RETURNING id, name`,
    [projectId]
  );
  return result.rows[0] || null;
}

module.exports = {
  getProjectsByTeamId,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
};
// src/repositories/teamRepository.js
//
// All SQL queries related to teams and team_members tables.
// Contains one transaction (createTeamWithAdmin) since two
// inserts must succeed or fail together.

const pool = require("../config/db");

// ── Create a team and add creator as Admin (transaction) ──────
async function createTeamWithAdmin(name, userId) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Insert 1 — create the team
    const teamResult = await client.query(
      `INSERT INTO teams (name, created_by)
       VALUES ($1, $2)
       RETURNING id, name, created_by, created_at`,
      [name, userId]
    );
    const team = teamResult.rows[0];

    // Insert 2 — add creator as Admin member
    await client.query(
      `INSERT INTO team_members (user_id, team_id, role)
       VALUES ($1, $2, 'Admin')`,
      [userId, team.id]
    );

    await client.query("COMMIT");
    return team;

  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// ── Get all teams a user belongs to ──────────────────────────
async function getTeamsByUserId(userId) {
  const result = await pool.query(
    `SELECT t.id, t.name, t.created_by, t.created_at, tm.role
     FROM teams t
     INNER JOIN team_members tm ON t.id = tm.team_id
     WHERE tm.user_id = $1
     ORDER BY t.created_at DESC`,
    [userId]
  );
  return result.rows;
}

// ── Get a single team by id ───────────────────────────────────
async function getTeamById(teamId) {
  const result = await pool.query(
    `SELECT id, name, created_by, created_at
     FROM teams
     WHERE id = $1`,
    [teamId]
  );
  return result.rows[0] || null;
}

// ── Check if a user is a member of a team ────────────────────
// Used by service layer for authorization checks.
// Returns the membership row (including role) or null.
async function getTeamMember(userId, teamId) {
  const result = await pool.query(
    `SELECT user_id, team_id, role
     FROM team_members
     WHERE user_id = $1 AND team_id = $2`,
    [userId, teamId]
  );
  return result.rows[0] || null;
}

module.exports = {
  createTeamWithAdmin,
  getTeamsByUserId,
  getTeamById,
  getTeamMember
};
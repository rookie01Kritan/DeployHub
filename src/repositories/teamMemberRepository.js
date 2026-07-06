// src/repositories/teamMemberRepository.js
//
// SQL queries for team_members table operations.
// Separate from teamRepository to keep files focused
// on one responsibility each.

const pool = require("../config/db");

// ── Get all members of a team ─────────────────────────────────
// JOINs with users table to include name and email
// alongside the membership role and joined_at date.
async function getMembersByTeamId(teamId) {
  const result = await pool.query(
    `SELECT
       u.id,
       u.name,
       u.email,
       tm.role,
       tm.joined_at
     FROM team_members tm
     INNER JOIN users u ON tm.user_id = u.id
     WHERE tm.team_id = $1
     ORDER BY tm.joined_at ASC`,
    [teamId]
  );
  return result.rows;
}

// ── Add a new member to a team ────────────────────────────────
async function addMember(userId, teamId, role = "Member") {
  const result = await pool.query(
    `INSERT INTO team_members (user_id, team_id, role)
     VALUES ($1, $2, $3)
     RETURNING user_id, team_id, role, joined_at`,
    [userId, teamId, role]
  );
  return result.rows[0];
}

// ── Get a specific membership row ─────────────────────────────
async function getMember(userId, teamId) {
  const result = await pool.query(
    `SELECT user_id, team_id, role, joined_at
     FROM team_members
     WHERE user_id = $1 AND team_id = $2`,
    [userId, teamId]
  );
  return result.rows[0] || null;
}

// ── Update a member's role ────────────────────────────────────
async function updateMemberRole(userId, teamId, role) {
  const result = await pool.query(
    `UPDATE team_members
     SET role = $1
     WHERE user_id = $2 AND team_id = $3
     RETURNING user_id, team_id, role, joined_at`,
    [role, userId, teamId]
  );
  return result.rows[0] || null;
}

// ── Remove a member from a team ───────────────────────────────
async function removeMember(userId, teamId) {
  const result = await pool.query(
    `DELETE FROM team_members
     WHERE user_id = $1 AND team_id = $2
     RETURNING user_id, team_id`,
    [userId, teamId]
  );
  return result.rows[0] || null;
}

module.exports = {
  getMembersByTeamId,
  addMember,
  getMember,
  updateMemberRole,
  removeMember
};
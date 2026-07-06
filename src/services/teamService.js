// src/services/teamService.js
//
// Business logic for team operations.
// Handles authorization checks (is this user allowed to do this?)
// and delegates database work to teamRepository.

const teamRepository = require("../repositories/teamRepository");
const { validateCreateTeam } = require("../validators/teamValidator");

// ── Create a new team ─────────────────────────────────────────
async function createTeam(name, userId) {
  const errors = validateCreateTeam(name);
  if (errors.length > 0) {
    throw { status: 400, message: errors.join(", ") };
  }

  const team = await teamRepository.createTeamWithAdmin(name, userId);
  return team;
}

// ── Get all teams for the logged-in user ──────────────────────
async function getMyTeams(userId) {
  const teams = await teamRepository.getTeamsByUserId(userId);
  return teams;
}

// ── Get a single team (only if user is a member) ──────────────
async function getTeamById(teamId, userId) {

  // Authorization check — is this user actually in this team?
  const membership = await teamRepository.getTeamMember(userId, teamId);
  if (!membership) {
    throw { status: 403, message: "You are not a member of this team." };
  }

  const team = await teamRepository.getTeamById(teamId);
  if (!team) {
    throw { status: 404, message: "Team not found." };
  }

  return { ...team, role: membership.role };
}

module.exports = { createTeam, getMyTeams, getTeamById };
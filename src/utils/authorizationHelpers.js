// src/utils/authorizationHelpers.js
//
// Shared authorization helper functions used across
// multiple service files. Single source of truth for
// membership and role verification logic.

const teamMemberRepository = require("../repositories/teamMemberRepository");
const projectRepository = require("../repositories/projectRepository");

// ── Verify requester is an Admin of the team ──────────────────
async function requireAdmin(requesterId, teamId) {
  const membership = await teamMemberRepository.getMember(
    requesterId,
    teamId
  );
  if (!membership || membership.role !== "Admin") {
    throw {
      status: 403,
      message: "Only team Admins can perform this action."
    };
  }
  return membership;
}

// ── Verify requester is any member of the team ────────────────
async function requireMember(requesterId, teamId) {
  const membership = await teamMemberRepository.getMember(
    requesterId,
    teamId
  );
  if (!membership) {
    throw {
      status: 403,
      message: "You are not a member of this team."
    };
  }
  return membership;
}

// ── Verify project exists and belongs to the team ─────────────
async function requireValidProject(projectId, teamId) {
  const project = await projectRepository.getProjectById(projectId);
  if (!project) {
    throw { status: 404, message: "Project not found." };
  }
  if (project.team_id !== teamId) {
    throw { status: 403, message: "Project does not belong to this team." };
  }
  return project;
}

module.exports = { requireAdmin, requireMember, requireValidProject };
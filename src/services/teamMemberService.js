// src/services/teamMemberService.js
//
// Business logic for team membership operations.
// Contains all authorization checks (role-based).

const teamMemberRepository = require("../repositories/teamMemberRepository");
const userRepository = require("../repositories/userRepository");
const teamRepository = require("../repositories/teamRepository");
const {
  validateInviteMember,
  validateUpdateRole
} = require("../validators/teamMemberValidator");
const {
  requireAdmin,
  requireMember
} = require("../utils/authorizationHelpers");

// ── Get all members of a team ─────────────────────────────────
async function getMembers(teamId, requesterId) {
  await requireMember(requesterId, teamId);
  return await teamMemberRepository.getMembersByTeamId(teamId);
}

// ── Invite a user to the team ─────────────────────────────────
async function inviteMember(teamId, requesterId, email) {

  // Step 1 — Only Admins can invite
  await requireAdmin(requesterId, teamId);

  // Step 2 — Validate email format
  const errors = validateInviteMember(email);
  if (errors.length > 0) {
    throw { status: 400, message: errors.join(", ") };
  }

  // Step 3 — Find the user being invited
  const invitedUser = await userRepository.findUserByEmail(email);
  if (!invitedUser) {
    throw { status: 404, message: "No user found with that email address." };
  }

  // Step 4 — Check they're not already a member
  const existingMembership = await teamMemberRepository.getMember(
    invitedUser.id,
    teamId
  );
  if (existingMembership) {
    throw { status: 409, message: "This user is already a member of the team." };
  }

  // Step 5 — Add them as a Member (default role)
  return await teamMemberRepository.addMember(invitedUser.id, teamId);
}

// ── Change a member's role ────────────────────────────────────
async function updateMemberRole(teamId, requesterId, targetUserId, role) {

  // Step 1 — Only Admins can change roles
  await requireAdmin(requesterId, teamId);

  // Step 2 — Validate the role value
  const errors = validateUpdateRole(role);
  if (errors.length > 0) {
    throw { status: 400, message: errors.join(", ") };
  }

  // Step 3 — Prevent Admin from demoting themselves
  // A team must always have at least one Admin
  if (parseInt(targetUserId) === parseInt(requesterId)) {
    throw {
      status: 400,
      message: "You cannot change your own role."
    };
  }

  // Step 4 — Confirm target user is actually a member
  const membership = await teamMemberRepository.getMember(
    targetUserId,
    teamId
  );
  if (!membership) {
    throw { status: 404, message: "This user is not a member of the team." };
  }

  return await teamMemberRepository.updateMemberRole(
    targetUserId,
    teamId,
    role
  );
}

// ── Remove a member from the team ────────────────────────────
async function removeMember(teamId, requesterId, targetUserId) {

  // Step 1 — Only Admins can remove members
  await requireAdmin(requesterId, teamId);

  // Step 2 — Prevent Admin from removing themselves
  if (parseInt(targetUserId) === parseInt(requesterId)) {
    throw {
      status: 400,
      message: "You cannot remove yourself from the team."
    };
  }

  // Step 3 — Confirm target is actually a member
  const membership = await teamMemberRepository.getMember(
    targetUserId,
    teamId
  );
  if (!membership) {
    throw { status: 404, message: "This user is not a member of the team." };
  }

  return await teamMemberRepository.removeMember(targetUserId, teamId);
}

module.exports = {
  getMembers,
  inviteMember,
  updateMemberRole,
  removeMember
};
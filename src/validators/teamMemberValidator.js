// src/validators/teamMemberValidator.js

function validateInviteMember(email) {
  const errors = [];

  if (!email || !email.includes("@")) {
    errors.push("A valid email address is required.");
  }

  return errors;
}

function validateUpdateRole(role) {
  const errors = [];

  if (!role || !["Admin", "Member"].includes(role)) {
    errors.push("Role must be either 'Admin' or 'Member'.");
  }

  return errors;
}

module.exports = { validateInviteMember, validateUpdateRole };
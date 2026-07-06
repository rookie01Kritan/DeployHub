// src/services/projectService.js

const projectRepository = require("../repositories/projectRepository");
const teamMemberRepository = require("../repositories/teamMemberRepository");
const {
  validateCreateProject,
  validateUpdateProject
} = require("../validators/projectValidator");
const {
  requireAdmin,
  requireMember
} = require("../utils/authorizationHelpers");

// ── Get all projects for a team ───────────────────────────────
async function getProjects(teamId, requesterId) {
  await requireMember(requesterId, teamId);
  return await projectRepository.getProjectsByTeamId(teamId);
}

// ── Get a single project ──────────────────────────────────────
async function getProjectById(teamId, projectId, requesterId) {
  await requireMember(requesterId, teamId);

  const project = await projectRepository.getProjectById(projectId);
  if (!project) {
    throw { status: 404, message: "Project not found." };
  }

  // Confirm project belongs to this team
  if (project.team_id !== teamId) {
    throw { status: 403, message: "Project does not belong to this team." };
  }

  return project;
}

// ── Create a new project ──────────────────────────────────────
async function createProject(teamId, requesterId, name, description) {
  await requireAdmin(requesterId, teamId);

  const errors = validateCreateProject(name);
  if (errors.length > 0) {
    throw { status: 400, message: errors.join(", ") };
  }

  return await projectRepository.createProject(teamId, name, description);
}

// ── Update a project ──────────────────────────────────────────
async function updateProject(teamId, projectId, requesterId, name, description) {
  await requireAdmin(requesterId, teamId);

  const errors = validateUpdateProject(name);
  if (errors.length > 0) {
    throw { status: 400, message: errors.join(", ") };
  }

  const project = await projectRepository.getProjectById(projectId);
  if (!project) {
    throw { status: 404, message: "Project not found." };
  }

  if (project.team_id !== teamId) {
    throw { status: 403, message: "Project does not belong to this team." };
  }

  return await projectRepository.updateProject(projectId, name, description);
}

// ── Delete a project ──────────────────────────────────────────
async function deleteProject(teamId, projectId, requesterId) {
  await requireAdmin(requesterId, teamId);

  const project = await projectRepository.getProjectById(projectId);
  if (!project) {
    throw { status: 404, message: "Project not found." };
  }

  if (project.team_id !== teamId) {
    throw { status: 403, message: "Project does not belong to this team." };
  }

  return await projectRepository.deleteProject(projectId);
}

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
};
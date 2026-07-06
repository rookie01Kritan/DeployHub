// src/services/taskService.js

const taskRepository = require("../repositories/taskRepository");
const {
  requireMember,
  requireValidProject
} = require("../utils/authorizationHelpers");
const {
  validateCreateTask,
  validateUpdateTask
} = require("../validators/taskValidator");

// ── Get all tasks for a project ───────────────────────────────
async function getTasks(teamId, projectId, requesterId) {
  await requireMember(requesterId, teamId);
  await requireValidProject(projectId, teamId);
  return await taskRepository.getTasksByProjectId(projectId);
}

// ── Get a single task ─────────────────────────────────────────
async function getTaskById(teamId, projectId, taskId, requesterId) {
  await requireMember(requesterId, teamId);
  await requireValidProject(projectId, teamId);

  const task = await taskRepository.getTaskById(taskId);
  if (!task) {
    throw { status: 404, message: "Task not found." };
  }

  if (task.project_id !== projectId) {
    throw { status: 403, message: "Task does not belong to this project." };
  }

  return task;
}

// ── Create a task ─────────────────────────────────────────────
async function createTask(teamId, projectId, requesterId, title, description, assigneeId) {
  await requireMember(requesterId, teamId);
  await requireValidProject(projectId, teamId);

  const errors = validateCreateTask(title);
  if (errors.length > 0) {
    throw { status: 400, message: errors.join(", ") };
  }

  return await taskRepository.createTask(
    projectId,
    title,
    description,
    assigneeId
  );
}

// ── Update a task (partial) ───────────────────────────────────
async function updateTask(teamId, projectId, taskId, requesterId, updates) {
  await requireMember(requesterId, teamId);
  await requireValidProject(projectId, teamId);

  const task = await taskRepository.getTaskById(taskId);
  if (!task) {
    throw { status: 404, message: "Task not found." };
  }

  if (task.project_id !== projectId) {
    throw { status: 403, message: "Task does not belong to this project." };
  }

  const errors = validateUpdateTask(updates);
  if (errors.length > 0) {
    throw { status: 400, message: errors.join(", ") };
  }

  if (Object.keys(updates).length === 0) {
    throw { status: 400, message: "No fields provided to update." };
  }

  return await taskRepository.updateTask(taskId, updates);
}

// ── Delete a task ─────────────────────────────────────────────
async function deleteTask(teamId, projectId, taskId, requesterId) {
  await requireMember(requesterId, teamId);
  await requireValidProject(projectId, teamId);

  const task = await taskRepository.getTaskById(taskId);
  if (!task) {
    throw { status: 404, message: "Task not found." };
  }

  if (task.project_id !== projectId) {
    throw { status: 403, message: "Task does not belong to this project." };
  }

  return await taskRepository.deleteTask(taskId);
}

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
};
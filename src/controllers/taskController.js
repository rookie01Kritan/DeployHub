// src/controllers/taskController.js

const taskService = require("../services/taskService");

async function getTasks(req, res, next) {
  try {
    const teamId = parseInt(req.params.teamId);
    const projectId = parseInt(req.params.projectId);
    const tasks = await taskService.getTasks(teamId, projectId, req.userId);
    res.status(200).json(tasks);
  } catch (err) {
    next(err);
  }
}

async function getTaskById(req, res, next) {
  try {
    const teamId = parseInt(req.params.teamId);
    const projectId = parseInt(req.params.projectId);
    const taskId = parseInt(req.params.taskId);
    const task = await taskService.getTaskById(
      teamId, projectId, taskId, req.userId
    );
    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
}

async function createTask(req, res, next) {
  try {
    const teamId = parseInt(req.params.teamId);
    const projectId = parseInt(req.params.projectId);
    const { title, description, assigneeId } = req.body;
    const task = await taskService.createTask(
      teamId, projectId, req.userId,
      title, description, assigneeId
    );
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
}

async function updateTask(req, res, next) {
  try {
    const teamId = parseInt(req.params.teamId);
    const projectId = parseInt(req.params.projectId);
    const taskId = parseInt(req.params.taskId);

    // Only pass fields that were actually sent
    const updates = {};
    if (req.body.title !== undefined) updates.title = req.body.title;
    if (req.body.description !== undefined) updates.description = req.body.description;
    if (req.body.status !== undefined) updates.status = req.body.status;
    if (req.body.assigneeId !== undefined) updates.assigneeId = req.body.assigneeId;

    const task = await taskService.updateTask(
      teamId, projectId, taskId, req.userId, updates
    );
    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
}

async function deleteTask(req, res, next) {
  try {
    const teamId = parseInt(req.params.teamId);
    const projectId = parseInt(req.params.projectId);
    const taskId = parseInt(req.params.taskId);
    const deleted = await taskService.deleteTask(
      teamId, projectId, taskId, req.userId
    );
    res.status(200).json({
      message: "Task deleted successfully.",
      deleted
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
};
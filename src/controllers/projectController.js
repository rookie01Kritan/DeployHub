// src/controllers/projectController.js

const projectService = require("../services/projectService");

async function getProjects(req, res, next) {
  try {
    const teamId = parseInt(req.params.teamId);
    const projects = await projectService.getProjects(teamId, req.userId);
    res.status(200).json(projects);
  } catch (err) {
    next(err);
  }
}

async function getProjectById(req, res, next) {
  try {
    const teamId = parseInt(req.params.teamId);
    const projectId = parseInt(req.params.projectId);
    const project = await projectService.getProjectById(
      teamId,
      projectId,
      req.userId
    );
    res.status(200).json(project);
  } catch (err) {
    next(err);
  }
}

async function createProject(req, res, next) {
  try {
    const teamId = parseInt(req.params.teamId);
    const { name, description } = req.body;
    const project = await projectService.createProject(
      teamId,
      req.userId,
      name,
      description
    );
    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
}

async function updateProject(req, res, next) {
  try {
    const teamId = parseInt(req.params.teamId);
    const projectId = parseInt(req.params.projectId);
    const { name, description } = req.body;
    const project = await projectService.updateProject(
      teamId,
      projectId,
      req.userId,
      name,
      description
    );
    res.status(200).json(project);
  } catch (err) {
    next(err);
  }
}

async function deleteProject(req, res, next) {
  try {
    const teamId = parseInt(req.params.teamId);
    const projectId = parseInt(req.params.projectId);
    const deleted = await projectService.deleteProject(
      teamId,
      projectId,
      req.userId
    );
    res.status(200).json({
      message: "Project deleted successfully.",
      deleted
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
};
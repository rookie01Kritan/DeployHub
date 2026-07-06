// src/controllers/learningController.js

const learningService = require("../services/learningService");

async function getModules(req, res, next) {
  try {
    const teamId = parseInt(req.params.teamId);
    const modules = await learningService.getModules(teamId, req.userId);
    res.status(200).json(modules);
  } catch (err) {
    next(err);
  }
}

async function getModuleWithLessons(req, res, next) {
  try {
    const teamId = parseInt(req.params.teamId);
    const moduleId = parseInt(req.params.moduleId);
    const module = await learningService.getModuleWithLessons(
      teamId, moduleId, req.userId
    );
    res.status(200).json(module);
  } catch (err) {
    next(err);
  }
}

async function createModule(req, res, next) {
  try {
    const teamId = parseInt(req.params.teamId);
    const { title, description } = req.body;
    const module = await learningService.createModule(
      teamId, req.userId, title, description
    );
    res.status(201).json(module);
  } catch (err) {
    next(err);
  }
}

async function updateModule(req, res, next) {
  try {
    const teamId = parseInt(req.params.teamId);
    const moduleId = parseInt(req.params.moduleId);
    const { title, description } = req.body;
    const module = await learningService.updateModule(
      teamId, moduleId, req.userId, title, description
    );
    res.status(200).json(module);
  } catch (err) {
    next(err);
  }
}

async function deleteModule(req, res, next) {
  try {
    const teamId = parseInt(req.params.teamId);
    const moduleId = parseInt(req.params.moduleId);
    const deleted = await learningService.deleteModule(
      teamId, moduleId, req.userId
    );
    res.status(200).json({
      message: "Module deleted successfully.",
      deleted
    });
  } catch (err) {
    next(err);
  }
}

async function createLesson(req, res, next) {
  try {
    const teamId = parseInt(req.params.teamId);
    const moduleId = parseInt(req.params.moduleId);
    const { title, content, orderIndex } = req.body;
    const lesson = await learningService.createLesson(
      teamId, moduleId, req.userId, title, content, orderIndex
    );
    res.status(201).json(lesson);
  } catch (err) {
    next(err);
  }
}

async function updateLesson(req, res, next) {
  try {
    const teamId = parseInt(req.params.teamId);
    const moduleId = parseInt(req.params.moduleId);
    const lessonId = parseInt(req.params.lessonId);
    const updates = {};
    if (req.body.title !== undefined) updates.title = req.body.title;
    if (req.body.content !== undefined) updates.content = req.body.content;
    const lesson = await learningService.updateLesson(
      teamId, moduleId, lessonId, req.userId, updates
    );
    res.status(200).json(lesson);
  } catch (err) {
    next(err);
  }
}

async function deleteLesson(req, res, next) {
  try {
    const teamId = parseInt(req.params.teamId);
    const moduleId = parseInt(req.params.moduleId);
    const lessonId = parseInt(req.params.lessonId);
    const deleted = await learningService.deleteLesson(
      teamId, moduleId, lessonId, req.userId
    );
    res.status(200).json({
      message: "Lesson deleted successfully.",
      deleted
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getModules,
  getModuleWithLessons,
  createModule,
  updateModule,
  deleteModule,
  createLesson,
  updateLesson,
  deleteLesson
};
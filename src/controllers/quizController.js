// src/controllers/quizController.js

const quizService = require("../services/quizService");

async function createQuiz(req, res, next) {
  try {
    const teamId = parseInt(req.params.teamId);
    const moduleId = parseInt(req.params.moduleId);
    const { title } = req.body;
    const quiz = await quizService.createQuiz(
      teamId, moduleId, req.userId, title
    );
    res.status(201).json(quiz);
  } catch (err) {
    next(err);
  }
}

async function getQuiz(req, res, next) {
  try {
    const teamId = parseInt(req.params.teamId);
    const moduleId = parseInt(req.params.moduleId);
    const quiz = await quizService.getQuiz(teamId, moduleId, req.userId);
    res.status(200).json(quiz);
  } catch (err) {
    next(err);
  }
}

async function addQuestion(req, res, next) {
  try {
    const teamId = parseInt(req.params.teamId);
    const moduleId = parseInt(req.params.moduleId);
    const { questionText } = req.body;
    const question = await quizService.addQuestion(
      teamId, moduleId, req.userId, questionText
    );
    res.status(201).json(question);
  } catch (err) {
    next(err);
  }
}

async function addOption(req, res, next) {
  try {
    const teamId = parseInt(req.params.teamId);
    const moduleId = parseInt(req.params.moduleId);
    const questionId = parseInt(req.params.questionId);
    const { optionText, isCorrect } = req.body;
    const option = await quizService.addOption(
      teamId, moduleId, questionId, req.userId, optionText, isCorrect
    );
    res.status(201).json(option);
  } catch (err) {
    next(err);
  }
}

async function submitAttempt(req, res, next) {
  try {
    const teamId = parseInt(req.params.teamId);
    const moduleId = parseInt(req.params.moduleId);
    const { answers } = req.body;
    const result = await quizService.submitAttempt(
      teamId, moduleId, req.userId, answers
    );
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function getMyAttempts(req, res, next) {
  try {
    const teamId = parseInt(req.params.teamId);
    const moduleId = parseInt(req.params.moduleId);
    const attempts = await quizService.getMyAttempts(
      teamId, moduleId, req.userId
    );
    res.status(200).json(attempts);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createQuiz,
  getQuiz,
  addQuestion,
  addOption,
  submitAttempt,
  getMyAttempts
};
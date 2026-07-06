// src/controllers/authController.js
//
// Translates HTTP requests into service calls, and service
// results into HTTP responses.
// Contains ZERO business logic — only HTTP-layer concerns.

const authService = require("../services/authService");

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const result = await authService.register(name, email, password);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };
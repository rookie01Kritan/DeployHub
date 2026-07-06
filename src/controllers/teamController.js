// src/controllers/teamController.js

const teamService = require("../services/teamService");

async function createTeam(req, res, next) {
  try {
    const { name } = req.body;
    const team = await teamService.createTeam(name, req.userId);
    res.status(201).json(team);
  } catch (err) {
    next(err);
  }
}

async function getMyTeams(req, res, next) {
  try {
    const teams = await teamService.getMyTeams(req.userId);
    res.status(200).json(teams);
  } catch (err) {
    next(err);
  }
}

async function getTeamById(req, res, next) {
  try {
    const teamId = parseInt(req.params.id);
    const team = await teamService.getTeamById(teamId, req.userId);
    res.status(200).json(team);
  } catch (err) {
    next(err);
  }
}

module.exports = { createTeam, getMyTeams, getTeamById };
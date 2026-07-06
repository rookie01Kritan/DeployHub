// src/controllers/teamMemberController.js

const teamMemberService = require("../services/teamMemberService");

async function getMembers(req, res, next) {
  try {
    const teamId = parseInt(req.params.id);
    const members = await teamMemberService.getMembers(
      teamId,
      req.userId
    );
    res.status(200).json(members);
  } catch (err) {
    next(err);
  }
}

async function inviteMember(req, res, next) {
  try {
    const teamId = parseInt(req.params.id);
    const { email } = req.body;
    const member = await teamMemberService.inviteMember(
      teamId,
      req.userId,
      email
    );
    res.status(201).json(member);
  } catch (err) {
    next(err);
  }
}

async function updateMemberRole(req, res, next) {
  try {
    const teamId = parseInt(req.params.id);
    const targetUserId = parseInt(req.params.userId);
    const { role } = req.body;
    const updated = await teamMemberService.updateMemberRole(
      teamId,
      req.userId,
      targetUserId,
      role
    );
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
}

async function removeMember(req, res, next) {
  try {
    const teamId = parseInt(req.params.id);
    const targetUserId = parseInt(req.params.userId);
    const removed = await teamMemberService.removeMember(
      teamId,
      req.userId,
      targetUserId
    );
    res.status(200).json({
      message: "Member removed successfully.",
      removed
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMembers,
  inviteMember,
  updateMemberRole,
  removeMember
};
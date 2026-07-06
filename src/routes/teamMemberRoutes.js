// src/routes/teamMemberRoutes.js

const express = require("express");
const router = express.Router({ mergeParams: true });
const teamMemberController = require("../controllers/teamMemberController");
const authMiddleware = require("../middlewares/authMiddleware");

router.use(authMiddleware);

router.get("/", teamMemberController.getMembers);
router.post("/", teamMemberController.inviteMember);
router.patch("/:userId", teamMemberController.updateMemberRole);
router.delete("/:userId", teamMemberController.removeMember);

module.exports = router;
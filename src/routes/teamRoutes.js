const express = require("express");
const router = express.Router();
const teamController = require("../controllers/teamController");
const authMiddleware = require("../middlewares/authMiddleware");
const teamMemberRoutes = require("./teamMemberRoutes");

router.use(authMiddleware);

router.post("/", teamController.createTeam);
router.get("/", teamController.getMyTeams);
router.get("/:id", teamController.getTeamById);

router.use("/:id/members", teamMemberRoutes);

module.exports = router;
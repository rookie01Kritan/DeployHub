// src/routes/projectRoutes.js

const express = require("express");
const router = express.Router({ mergeParams: true });
const projectController = require("../controllers/projectController");
const authMiddleware = require("../middlewares/authMiddleware");

router.use(authMiddleware);

router.get("/", projectController.getProjects);
router.post("/", projectController.createProject);
router.get("/:projectId", projectController.getProjectById);
router.patch("/:projectId", projectController.updateProject);
router.delete("/:projectId", projectController.deleteProject);

module.exports = router;
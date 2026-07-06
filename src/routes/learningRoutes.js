// src/routes/learningRoutes.js

const express = require("express");
const router = express.Router({ mergeParams: true });
const learningController = require("../controllers/learningController");
const authMiddleware = require("../middlewares/authMiddleware");

router.use(authMiddleware);

// Module routes
router.get("/", learningController.getModules);
router.post("/", learningController.createModule);
router.get("/:moduleId", learningController.getModuleWithLessons);
router.patch("/:moduleId", learningController.updateModule);
router.delete("/:moduleId", learningController.deleteModule);

// Lesson routes (nested under modules)
router.post("/:moduleId/lessons", learningController.createLesson);
router.patch("/:moduleId/lessons/:lessonId", learningController.updateLesson);
router.delete("/:moduleId/lessons/:lessonId", learningController.deleteLesson);

module.exports = router;
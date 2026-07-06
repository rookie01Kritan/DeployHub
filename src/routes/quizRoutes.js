// src/routes/quizRoutes.js

const express = require("express");
const router = express.Router({ mergeParams: true });
const quizController = require("../controllers/quizController");
const authMiddleware = require("../middlewares/authMiddleware");

router.use(authMiddleware);

router.post("/", quizController.createQuiz);
router.get("/", quizController.getQuiz);
router.post("/questions", quizController.addQuestion);
router.post("/questions/:questionId/options", quizController.addOption);
router.post("/attempt", quizController.submitAttempt);
router.get("/attempts", quizController.getMyAttempts);

module.exports = router;
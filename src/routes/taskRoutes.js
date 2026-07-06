// src/routes/taskRoutes.js

const express = require("express");
const router = express.Router({ mergeParams: true });
const taskController = require("../controllers/taskController");
const authMiddleware = require("../middlewares/authMiddleware");

router.use(authMiddleware);

router.get("/", taskController.getTasks);
router.post("/", taskController.createTask);
router.get("/:taskId", taskController.getTaskById);
router.patch("/:taskId", taskController.updateTask);
router.delete("/:taskId", taskController.deleteTask);

module.exports = router;
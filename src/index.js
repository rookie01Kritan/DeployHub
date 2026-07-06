// src/index.js
//
// The application entry point. Creates the Express app,
// wires up middleware and routes, starts the server.

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const errorHandler = require("./middlewares/errorHandler");
const authMiddleware = require("./middlewares/authMiddleware");
const teamRoutes = require("./routes/teamRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const learningRoutes = require("./routes/learningRoutes");
const quizRoutes = require("./routes/quizRoutes");
const app = express();
const PORT = process.env.PORT || 5000;

// ── Global Middleware ─────────────────────────────────────────
app.use(cors());
app.use(express.json()); // parses incoming JSON request bodies

// ── Routes ───────────────────────────────────────────────────
app.use("/api/auth", authRoutes);


app.use("/api/teams", teamRoutes);

app.use("/api/teams/:teamId/projects", projectRoutes);

app.use("/api/teams/:teamId/projects/:projectId/tasks", taskRoutes);

app.use("/api/teams/:teamId/modules", learningRoutes);

app.use("/api/teams/:teamId/modules/:moduleId/quiz", quizRoutes);

app.get("/api/protected-test", authMiddleware, (req, res) => {
  res.json({
    message: `Middleware working. Your userId is: ${req.userId}`
  });
});

// ── Health Check ─────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// ── Error Handler (must be LAST) ─────────────────────────────
app.use(errorHandler);

// ── Start Server ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`DeployHub backend running on port ${PORT}`);
});

module.exports = app;
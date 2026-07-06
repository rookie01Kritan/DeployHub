// src/routes/authRoutes.js
//
// Maps HTTP methods + URL paths to controller functions.
// No logic here — purely declarative mapping.

const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/register", authController.register);
router.post("/login", authController.login);

module.exports = router;
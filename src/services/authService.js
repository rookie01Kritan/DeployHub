// src/services/authService.js
//
// Contains all business logic for authentication.
// Does NOT know about HTTP (no req, no res).
// Does NOT write SQL (calls repository functions instead).

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userRepository = require("../repositories/userRepository");
const { validateRegister, validateLogin } = require("../validators/authValidator");

const SALT_ROUNDS = 12;

// ── Register a new user ───────────────────────────────────────
async function register(name, email, password) {

  // Step 1 — Validate input shape
  const errors = validateRegister(name, email, password);
  if (errors.length > 0) {
    throw { status: 400, message: errors.join(", ") };
  }

  // Step 2 — Check if email is already taken
  const existing = await userRepository.findUserByEmail(email);
  if (existing) {
    throw { status: 409, message: "An account with this email already exists." };
  }

  // Step 3 — Hash the password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Step 4 — Create the user in the database
  const user = await userRepository.createUser(name, email, passwordHash);

  // Step 5 — Generate and return a JWT
  const token = generateToken(user.id);
  return { user, token };
}

// ── Login an existing user ────────────────────────────────────
async function login(email, password) {

  // Step 1 — Validate input shape
  const errors = validateLogin(email, password);
  if (errors.length > 0) {
    throw { status: 400, message: errors.join(", ") };
  }

  // Step 2 — Find the user (deliberately vague error if not found)
  const user = await userRepository.findUserByEmail(email);
  if (!user) {
    throw { status: 401, message: "Invalid email or password." };
  }

  // Step 3 — Compare the provided password against the stored hash
  const passwordMatch = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatch) {
    throw { status: 401, message: "Invalid email or password." };
  }

  // Step 4 — Generate and return a JWT
  const token = generateToken(user.id);
  const { password_hash, ...safeUser } = user;
  return { user: safeUser, token };
}

// ── Generate a signed JWT ─────────────────────────────────────
function generateToken(userId) {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

module.exports = { register, login };
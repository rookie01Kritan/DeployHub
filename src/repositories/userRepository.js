// src/repositories/userRepository.js
//
// The ONLY place in the entire application that contains SQL
// queries related to the users table.
// No business logic here — just raw database operations.

const pool = require("../config/db");

// ── Find a user by their email address ───────────────────────
// Used during login to check if an account exists.
// Returns the full user row (including password_hash) or null.
async function findUserByEmail(email) {
  const result = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );
  return result.rows[0] || null;
}

// ── Find a user by their ID ───────────────────────────────────
// Used after login/registration to return user data
// without the password_hash (we never send that to the client).
async function findUserById(id) {
  const result = await pool.query(
    "SELECT id, name, email, created_at FROM users WHERE id = $1",
    [id]
  );
  return result.rows[0] || null;
}

// ── Insert a new user row ─────────────────────────────────────
// Returns the newly created user's id and email.
// Note: we never return password_hash — not needed after creation.
async function createUser(name, email, passwordHash) {
  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, created_at`,
    [name, email, passwordHash]
  );
  return result.rows[0];
}

module.exports = { findUserByEmail, findUserById, createUser };
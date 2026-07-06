// src/middlewares/authMiddleware.js
//
// Protects routes by verifying the JWT token in the
// Authorization header. If valid, attaches userId to req
// so controllers can identify who is making the request.
// If invalid or missing, immediately returns 401.

const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {

  // Step 1 — Read the Authorization header
  const authHeader = req.headers.authorization;

  // Step 2 — Check it exists and starts with "Bearer "
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Access denied. No token provided."
    });
  }

  // Step 3 — Extract the raw token (everything after "Bearer ")
  const token = authHeader.split(" ")[1];

  // Step 4 — Verify the token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Step 5 — Attach userId to req for downstream use
    req.userId = decoded.userId;

    // Step 6 — Pass control to the next handler
    next();

  } catch (err) {
    // jwt.verify throws if token is invalid OR expired
    return res.status(401).json({
      error: "Access denied. Invalid or expired token."
    });
  }
}

module.exports = authMiddleware;
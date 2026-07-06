// src/middlewares/errorHandler.js
//
// A single centralized place that handles ALL errors thrown
// anywhere in the application. Express identifies this as an
// error handler because it takes exactly four parameters (err, req, res, next).

function errorHandler(err, req, res, next) {
  console.error("Error:", err.message || err);

  const status = err.status || 500;
  const message = err.message || "An unexpected error occurred.";

  res.status(status).json({ error: message });
}

module.exports = errorHandler;
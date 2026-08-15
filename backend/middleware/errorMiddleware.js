/**
 * @file server/middleware/errorMiddleware.js
 * Centralized Error Handling Middleware for Express
 */
const ApiError = require("../utils/apiError");

const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || error.name === "ValidationError" ? 400 : 500;
    const message = error.message || "Internal Server Error";
    error = new ApiError(statusCode, message, error.errors || [], err.stack);
  }

  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    errors: error.errors,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  };

  return res.status(error.statusCode).json(response);
};

const notFound = (req, res, next) => {
  const error = new ApiError(404, `Not Found - Endpoint [${req.method}] ${req.originalUrl} does not exist`);
  next(error);
};

module.exports = { errorHandler, notFound };

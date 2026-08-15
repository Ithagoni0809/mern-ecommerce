/**
 * @file server/middleware/validate.js
 * Request Body Validation Helper Middleware
 */
const ApiError = require("../utils/apiError");

const validateRequiredFields = (fields) => {
  return (req, res, next) => {
    const missing = [];
    fields.forEach((field) => {
      if (req.body[field] === undefined || req.body[field] === null || req.body[field] === "") {
        missing.push(field);
      }
    });

    if (missing.length > 0) {
      return next(
        new ApiError(
          400,
          `Missing required fields: ${missing.join(", ")}`,
          missing.map((f) => ({ field: f, message: `${f} is required` }))
        )
      );
    }
    next();
  };
};

module.exports = { validateRequiredFields };

/**
 * @file server/utils/asyncHandler.js
 * Higher-Order Function wrapper for Express async controllers
 */
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

module.exports = asyncHandler;

/**
 * @file server/middleware/authMiddleware.js
 * Protect Routes with JWT Bearer Access Tokens
 */
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new ApiError(401, "Not authorized to access this route, missing Access Token");
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "dev_jwt_access_secret_key_32_chars_long_spec"
    );

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      throw new ApiError(401, "User belonging to this token no longer exists");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, "Token verification failed or expired");
  }
});

module.exports = { protect };

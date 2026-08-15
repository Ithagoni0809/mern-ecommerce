/**
 * @file server/routes/authRoutes.js
 * Auth Route Definitions
 */
const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { authLimiter } = require("../middleware/rateLimiter");
const { validateRequiredFields } = require("../middleware/validate");

const router = express.Router();

router.post(
  "/register",
  authLimiter,
  validateRequiredFields(["name", "email", "password"]),
  registerUser
);

router.post(
  "/login",
  authLimiter,
  validateRequiredFields(["email", "password"]),
  loginUser
);

router.post("/logout", protect, logoutUser);
router.post("/refresh-token", refreshToken);

router.post(
  "/forgot-password",
  validateRequiredFields(["email"]),
  forgotPassword
);

router.post(
  "/reset-password/:resetToken",
  validateRequiredFields(["password"]),
  resetPassword
);

router.get("/verify-email/:verificationToken", verifyEmail);
router.post("/resend-verification", resendVerification);

module.exports = router;

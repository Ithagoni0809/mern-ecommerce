/**
 * @file server/middleware/rateLimiter.js
 * Express Rate Limiting Configurations with Development / Demo Whitelist
 */
const rateLimit = require("express-rate-limit");

const isDev = process.env.NODE_ENV !== "production";

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 10000 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => isDev || req.ip === "127.0.0.1" || req.ip === "::1",
  message: {
    success: false,
    statusCode: 429,
    message: "Too many requests from this IP, please try again after 15 minutes",
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 5000 : 300, // Generous limit in dev and production
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => isDev || req.ip === "127.0.0.1" || req.ip === "::1",
  message: {
    success: false,
    statusCode: 429,
    message: "Too many login/registration attempts, please try again after a few minutes",
  },
});

module.exports = { apiLimiter, authLimiter };

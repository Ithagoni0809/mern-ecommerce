/**
 * @file server/routes/deliveryRoutes.js
 * Delivery Agent Routes for Doorstep OTP Handover & Tracking
 */
const express = require("express");
const {
  getDeliveryOrders,
  generateDeliveryOtp,
  verifyDeliveryOtp,
} = require("../controllers/deliveryController");
const { protect } = require("../middleware/authMiddleware");
const { validateRequiredFields } = require("../middleware/validate");

const router = express.Router();

router.use(protect); // Delivery partner must be authenticated

router.get("/orders", getDeliveryOrders);
router.post("/orders/:id/generate-otp", generateDeliveryOtp);
router.post(
  "/orders/:id/verify-otp",
  validateRequiredFields(["otp"]),
  verifyDeliveryOtp
);

module.exports = router;

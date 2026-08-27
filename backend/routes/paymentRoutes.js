/**
 * @file server/routes/paymentRoutes.js
 * Payment Routes Specification
 */
const express = require("express");
const {
  createPaymentIntent,
  confirmPayment,
  createRazorpayOrder,
  verifyRazorpayPayment,
} = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");
const { validateRequiredFields } = require("../middleware/validate");

const router = express.Router();

router.use(protect);

router.post(
  "/create-intent",
  validateRequiredFields(["amount"]),
  createPaymentIntent
);

router.post(
  "/confirm",
  validateRequiredFields(["orderId"]),
  confirmPayment
);

router.post(
  "/razorpay-order",
  validateRequiredFields(["amount"]),
  createRazorpayOrder
);

router.post(
  "/verify-razorpay",
  validateRequiredFields(["orderId", "razorpay_payment_id"]),
  verifyRazorpayPayment
);

module.exports = router;

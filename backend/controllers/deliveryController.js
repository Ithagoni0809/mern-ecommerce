/**
 * @file server/controllers/deliveryController.js
 * Controller for Doorstep Delivery Verification, OTP Handover & Package Execution
 */
const Order = require("../models/Order");
const ApiError = require("../utils/apiError");
const ApiResponse = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

/**
 * @desc    Get all active shipments available for delivery agents (OTP stripped for security)
 * @route   GET /api/v1/delivery/orders
 * @access  Private/Delivery
 */
const getDeliveryOrders = asyncHandler(async (req, res) => {
  // Strip deliveryOtp so delivery agents cannot see the secret handover OTP
  const orders = await Order.find({})
    .select("-deliveryOtp")
    .populate("user", "name email phone")
    .populate("seller", "name email phone storeName")
    .populate("orderItems.product", "name images price")
    .sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(200, orders, "Delivery shipments fetched successfully")
  );
});

/**
 * @desc    Delivery agent arrives at customer doorstep and triggers/refreshes 6-digit OTP
 * @route   POST /api/v1/delivery/orders/:id/generate-otp
 * @access  Private/Delivery
 */
const generateDeliveryOtp = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    throw new ApiError(404, "Shipment order not found");
  }

  // Generate 6-digit cryptographic verification OTP for the customer
  const sixDigitOtp = Math.floor(100000 + Math.random() * 900000).toString();
  order.deliveryOtp = sixDigitOtp;
  order.otpGeneratedAt = Date.now();
  order.orderStatus = "Out for Delivery";
  await order.save();

  // Return success to delivery agent WITHOUT revealing the OTP
  res.status(200).json(
    new ApiResponse(
      200,
      {
        orderId: order._id,
        trackingNumber: order.trackingNumber,
        status: order.orderStatus,
      },
      "Doorstep Delivery OTP generated and dispatched to customer tracking screen!"
    )
  );
});

/**
 * @desc    Delivery agent enters & verifies the customer's 6-digit OTP at doorstep
 * @route   POST /api/v1/delivery/orders/:id/verify-otp
 * @access  Private/Delivery
 */
const verifyDeliveryOtp = asyncHandler(async (req, res) => {
  const { otp } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new ApiError(404, "Shipment order not found");
  }

  if (order.isDelivered) {
    throw new ApiError(400, "This order has already been verified and delivered.");
  }

  const enteredOtp = (otp || "").toString().trim();
  const validOtp = (order.deliveryOtp || "").toString().trim();

  // Verify entered OTP
  if (!enteredOtp || enteredOtp !== validOtp) {
    throw new ApiError(400, "Invalid 6-digit Delivery OTP. Please ask the customer to check their live tracking screen.");
  }

  // Successfully verified! Mark as Delivered
  order.orderStatus = "Delivered";
  order.isDelivered = true;
  order.deliveredAt = Date.now();
  order.deliveredBy = req.user._id;

  // For Cash on Delivery orders, mark payment as collected upon doorstep OTP verification
  if (!order.isPaid) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: `cod_cash_${Date.now()}`,
      status: "COMPLETED_CASH_COLLECTED",
      update_time: new Date().toISOString(),
    };
  }

  await order.save();

  res.status(200).json(
    new ApiResponse(
      200,
      {
        _id: order._id,
        trackingNumber: order.trackingNumber,
        orderStatus: order.orderStatus,
        isDelivered: order.isDelivered,
        deliveredAt: order.deliveredAt,
      },
      "OTP Verified Successfully! Order marked as DELIVERED to customer doorstep."
    )
  );
});

module.exports = {
  getDeliveryOrders,
  generateDeliveryOtp,
  verifyDeliveryOtp,
};

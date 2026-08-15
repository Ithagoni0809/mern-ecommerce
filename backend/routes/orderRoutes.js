/**
 * @file server/routes/orderRoutes.js
 * Order Routes Specification
 */
const express = require("express");
const {
  createOrder,
  getOrderById,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  trackOrder,
} = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const { validateRequiredFields } = require("../middleware/validate");

const router = express.Router();

// Public Tracking routes (handles both param styles)
router.get("/track/:identifier", trackOrder);
router.get("/track", trackOrder);

// Protected routes
router.use(protect);

router
  .route("/")
  .post(
    validateRequiredFields(["orderItems", "shippingAddress", "paymentMethod", "totalPrice"]),
    createOrder
  )
  .get(authorize("admin"), getAllOrders);

router.get("/myorders", getMyOrders);
router.get("/my-orders", getMyOrders);

router.route("/:id").get(getOrderById);

router
  .route("/:id/status")
  .put(authorize("admin"), validateRequiredFields(["orderStatus"]), updateOrderStatus);

module.exports = router;

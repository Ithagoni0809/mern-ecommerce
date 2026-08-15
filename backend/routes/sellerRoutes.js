/**
 * @file server/routes/sellerRoutes.js
 * Seller Portal, Product Submissions & Customer Order Processing Routes
 */
const express = require("express");
const {
  applyForSeller,
  getSellerStatus,
  sellerSubmitProduct,
  getSellerProducts,
  getSellerOrders,
  updateSellerOrderStatus,
} = require("../controllers/sellerController");
const { protect } = require("../middleware/authMiddleware");
const { validateRequiredFields } = require("../middleware/validate");

const router = express.Router();

router.use(protect); // All seller routes require login

router.post(
  "/apply",
  validateRequiredFields(["storeName", "businessCategory", "storeDescription", "contactPhone", "businessAddress"]),
  applyForSeller
);

router.get("/status", getSellerStatus);

router.post(
  "/products",
  validateRequiredFields(["name", "description", "price", "category", "brand", "stock"]),
  sellerSubmitProduct
);

router.get("/my-products", getSellerProducts);

// Customer Order Processing for Merchants
router.get("/orders", getSellerOrders);
router.put("/orders/:id/status", validateRequiredFields(["orderStatus"]), updateSellerOrderStatus);

module.exports = router;

/**
 * @file server/routes/cartRoutes.js
 * Cart Routes Definition
 */
const express = require("express");
const {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
} = require("../controllers/cartController");
const { protect } = require("../middleware/authMiddleware");
const { validateRequiredFields } = require("../middleware/validate");

const router = express.Router();

router.use(protect); // Require auth for all cart routes

router
  .route("/")
  .get(getCart)
  .post(validateRequiredFields(["productId"]), addToCart)
  .delete(clearCart);

router
  .route("/items/:productId")
  .put(validateRequiredFields(["quantity"]), updateCartItemQuantity)
  .delete(removeFromCart);

module.exports = router;

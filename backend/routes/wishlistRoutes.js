/**
 * @file server/routes/wishlistRoutes.js
 * Wishlist Routes Definition
 */
const express = require("express");
const {
  getWishlist,
  toggleWishlistItem,
} = require("../controllers/wishlistController");
const { protect } = require("../middleware/authMiddleware");
const { validateRequiredFields } = require("../middleware/validate");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(getWishlist)
  .post(validateRequiredFields(["productId"]), toggleWishlistItem);

module.exports = router;

/**
 * @file server/controllers/wishlistController.js
 * Production Wishlist Controller
 */
const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");
const ApiError = require("../utils/apiError");
const ApiResponse = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

/**
 * @desc    Get user wishlist
 * @route   GET /api/v1/wishlist
 * @access  Private
 */
const getWishlist = asyncHandler(async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user._id }).populate("products", "name price discountPrice images rating stock");
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user._id, products: [] });
  }
  res.status(200).json(new ApiResponse(200, wishlist, "Wishlist retrieved"));
});

/**
 * @desc    Toggle product in wishlist (Add/Remove)
 * @route   POST /api/v1/wishlist
 * @access  Private
 */
const toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");

  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) wishlist = await Wishlist.create({ user: req.user._id, products: [] });

  const exists = wishlist.products.some((id) => id.toString() === productId);
  if (exists) {
    wishlist.products = wishlist.products.filter((id) => id.toString() !== productId);
  } else {
    wishlist.products.push(productId);
  }

  await wishlist.save();
  const populated = await Wishlist.findById(wishlist._id).populate("products", "name price discountPrice images rating stock");
  res.status(200).json(new ApiResponse(200, populated, exists ? "Removed from wishlist" : "Added to wishlist"));
});

const toggleWishlistItem = toggleWishlist;

module.exports = {
  getWishlist,
  toggleWishlist,
  toggleWishlistItem,
};

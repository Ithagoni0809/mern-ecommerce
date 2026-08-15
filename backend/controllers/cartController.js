/**
 * @file server/controllers/cartController.js
 * Production Cart Controller
 */
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const ApiError = require("../utils/apiError");
const ApiResponse = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

/**
 * @desc    Get user cart
 * @route   GET /api/v1/cart
 * @access  Private
 */
const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate("items.product", "name price discountPrice images stock");
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }
  res.status(200).json(new ApiResponse(200, cart, "Cart retrieved successfully"));
});

/**
 * @desc    Add product to cart
 * @route   POST /api/v1/cart
 * @access  Private
 */
const addToCart = asyncHandler(async (req, res) => {
  if (req.user?.role === "delivery") {
    throw new ApiError(403, "Delivery agent accounts cannot add items to cart.");
  }

  const { productId, quantity = 1 } = req.body;
  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");

  if (product.seller && product.seller.toString() === req.user._id.toString()) {
    throw new ApiError(400, "You cannot add your own listed products to the cart.");
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

  const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
  const price = product.discountPrice > 0 ? product.discountPrice : product.price;

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += Number(quantity);
    cart.items[itemIndex].price = price;
  } else {
    cart.items.push({ product: productId, quantity: Number(quantity), price });
  }

  await cart.save();
  const populatedCart = await Cart.findById(cart._id).populate("items.product", "name price discountPrice images stock");
  res.status(200).json(new ApiResponse(200, populatedCart, "Product added to cart"));
});

/**
 * @desc    Update item quantity in cart
 * @route   PUT /api/v1/cart/items/:productId
 * @access  Private
 */
const updateCartItemQuantity = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw new ApiError(404, "Cart not found");

  const itemIndex = cart.items.findIndex((item) => item.product.toString() === req.params.productId);
  if (itemIndex === -1) throw new ApiError(404, "Item not in cart");

  if (Number(quantity) <= 0) {
    cart.items.splice(itemIndex, 1);
  } else {
    cart.items[itemIndex].quantity = Number(quantity);
  }

  await cart.save();
  const populatedCart = await Cart.findById(cart._id).populate("items.product", "name price discountPrice images stock");
  res.status(200).json(new ApiResponse(200, populatedCart, "Cart quantity updated"));
});

/**
 * @desc    Remove single item from cart
 * @route   DELETE /api/v1/cart/items/:productId
 * @access  Private
 */
const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw new ApiError(404, "Cart not found");

  cart.items = cart.items.filter((item) => item.product.toString() !== req.params.productId);
  await cart.save();

  const populatedCart = await Cart.findById(cart._id).populate("items.product", "name price discountPrice images stock");
  res.status(200).json(new ApiResponse(200, populatedCart, "Item removed from cart"));
});

/**
 * @desc    Clear entire cart
 * @route   DELETE /api/v1/cart
 * @access  Private
 */
const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    cart.items = [];
    await cart.save();
  }
  res.status(200).json(new ApiResponse(200, { items: [] }, "Cart cleared"));
});

module.exports = {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
};

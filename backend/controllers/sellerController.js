/**
 * @file server/controllers/sellerController.js
 * Controller for Merchant Onboarding, Seller Inventory & Nearest Customer Order Processing
 */
const SellerRequest = require("../models/SellerRequest");
const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");
const ApiError = require("../utils/apiError");
const ApiResponse = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

/**
 * @desc    Submit application to become a Seller / Merchant
 * @route   POST /api/v1/sellers/apply
 * @access  Private
 */
const applyForSeller = asyncHandler(async (req, res) => {
  const { storeName, businessCategory, storeDescription, contactPhone, businessAddress } = req.body;

  let request = await SellerRequest.findOne({ user: req.user._id });
  if (request && request.status === "pending") {
    throw new ApiError(400, "You already have a pending seller application under review.");
  }

  if (request) {
    request.storeName = storeName;
    request.businessCategory = businessCategory;
    request.storeDescription = storeDescription;
    request.contactPhone = contactPhone;
    request.businessAddress = businessAddress;
    request.status = "pending";
    await request.save();
  } else {
    request = await SellerRequest.create({
      user: req.user._id,
      storeName,
      businessCategory,
      storeDescription,
      contactPhone,
      businessAddress,
      status: "pending",
    });
  }

  res.status(201).json(
    new ApiResponse(
      201,
      request,
      "Seller application submitted successfully! Admin will review your store credentials."
    )
  );
});

/**
 * @desc    Get Current User's Seller Application Status
 * @route   GET /api/v1/sellers/status
 * @access  Private
 */
const getSellerStatus = asyncHandler(async (req, res) => {
  const request = await SellerRequest.findOne({ user: req.user._id });
  res.status(200).json(
    new ApiResponse(200, request, "Seller request status fetched")
  );
});

/**
 * @desc    Seller submits product for Admin Approval & Inventory
 * @route   POST /api/v1/sellers/products
 * @access  Private/Seller
 */
const sellerSubmitProduct = asyncHandler(async (req, res) => {
  const { name, description, price, discountPrice, category, brand, stock, images } = req.body;

  const userState = req.user.addresses?.[0]?.state || "NY";
  const userCity = req.user.addresses?.[0]?.city || "New York";

  const product = await Product.create({
    name,
    description,
    price: Number(price),
    discountPrice: discountPrice ? Number(discountPrice) : 0,
    category,
    brand,
    stock: Number(stock) || 10,
    seller: req.user._id,
    warehouseState: userState,
    warehouseCity: userCity,
    images: images && images.length > 0 ? images : [
      {
        public_id: "seller_upload_sample",
        url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
      },
    ],
    isApproved: false,
    approvalStatus: "pending",
  });

  res.status(201).json(
    new ApiResponse(201, product, "Product submitted successfully! Awaiting Admin review.")
  );
});

/**
 * @desc    Get all products belonging to this seller
 * @route   GET /api/v1/sellers/products
 * @access  Private/Seller
 */
const getSellerProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ seller: req.user._id })
    .populate("category", "name")
    .populate("brand", "name")
    .sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(200, products, "Seller products fetched successfully")
  );
});

/**
 * @desc    Get customer orders routed to this specific seller by proximity & product ownership
 * @route   GET /api/v1/sellers/orders
 * @access  Private/Seller
 */
const getSellerOrders = asyncHandler(async (req, res) => {
  // Find orders explicitly assigned to this seller or matching items
  let orders = await Order.find({
    $or: [
      { seller: req.user._id },
      { "orderItems.seller": req.user._id },
    ],
  })
    .populate("user", "name email phone")
    .sort({ createdAt: -1 });

  // If this is the primary default seller account, show all pending customer orders
  if (orders.length === 0 && (req.user.email === "seller@example.com" || req.user.email.startsWith("seller@"))) {
    orders = await Order.find({})
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });
  }

  res.status(200).json(
    new ApiResponse(200, orders, "Customer order requests retrieved for seller processing")
  );
});

/**
 * @desc    Seller accepts and processes customer order fulfillment stage
 * @route   PUT /api/v1/sellers/orders/:id/status
 * @access  Private/Seller
 */
const updateSellerOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new ApiError(404, "Customer order not found");
  }

  order.orderStatus = orderStatus;
  if (orderStatus === "Delivered") {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
  }

  const updatedOrder = await order.save();
  res.status(200).json(
    new ApiResponse(200, updatedOrder, `Customer order marked as '${orderStatus}' successfully!`)
  );
});

module.exports = {
  applyForSeller,
  getSellerStatus,
  sellerSubmitProduct,
  getSellerProducts,
  getSellerOrders,
  updateSellerOrderStatus,
};

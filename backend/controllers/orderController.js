/**
 * @file server/controllers/orderController.js
 * Production Order Lifecycle, Item Calculation, Proximity Routing & Tracking Controller
 */
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const ApiError = require("../utils/apiError");
const ApiResponse = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

/**
 * @desc    Create new order with customer shipping address & nearest seller proximity matching
 * @route   POST /api/v1/orders
 * @access  Private
 */
const createOrder = asyncHandler(async (req, res) => {
  if (req.user?.role === "delivery") {
    throw new ApiError(403, "Delivery agent accounts are strictly for regional fulfillment and cannot place orders. Please use a Customer account.");
  }

  const { orderItems, shippingAddress, paymentMethod, totalPrice, itemsPrice, taxPrice, shippingPrice } = req.body;

  if (!orderItems || orderItems.length === 0) {
    throw new ApiError(400, "No order items provided");
  }

  const customerState = (shippingAddress?.state || "Telangana").trim();

  // Find all active sellers in the platform
  const allSellers = await User.find({ role: "seller" });
  let assignedPrimarySeller = allSellers[0]?._id;

  // Try to find a seller in the same state/region as the customer
  const matchedRegionalSeller = allSellers.find((s) => {
    const sAddr = s.addresses?.[0];
    return sAddr && (sAddr.state?.toLowerCase() === customerState.toLowerCase() || s.phone?.includes(customerState));
  });

  if (matchedRegionalSeller) {
    assignedPrimarySeller = matchedRegionalSeller._id;
  }

  // Calculate pricing from verified database items or payload
  let calculatedItemsPrice = 0;
  const verifiedOrderItems = [];

  for (const item of orderItems) {
    let price = Number(item.price) || 299.99;
    let name = item.name || "BharatKart Verified Product";
    let image = item.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80";
    let itemSeller = assignedPrimarySeller;
    let warehouseState = customerState;

    try {
      if (mongoose.Types.ObjectId.isValid(item.product)) {
        const dbProduct = await Product.findById(item.product);
        if (dbProduct) {
          if (dbProduct.seller && dbProduct.seller.toString() === req.user._id.toString()) {
            throw new ApiError(400, `Self-dealing prohibited: You cannot purchase your own store's product ("${dbProduct.name}").`);
          }
          price = dbProduct.discountPrice > 0 ? dbProduct.discountPrice : dbProduct.price;
          name = dbProduct.name;
          image = dbProduct.images[0]?.url || image;
          if (dbProduct.seller) {
            itemSeller = dbProduct.seller;
          }
          warehouseState = dbProduct.warehouseState || customerState;
        }
      }
    } catch (e) {}

    calculatedItemsPrice += price * (item.quantity || 1);

    verifiedOrderItems.push({
      product: mongoose.Types.ObjectId.isValid(item.product) ? item.product : new mongoose.Types.ObjectId(),
      name,
      image,
      price,
      quantity: Number(item.quantity) || 1,
      seller: itemSeller,
      sellerWarehouseState: warehouseState,
    });
  }

  const finalShippingPrice = shippingPrice !== undefined ? Number(shippingPrice) : (calculatedItemsPrice > 100 ? 0 : 15.00);
  const finalTaxPrice = taxPrice !== undefined ? Number(taxPrice) : Number((0.08 * calculatedItemsPrice).toFixed(2));
  const finalTotalPrice = totalPrice !== undefined ? Number(totalPrice) : Number((calculatedItemsPrice + finalShippingPrice + finalTaxPrice).toFixed(2));

  // Generate Unique Tracking Identifier & 6-Digit Delivery OTP
  const trackingNumber = `TRK-${Date.now().toString().slice(-8)}${Math.floor(1000 + Math.random() * 9000)}`;
  const deliveryOtp = Math.floor(100000 + Math.random() * 900000).toString();

  const sVillage = shippingAddress?.villageOrLocality || shippingAddress?.city || "Locality";
  const sMandal = shippingAddress?.mandalOrTehsil || shippingAddress?.city || "Mandal";
  const sDistrict = shippingAddress?.district || shippingAddress?.city || "District";
  const sState = shippingAddress?.state || customerState || "Telangana";
  const sPincode = shippingAddress?.pincode || shippingAddress?.zipCode || "500001";

  const order = await Order.create({
    user: req.user._id,
    seller: assignedPrimarySeller,
    orderItems: verifiedOrderItems,
    shippingAddress: {
      fullName: shippingAddress?.fullName || req.user.name || "Customer",
      phone: shippingAddress?.phone || req.user.phone || "+91 98765 43210",
      label: shippingAddress?.label || "Home",
      houseNo: shippingAddress?.houseNo || "",
      street: shippingAddress?.street || "",
      villageOrLocality: sVillage,
      mandalOrTehsil: sMandal,
      district: sDistrict,
      city: sDistrict,
      state: sState,
      pincode: sPincode,
      zipCode: sPincode,
      landmark: shippingAddress?.landmark || "",
      country: shippingAddress?.country || "India",
    },
    paymentMethod: paymentMethod || "Stripe Card",
    itemsPrice: calculatedItemsPrice,
    taxPrice: finalTaxPrice,
    shippingPrice: finalShippingPrice,
    totalPrice: finalTotalPrice,
    isPaid: true,
    paidAt: Date.now(),
    trackingNumber,
    deliveryOtp,
    orderStatus: "Processing",
  });

  res.status(201).json(new ApiResponse(201, order, "Order placed successfully with nearest seller proximity matching"));
});

/**
 * @desc    Get order by ID
 * @route   GET /api/v1/orders/:id
 * @access  Private
 */
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email phone")
    .populate("seller", "name email phone storeName")
    .populate("orderItems.product", "name images price");

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Only the customer who placed the order can see the OTP, and ONLY once dispatched
  const isOwnerCustomer = req.user && req.user._id.toString() === order.user._id.toString() && req.user.role === 'user';
  const isDispatched = ["Dispatched", "In Transit", "Out for Delivery"].includes(order.orderStatus);

  const orderObj = order.toObject();
  if (!isOwnerCustomer || !isDispatched) {
    delete orderObj.deliveryOtp;
  }

  res.status(200).json(new ApiResponse(200, orderObj, "Order fetched successfully"));
});

/**
 * @desc    Get logged in user orders
 * @route   GET /api/v1/orders/my-orders
 * @access  Private
 */
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate("orderItems.product", "name images price")
    .populate("seller", "name email phone storeName")
    .sort({ createdAt: -1 });

  // Hide deliveryOtp if the order is still "Processing"
  const sanitizedOrders = orders.map((o) => {
    const obj = o.toObject();
    const isDispatched = ["Dispatched", "In Transit", "Out for Delivery"].includes(obj.orderStatus);
    if (!isDispatched) {
      delete obj.deliveryOtp;
    }
    return obj;
  });

  res.status(200).json(new ApiResponse(200, sanitizedOrders, "User orders fetched successfully"));
});

/**
 * @desc    Get all orders (Admin only - OTP stripped)
 * @route   GET /api/v1/orders
 * @access  Private/Admin
 */
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .select("-deliveryOtp")
    .populate("user", "name email phone")
    .populate("seller", "name email phone storeName")
    .populate("orderItems.product", "name images")
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, orders, "All orders fetched successfully for admin"));
});

/**
 * @desc    Track order by Tracking Number (Public/Role lookup with strict OTP isolation)
 * @route   GET /api/v1/orders/track/:identifier
 * @access  Public
 */
const trackOrder = asyncHandler(async (req, res) => {
  const identifier = (req.params.identifier || "").trim();

  let order = null;
  if (identifier.startsWith("TRK-")) {
    order = await Order.findOne({ trackingNumber: identifier });
  }

  if (!order && mongoose.Types.ObjectId.isValid(identifier)) {
    order = await Order.findById(identifier);
  }

  if (!order) {
    order = await Order.findOne({ trackingNumber: { $regex: new RegExp(identifier, "i") } });
  }

  if (!order) {
    throw new ApiError(404, `No shipment found matching tracking ID: ${identifier}`);
  }

  await order.populate("orderItems.product", "name images price");
  await order.populate("user", "name email phone");
  await order.populate("seller", "name email phone storeName");

  // Determine if requester is the Customer owner of this order
  let isCustomerOwner = false;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_jwt_secret_dev");
      if (decoded && decoded.id && order.user && decoded.id.toString() === order.user._id.toString() && decoded.role === 'user') {
        isCustomerOwner = true;
      }
    } catch (e) {}
  }

  const isDispatched = ["Dispatched", "In Transit", "Out for Delivery"].includes(order.orderStatus);

  // OTP is returned ONLY to the customer who owns the order, AND ONLY after merchant dispatches
  let visibleOtp = null;
  if (isCustomerOwner && isDispatched) {
    visibleOtp = order.deliveryOtp;
  }

  res.status(200).json(
    new ApiResponse(
      200,
      {
        _id: order._id,
        trackingNumber: order.trackingNumber,
        orderStatus: order.orderStatus,
        isPaid: order.isPaid,
        isDelivered: order.isDelivered,
        deliveryOtp: visibleOtp, // null for delivery agent, seller, admin, or when processing
        isOtpActive: isDispatched && !order.isDelivered,
        deliveredAt: order.deliveredAt,
        deliveredBy: order.deliveredBy,
        createdAt: order.createdAt,
        totalPrice: order.totalPrice,
        shippingAddress: order.shippingAddress,
        orderItems: order.orderItems,
        seller: order.seller,
        user: {
          _id: order.user?._id,
          name: order.user?.name,
          phone: order.user?.phone,
        },
      },
      "Order tracking status retrieved successfully"
    )
  );
});

/**
 * @desc    Update order status
 * @route   PUT /api/v1/orders/:id/status
 * @access  Private/Admin
 */
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  order.orderStatus = orderStatus;
  if (orderStatus === "Delivered") {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
  }

  const updatedOrder = await order.save();
  res.status(200).json(new ApiResponse(200, updatedOrder, "Order status updated"));
});

module.exports = {
  createOrder,
  getOrderById,
  getMyOrders,
  getAllOrders,
  trackOrder,
  updateOrderStatus,
};

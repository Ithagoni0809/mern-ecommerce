/**
 * @file server/models/Order.js
 * Mongoose Schema for Order Lifecycle, Indian Address (Village, Mandal, District) & OTP Delivery Handover
 */
const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity cannot be less than 1"],
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    sellerWarehouseState: {
      type: String,
      default: "Telangana",
    },
  },
  { _id: true }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, default: "Customer" },
    phone: { type: String, default: "+91 98765 43210" },
    label: { type: String, default: "Home" },
    houseNo: { type: String, default: "" }, // Flat / House / Door No.
    street: { type: String, default: "" }, // Street / Colony
    villageOrLocality: { type: String, default: "Locality" }, // Village / Town / Locality
    mandalOrTehsil: { type: String, default: "Mandal" }, // Mandal / Taluk / Tehsil
    district: { type: String, default: "District" }, // District / City
    city: { type: String, default: "" },
    state: { type: String, default: "Telangana" }, // State
    pincode: { type: String, default: "500001" }, // 6-Digit PIN
    zipCode: { type: String, default: "" },
    landmark: { type: String, default: "" }, // Landmark
    country: { type: String, default: "India" },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    orderItems: [orderItemSchema],
    shippingAddress: shippingAddressSchema,
    paymentMethod: {
      type: String,
      required: true,
      default: "Stripe",
    },
    paymentResult: {
      id: String,
      status: String,
      update_time: String,
      email_address: String,
    },
    itemsPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: true,
    },
    paidAt: {
      type: Date,
      default: Date.now,
    },
    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
    },
    deliveredAt: Date,
    deliveredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    deliveryOtp: {
      type: String,
      default: function () {
        return Math.floor(100000 + Math.random() * 900000).toString();
      },
    },
    otpGeneratedAt: {
      type: Date,
      default: Date.now,
    },
    trackingNumber: {
      type: String,
      unique: true,
      required: true,
    },
    orderStatus: {
      type: String,
      enum: ["Processing", "Dispatched", "In Transit", "Out for Delivery", "Delivered", "Cancelled"],
      default: "Processing",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);

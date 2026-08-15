/**
 * @file server/models/SellerRequest.js
 * Mongoose Schema for Seller / Merchant Onboarding Applications
 */
const mongoose = require("mongoose");

const sellerRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    storeName: {
      type: String,
      required: [true, "Store name is required"],
      trim: true,
    },
    businessCategory: {
      type: String,
      required: [true, "Business category is required"],
    },
    storeDescription: {
      type: String,
      required: [true, "Store description is required"],
    },
    contactPhone: {
      type: String,
      required: [true, "Contact phone is required"],
    },
    businessAddress: {
      type: String,
      required: [true, "Business address is required"],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    adminNotes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SellerRequest", sellerRequestSchema);

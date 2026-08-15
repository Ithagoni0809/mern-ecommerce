/**
 * @file server/models/Payment.js
 * Mongoose Schema for Transaction Records & Stripe Audits
 */
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    stripePaymentIntentId: {
      type: String,
      default: function () {
        return `pi_${Date.now()}`;
      },
    },
    transactionId: {
      type: String,
      default: function () {
        return `txn_${Date.now()}`;
      },
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "usd",
    },
    status: {
      type: String,
      enum: ["pending", "succeeded", "failed", "refunded"],
      default: "succeeded",
    },
    paymentMethod: {
      type: String,
      default: "stripe",
    },
    receiptUrl: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Payment", paymentSchema);

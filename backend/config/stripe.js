/**
 * @file server/config/stripe.js
 * Production Stripe Payment SDK Client Configuration
 */
const Stripe = require("stripe");

const stripeKey = process.env.STRIPE_SECRET_KEY || "sk_test_mock_stripe_key_for_development";
const stripe = new Stripe(stripeKey, {
  apiVersion: "2023-10-16",
});

module.exports = stripe;
module.exports.stripe = stripe;

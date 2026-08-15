/**
 * @file server/utils/seeder.js
 * Production Database Catalog & Admin Seeder
 */
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");
const Category = require("../models/Category");
const Brand = require("../models/Brand");
const Product = require("../models/Product");

dotenv.config();

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error("Please specify MONGO_URI in server/.env");
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log("[Seeder] Connected to MongoDB Atlas...");

    // Clear existing collections
    await User.deleteMany();
    await Category.deleteMany();
    await Brand.deleteMany();
    await Product.deleteMany();

    console.log("[Seeder] Cleared existing records.");

    // 1. Create Users
    const admin = await User.create({
      name: "Admin Executive",
      email: "admin@example.com",
      password: "password123",
      role: "admin",
      isEmailVerified: true,
    });

    const seller = await User.create({
      name: "Apex Global Merchant",
      email: "seller@example.com",
      password: "password123",
      role: "seller",
      isEmailVerified: true,
    });

    const customer = await User.create({
      name: "John Customer",
      email: "user@example.com",
      password: "password123",
      role: "user",
      isEmailVerified: true,
    });

    console.log("[Seeder] Created Admin, Seller & Customer accounts.");

    // 2. Create Categories
    const electronics = await Category.create({
      name: "Consumer Electronics",
      slug: "electronics",
      description: "Next-generation audio, wearable devices & computing hardware",
      image: { url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80" },
    });

    const fashion = await Category.create({
      name: "Fashion & Luxury Apparel",
      slug: "fashion",
      description: "Designer apparel, activewear & footwear collections",
      image: { url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80" },
    });

    // 3. Create Brands
    const sony = await Brand.create({ name: "Sony", slug: "sony" });
    const apple = await Brand.create({ name: "Apple", slug: "apple" });
    const nike = await Brand.create({ name: "Nike", slug: "nike" });

    // 4. Create Live Marketplace Products
    await Product.create([
      {
        name: "Wireless Acoustic Noise-Canceling Headphones",
        slug: "wireless-acoustic-headphones",
        description: "Studio-grade over-ear active noise-canceling headphones with LDAC high-resolution audio codecs and 30-hour battery life.",
        price: 349.99,
        discountPrice: 299.99,
        category: electronics._id,
        brand: sony._id,
        seller: seller._id,
        isApproved: true,
        approvalStatus: "approved",
        stock: 35,
        rating: 4.9,
        numReviews: 18,
        isFeatured: true,
        images: [{ public_id: "p1", url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80" }],
      },
      {
        name: "Ergonomic Ultra Smart Watch Series X",
        slug: "smart-watch-series-x",
        description: "Precision biometric fitness tracker featuring ECG sensor, aerospace titanium casing, sapphire crystal OLED display, and dual GPS.",
        price: 499.00,
        discountPrice: 429.00,
        category: electronics._id,
        brand: apple._id,
        seller: admin._id,
        isApproved: true,
        approvalStatus: "approved",
        stock: 20,
        rating: 4.8,
        numReviews: 12,
        isFeatured: true,
        images: [{ public_id: "p2", url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80" }],
      },
      {
        name: "Pro Air Marathon Performance Running Shoes",
        slug: "pro-air-marathon-shoes",
        description: "Engineered mesh running shoes featuring dual-density carbon fiber propulsion plates and responsive cushioning.",
        price: 189.95,
        discountPrice: 149.95,
        category: fashion._id,
        brand: nike._id,
        seller: seller._id,
        isApproved: true,
        approvalStatus: "approved",
        stock: 50,
        rating: 4.7,
        numReviews: 24,
        isFeatured: false,
        images: [{ public_id: "p3", url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80" }],
      },
    ]);

    console.log("[Seeder] Successfully populated production database catalog!");
    process.exit(0);
  } catch (error) {
    console.error("[Seeder Error]", error);
    process.exit(1);
  }
};

seedDatabase();

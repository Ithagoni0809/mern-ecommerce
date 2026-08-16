/**
 * @file server/server.js
 * MERN E-Commerce Backend Server Entry Point
 */
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");

// Load Environment Variables
dotenv.config();

const connectDB = require("./config/db");
const { configureCloudinary } = require("./config/cloudinary");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");
const { apiLimiter } = require("./middleware/rateLimiter");

// Import Route Handlers
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const brandRoutes = require("./routes/brandRoutes");
const cartRoutes = require("./routes/cartRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const sellerRoutes = require("./routes/sellerRoutes");
const deliveryRoutes = require("./routes/deliveryRoutes");

const app = express();

// Connect Database & Third-party Services
connectDB();
configureCloudinary();

// Security Middleware
app.use(helmet());
app.use(mongoSanitize());

// CORS Configuration
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        allowedOrigins.includes(origin.replace(/\/$/, "")) ||
        origin.endsWith(".onrender.com") ||
        origin.endsWith(".vercel.app") ||
        origin.endsWith(".netlify.app")
      ) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy violation: Origin ${origin} not allowed`), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Request Parsing & Cookies
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Global Rate Limiting
app.use("/api", apiLimiter);

// Mount API v1 Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/brands", brandRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/wishlist", wishlistRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/sellers", sellerRoutes);
app.use("/api/v1/delivery", deliveryRoutes);

// Health Check Route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Root Route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to MERN E-Commerce API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/v1/auth",
      users: "/api/v1/users",
      products: "/api/v1/products",
      categories: "/api/v1/categories",
      brands: "/api/v1/brands",
      cart: "/api/v1/cart",
      wishlist: "/api/v1/wishlist",
      orders: "/api/v1/orders",
      payments: "/api/v1/payments",
      admin: "/api/v1/admin",
      sellers: "/api/v1/sellers",
      delivery: "/api/v1/delivery",
    },
  });
});

// Handle 404 Route Errors
app.use(notFound);

// Centralized Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`[Server] Server listening in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
  });
}

module.exports = app;

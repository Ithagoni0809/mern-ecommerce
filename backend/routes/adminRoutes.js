/**
 * @file server/routes/adminRoutes.js
 * Admin Management Routes
 */
const express = require("express");
const {
  getAdminDashboardStats,
  getAllUsers,
  updateUserRole,
  getPendingSellerRequests,
  decideSellerRequest,
  getPendingProducts,
  decideProductApproval,
} = require("../controllers/adminController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const { validateRequiredFields } = require("../middleware/validate");

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/dashboard", getAdminDashboardStats);
router.get("/stats", getAdminDashboardStats);
router.get("/users", getAllUsers);
router.put("/users/:id/role", validateRequiredFields(["role"]), updateUserRole);

// Seller Request Onboarding Queue
router.get("/sellers/requests", getPendingSellerRequests);
router.get("/seller-requests", getPendingSellerRequests);
router.put("/sellers/requests/:id/decision", validateRequiredFields(["status"]), decideSellerRequest);
router.put("/seller-requests/:id", validateRequiredFields(["status"]), decideSellerRequest);

// Multi-Vendor Product Approval Queue
router.get("/products/pending", getPendingProducts);
router.get("/pending-products", getPendingProducts);
router.put("/products/:id/approval", validateRequiredFields(["status"]), decideProductApproval);
router.put("/products/:id/approve", validateRequiredFields(["status"]), decideProductApproval);

module.exports = router;

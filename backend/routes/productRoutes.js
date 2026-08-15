/**
 * @file server/routes/productRoutes.js
 * Product Routes Specification
 */
const express = require("express");
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
} = require("../controllers/productController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const { validateRequiredFields } = require("../middleware/validate");

const router = express.Router();

router
  .route("/")
  .get(getProducts)
  .post(
    protect,
    authorize("admin"),
    validateRequiredFields(["name", "description", "price", "category", "brand", "stock"]),
    createProduct
  );

router
  .route("/:id")
  .get(getProductById)
  .put(protect, authorize("admin"), updateProduct)
  .delete(protect, authorize("admin"), deleteProduct);

router
  .route("/:id/reviews")
  .post(
    protect,
    validateRequiredFields(["rating", "comment"]),
    createProductReview
  );

module.exports = router;

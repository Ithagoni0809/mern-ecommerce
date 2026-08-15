/**
 * @file server/routes/categoryRoutes.js
 * Category Routes Specification
 */
const express = require("express");
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const { validateRequiredFields } = require("../middleware/validate");

const router = express.Router();

router
  .route("/")
  .get(getCategories)
  .post(protect, authorize("admin"), validateRequiredFields(["name"]), createCategory);

router
  .route("/:id")
  .put(protect, authorize("admin"), updateCategory)
  .delete(protect, authorize("admin"), deleteCategory);

module.exports = router;

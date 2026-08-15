/**
 * @file server/routes/brandRoutes.js
 * Brand Routes Specification
 */
const express = require("express");
const {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
} = require("../controllers/brandController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const { validateRequiredFields } = require("../middleware/validate");

const router = express.Router();

router
  .route("/")
  .get(getBrands)
  .post(protect, authorize("admin"), validateRequiredFields(["name"]), createBrand);

router
  .route("/:id")
  .put(protect, authorize("admin"), updateBrand)
  .delete(protect, authorize("admin"), deleteBrand);

module.exports = router;

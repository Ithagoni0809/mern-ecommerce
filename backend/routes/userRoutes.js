/**
 * @file server/routes/userRoutes.js
 * User Profile & Address Book Routes
 */
const express = require("express");
const {
  getUserProfile,
  updateUserProfile,
  getAddresses,
  addAddress,
  deleteAddress,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const { validateRequiredFields } = require("../middleware/validate");

const router = express.Router();

router.use(protect);

router.route("/profile").get(getUserProfile).put(updateUserProfile);

router
  .route("/addresses")
  .get(getAddresses)
  .post(
    validateRequiredFields(["street", "city", "state", "zipCode"]),
    addAddress
  );

router.delete("/addresses/:addressId", deleteAddress);

module.exports = router;

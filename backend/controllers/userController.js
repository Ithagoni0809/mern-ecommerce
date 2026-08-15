/**
 * @file server/controllers/userController.js
 * Production User Profile & Indian Address Book Controller (Village, Mandal, District)
 */
const User = require("../models/User");
const ApiError = require("../utils/apiError");
const ApiResponse = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (!user) throw new ApiError(404, "User not found");
  res.status(200).json(new ApiResponse(200, user, "User profile retrieved"));
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, "User not found");

  user.name = req.body.name || user.name;
  user.phone = req.body.phone || user.phone;
  // Password Update Logic
  const newPass = req.body.newPassword || req.body.password;
  if (newPass && newPass.trim().length >= 6) {
    if (req.body.currentPassword) {
      const userWithPass = await User.findById(req.user._id).select("+password");
      const isMatch = await userWithPass.comparePassword(req.body.currentPassword);
      if (!isMatch) {
        throw new ApiError(400, "Your current password does not match");
      }
    }
    user.password = newPass.trim();
  }

  // Update primary Indian address if provided in profile form
  if (req.body.villageOrLocality || req.body.district || req.body.pincode) {
    const primaryAddr = {
      label: req.body.addressLabel || (user.role === 'seller' ? 'Merchant Outlet' : user.role === 'delivery' ? 'Operating Hub' : 'Home / Native'),
      fullName: user.name,
      phone: user.phone,
      houseNo: req.body.houseNo !== undefined ? req.body.houseNo : (user.addresses?.[0]?.houseNo || ""),
      street: req.body.street !== undefined ? req.body.street : (user.addresses?.[0]?.street || ""),
      villageOrLocality: req.body.villageOrLocality || user.addresses?.[0]?.villageOrLocality || "Village",
      mandalOrTehsil: req.body.mandalOrTehsil || user.addresses?.[0]?.mandalOrTehsil || "Mandal",
      district: req.body.district || user.addresses?.[0]?.district || "District",
      state: req.body.state || user.addresses?.[0]?.state || "Telangana",
      pincode: req.body.pincode || user.addresses?.[0]?.pincode || "500001",
      landmark: req.body.landmark !== undefined ? req.body.landmark : (user.addresses?.[0]?.landmark || ""),
      country: "India",
      isDefault: true,
    };

    if (user.addresses && user.addresses.length > 0) {
      user.addresses[0] = primaryAddr;
    } else {
      user.addresses = [primaryAddr];
    }
  }

  const updatedUser = await user.save();
  res.status(200).json(
    new ApiResponse(
      200,
      {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        storeName: updatedUser.storeName,
        addresses: updatedUser.addresses,
        avatar: updatedUser.avatar,
      },
      "Profile and Indian address details updated successfully!"
    )
  );
});

const getAddresses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, "User not found");
  res.status(200).json(new ApiResponse(200, user.addresses || [], "Addresses retrieved successfully"));
});

const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, "User not found");

  const {
    label = "Home / Native",
    fullName,
    phone,
    houseNo = "",
    street = "",
    villageOrLocality,
    mandalOrTehsil,
    district,
    state = "Telangana",
    pincode = "500001",
    landmark = "",
    country = "India",
    isDefault,
  } = req.body;

  if (isDefault && user.addresses.length > 0) {
    user.addresses.forEach((a) => (a.isDefault = false));
  }

  const newAddress = {
    label,
    fullName: fullName || user.name,
    phone: phone || user.phone || "+91 98765 43210",
    houseNo,
    street,
    villageOrLocality: villageOrLocality || "Village",
    mandalOrTehsil: mandalOrTehsil || "Mandal",
    district: district || "District",
    state,
    pincode,
    landmark,
    country,
    isDefault: isDefault || user.addresses.length === 0,
  };

  user.addresses.push(newAddress);
  await user.save();
  res.status(201).json(new ApiResponse(201, user.addresses, "Indian address added to address book successfully"));
});

const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, "User not found");

  user.addresses = user.addresses.filter((addr) => addr._id.toString() !== req.params.addressId);
  await user.save();
  res.status(200).json(new ApiResponse(200, user.addresses, "Address deleted successfully"));
});

module.exports = { getUserProfile, updateUserProfile, getAddresses, addAddress, deleteAddress };

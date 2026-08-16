/**
 * @file server/models/User.js
 * Mongoose Schema for User Management, Multi-Role, and Indian Address Book
 */
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, default: "Home" }, // Home, Work, Village, Other
    fullName: { type: String, default: "Customer" },
    phone: { type: String, required: true, default: "+91 98765 43210" },
    houseNo: { type: String, default: "" }, // Flat / Door / House No.
    street: { type: String, default: "" }, // Street / Colony / Road
    villageOrLocality: { type: String, required: true }, // Village / Town / Locality
    mandalOrTehsil: { type: String, required: true }, // Mandal / Taluk / Tehsil
    district: { type: String, required: true }, // District / City
    state: { type: String, required: true, default: "Telangana" }, // State
    pincode: { type: String, required: true, default: "500001" }, // 6-Digit PIN Code
    landmark: { type: String, default: "" }, // Nearby Landmark
    country: { type: String, required: true, default: "India" },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true, timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "seller", "admin", "delivery"],
      default: "user",
    },
    phone: {
      type: String,
      default: "+91 98765 43210",
    },
    storeName: {
      type: String,
      default: "Apex Store",
    },
    avatar: {
      public_id: { type: String, default: "" },
      url: { type: String, default: "https://via.placeholder.com/150" },
    },
    addresses: [addressSchema],
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    emailVerificationToken: String,
    emailVerificationExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Password Hash Middleware
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare Password Instance Method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate Access Token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET || "dev_jwt_access_secret_key_32_chars_long_spec",
    { expiresIn: process.env.JWT_EXPIRE || "7d" }
  );
};

// Generate Refresh Token (Long-lived)
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { id: this._id },
    process.env.REFRESH_TOKEN_SECRET || "dev_jwt_refresh_secret_key_32_chars_long_spec",
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRE || "7d" }
  );
};

module.exports = mongoose.model("User", userSchema);

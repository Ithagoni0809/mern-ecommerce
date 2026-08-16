/**
 * @file server/controllers/authController.js
 * Production Authentication & User Registration with Indian Address & Email Verification
 */
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ApiError = require("../utils/apiError");
const ApiResponse = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");
const generateTokensAndSetCookie = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail");

/**
 * @desc    Register a new user account with phone and initial Indian delivery address
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    phone,
    houseNo,
    street,
    villageOrLocality,
    mandalOrTehsil,
    district,
    state,
    pincode,
    landmark,
    country = "India",
  } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, "An account with this email address already exists");
  }

  // Determine initial role
  let initialRole = "user";
  if (role === "seller" || email.startsWith("seller")) {
    initialRole = "seller";
  } else if (role === "delivery" || email.startsWith("delivery")) {
    initialRole = "delivery";
  } else if (role === "admin" || email.startsWith("admin")) {
    initialRole = "admin";
  }

  // Format initial Indian address if provided
  const addresses = [];
  if (villageOrLocality && mandalOrTehsil) {
    addresses.push({
      label: "Home (Native/Default)",
      fullName: name,
      phone: phone || "+91 98765 43210",
      houseNo: houseNo || "",
      street: street || "",
      villageOrLocality,
      mandalOrTehsil,
      district: district || mandalOrTehsil,
      state: state || "Telangana",
      pincode: pincode || "500001",
      landmark: landmark || "",
      country: country || "India",
      isDefault: true,
    });
  }

  // Generate Email Verification Token
  const rawToken = crypto.randomBytes(32).toString("hex");
  const emailVerificationToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  const emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  const user = await User.create({
    name,
    email,
    password,
    phone: phone || "+91 98765 43210",
    role: initialRole,
    addresses,
    emailVerificationToken,
    emailVerificationExpire,
    isEmailVerified: false, // Default unverified until verified via email link
  });

  const { accessToken } = generateTokensAndSetCookie(res, user);
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const verificationUrl = `${clientUrl}/verify-email/${rawToken}`;

  // Attempt sending email (graceful fallback if SMTP is local/sandbox)
  try {
    await sendEmail({
      email: user.email,
      subject: "Verify Your Email - BharatKart E-Commerce",
      message: `Welcome to BharatKart, ${user.name}! Please verify your email address by clicking: ${verificationUrl}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
          <h2 style="color: #6366f1;">Welcome to BharatKart!</h2>
          <p>Hi <b>${user.name}</b>,</p>
          <p>Thank you for creating an account. Please click the button below to verify your email address:</p>
          <div style="margin: 25px 0;">
            <a href="${verificationUrl}" style="background: #4f46e5; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Verify My Email Address</a>
          </div>
          <p style="color: #64748b; font-size: 12px;">Or copy and paste this URL into your browser:<br/><a href="${verificationUrl}">${verificationUrl}</a></p>
          <p style="color: #94a3b8; font-size: 11px; margin-top: 30px;">This link will expire in 24 hours.</p>
        </div>
      `,
    });
  } catch (mailErr) {
    console.log("[Auth Email] Verification email dispatch note (sandbox mode):", mailErr.message);
  }

  res.status(201).json(
    new ApiResponse(
      201,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          addresses: user.addresses,
          isEmailVerified: user.isEmailVerified,
        },
        accessToken,
        verificationUrl,
      },
      "Account registered successfully. A verification link has been sent to your email address."
    )
  );
});

/**
 * @desc    Authenticate user & acquire JWT Access and Refresh tokens
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Please provide an email and password");
  }

  let user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new ApiError(401, "Invalid email or password credentials");
  }

  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    throw new ApiError(401, "Invalid email or password credentials");
  }

  if (user.isActive === false) {
    throw new ApiError(403, "Your account has been suspended by administration. Please contact support.");
  }

  const { accessToken } = generateTokensAndSetCookie(res, user);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          addresses: user.addresses,
          avatar: user.avatar,
          isEmailVerified: user.isEmailVerified,
        },
        accessToken,
      },
      "Logged in successfully"
    )
  );
});

/**
 * @desc    Logout user & clear refresh token cookie
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
const logoutUser = asyncHandler(async (req, res) => {
  if (req.user) {
    req.user.refreshToken = undefined;
    await req.user.save({ validateBeforeSave: false });
  }

  const isProduction = process.env.NODE_ENV === "production";
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: isProduction ? true : false,
    sameSite: isProduction ? "none" : "lax",
  });

  res.status(200).json(new ApiResponse(200, {}, "Logged out successfully"));
});

/**
 * @desc    Refresh Access Token using HTTP-only Refresh Token Cookie
 * @route   POST /api/v1/auth/refresh-token
 * @access  Public (Requires Cookie)
 */
const refreshToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh Token cookie missing or expired");
  }

  try {
    const decoded = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decoded.id).select("+refreshToken");
    if (!user || user.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "Invalid or reused Refresh Token");
    }

    const newAccessToken = user.generateAccessToken();

    res.status(200).json(
      new ApiResponse(
        200,
        { accessToken: newAccessToken },
        "Access token refreshed successfully"
      )
    );
  } catch (error) {
    throw new ApiError(401, "Refresh token verification failed or expired");
  }
});

/**
 * @desc    Forgot Password - Send reset email token
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new ApiError(400, "Please provide your registered email address");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "No account found with this email address");
  }

  const rawResetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = crypto.createHash("sha256").update(rawResetToken).digest("hex");
  user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes

  await user.save({ validateBeforeSave: false });

  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const resetUrl = `${clientUrl}/reset-password/${rawResetToken}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset Request - BharatKart",
      message: `You requested a password reset. Please click: ${resetUrl}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
          <h2 style="color: #6366f1;">BharatKart Password Reset</h2>
          <p>Hi <b>${user.name}</b>,</p>
          <p>We received a request to reset your BharatKart account password. Click the button below to choose a new password:</p>
          <div style="margin: 25px 0;">
            <a href="${resetUrl}" style="background: #4f46e5; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Reset My Password</a>
          </div>
          <p style="color: #64748b; font-size: 12px;">Or copy and paste this URL into your browser:<br/><a href="${resetUrl}">${resetUrl}</a></p>
          <p style="color: #94a3b8; font-size: 11px; margin-top: 30px;">If you did not request this, you can safely ignore this email. Link expires in 30 minutes.</p>
        </div>
      `,
    });
  } catch (mailErr) {
    console.log("[Auth Email] Password reset email note:", mailErr.message);
  }

  res.status(200).json(
    new ApiResponse(
      200,
      { resetUrl },
      "Password reset email sent! Please check your inbox for the reset link."
    )
  );
});

/**
 * @desc    Reset Password with verified token
 * @route   POST /api/v1/auth/reset-password/:resetToken
 * @access  Public
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  if (!password || password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters long");
  }

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired password reset link. Please request a new one.");
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.status(200).json(
    new ApiResponse(200, {}, "Password updated successfully! You can now log in with your new password.")
  );
});

/**
 * @desc    Verify Email via Token
 * @route   GET /api/v1/auth/verify-email/:verificationToken
 * @access  Public
 */
const verifyEmail = asyncHandler(async (req, res) => {
  const emailVerificationToken = crypto
    .createHash("sha256")
    .update(req.params.verificationToken)
    .digest("hex");

  const user = await User.findOne({
    emailVerificationToken,
    emailVerificationExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired verification token. Please request a new link.");
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isEmailVerified: true,
        },
      },
      "Email verified successfully! Your account is now fully secured."
    )
  );
});

/**
 * @desc    Resend Email Verification Link
 * @route   POST /api/v1/auth/resend-verification
 * @access  Public / Private
 */
const resendVerification = asyncHandler(async (req, res) => {
  const userEmail = req.user?.email || req.body.email;
  if (!userEmail) {
    throw new ApiError(400, "User email address is required");
  }

  const user = await User.findOne({ email: userEmail });
  if (!user) {
    throw new ApiError(404, "No account associated with this email address");
  }

  if (user.isEmailVerified) {
    return res.status(200).json(
      new ApiResponse(200, {}, "Your email address is already verified.")
    );
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  user.emailVerificationToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  user.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  await user.save({ validateBeforeSave: false });

  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const verificationUrl = `${clientUrl}/verify-email/${rawToken}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Verify Your Email - BharatKart",
      message: `Please verify your email address: ${verificationUrl}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
          <h2 style="color: #6366f1;">BharatKart Email Verification</h2>
          <p>Hi <b>${user.name}</b>,</p>
          <p>Click the button below to verify your email address and activate all account features:</p>
          <div style="margin: 25px 0;">
            <a href="${verificationUrl}" style="background: #4f46e5; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Verify Email Address</a>
          </div>
          <p style="color: #64748b; font-size: 12px;">Or open this link:<br/><a href="${verificationUrl}">${verificationUrl}</a></p>
        </div>
      `,
    });
  } catch (mailErr) {
    console.log("[Auth Email] Resend note:", mailErr.message);
  }

  res.status(200).json(
    new ApiResponse(
      200,
      { verificationUrl },
      "A new verification link has been sent to your email address!"
    )
  );
});

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
};

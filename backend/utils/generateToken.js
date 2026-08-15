/**
 * @file server/utils/generateToken.js
 * Utility to generate Access Token & set HTTP-only Refresh Token Cookie
 */
const generateTokensAndSetCookie = (res, user) => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // Save refresh token to user document
  user.refreshToken = refreshToken;
  user.save({ validateBeforeSave: false });

  // Cookie options
  const isProduction = process.env.NODE_ENV === "production";
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  res.cookie("refreshToken", refreshToken, cookieOptions);

  return { accessToken, refreshToken };
};

module.exports = generateTokensAndSetCookie;

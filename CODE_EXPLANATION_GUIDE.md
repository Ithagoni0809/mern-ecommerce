# Master Code Explanation & Line-by-Line Cheatsheet

If an interviewer points to any code file in your project and asks **"Explain what this code does"**, use this guide. Every line is translated into simple, easy-to-understand English!

---

# 1. Authentication Middleware (`server/middleware/authMiddleware.js`)

### 📜 The Code:
```javascript
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new ApiError(401, "Not authorized, missing Access Token");
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select("-password");

  if (!user) {
    throw new ApiError(401, "User belonging to this token no longer exists");
  }

  req.user = user;
  next();
});
```

### 💡 Big Picture (What to say first):
> *"This middleware protects private backend routes. It checks if the incoming HTTP request contains a valid JWT Access Token. If valid, it attaches the authenticated user object to `req.user` and allows the request to continue."*

### 🔍 Line-by-Line Plain English Explanation:
- `const jwt = require("jsonwebtoken")`: Imports the JSON Web Token library to verify tokens.
- `if (req.headers.authorization && ...startsWith("Bearer"))`: Checks if the request header contains an `Authorization` header starting with `"Bearer "`.
- `token = req.headers.authorization.split(" ")[1]`: Extracts the actual token string by splitting `"Bearer <TOKEN>"`.
- `if (!token) { throw new ApiError(401, ...); }`: If no token was provided, stop the request immediately with a **401 Unauthorized** error.
- `const decoded = jwt.verify(token, process.env.JWT_SECRET)`: Decodes and cryptographically verifies the token using our secret key.
- `const user = await User.findById(decoded.id).select("-password")`: Queries MongoDB for the user matching the token's ID, excluding the password field for security.
- `req.user = user`: Attaches the logged-in user to the request object so future route handlers can access `req.user`.
- `next()`: Passes control to the next middleware or controller function.

---

# 2. JWT Token & Cookie Generator (`server/utils/generateToken.js`)

### 📜 The Code:
```javascript
const generateTokensAndSetCookie = (res, user) => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  user.save({ validateBeforeSave: false });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  res.cookie("refreshToken", refreshToken, cookieOptions);
  return { accessToken, refreshToken };
};
```

### 💡 Big Picture (What to say first):
> *"This utility generates two JSON Web Tokens when a user logs in: a short-lived Access Token for API requests, and a long-lived Refresh Token stored securely inside an HTTP-only cookie to prevent XSS attacks."*

### 🔍 Line-by-Line Plain English Explanation:
- `const accessToken = user.generateAccessToken()`: Generates a 15-minute Access Token containing the user's ID and Role.
- `const refreshToken = user.generateRefreshToken()`: Generates a 7-day Refresh Token.
- `user.refreshToken = refreshToken; user.save(...)`: Saves the refresh token to the database so we can invalidate it upon logout.
- `httpOnly: true`: Makes the cookie invisible to frontend JavaScript, protecting it from hackers trying to steal it via XSS (Cross-Site Scripting).
- `sameSite: "strict"`: Prevents CSRF (Cross-Site Request Forgery) attacks by ensuring the cookie is only sent on requests originating from our domain.
- `res.cookie("refreshToken", ...)`: Attaches the HTTP-only cookie to the browser's response.

---

# 3. Product Search, Filtering & Pagination (`server/controllers/productController.js`)

### 📜 The Code:
```javascript
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.limit) || 12;
  const page = Number(req.query.page) || 1;
  const query = {};

  if (req.query.keyword) {
    query.$or = [
      { name: { $regex: req.query.keyword, $options: "i" } },
      { description: { $regex: req.query.keyword, $options: "i" } },
    ];
  }

  if (req.query.category) query.category = req.query.category;

  const count = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate("category", "name slug")
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.status(200).json(new ApiResponse(200, { products, page, pages: Math.ceil(count / pageSize), total: count }));
});
```

### 💡 Big Picture (What to say first):
> *"This controller fetches products from MongoDB with support for keyword search, category filtering, and pagination so the frontend doesn't overload when displaying thousands of items."*

### 🔍 Line-by-Line Plain English Explanation:
- `const pageSize = ... || 12; const page = ... || 1`: Sets default pagination parameters (12 products per page).
- `query.$or = [{ name: { $regex: ..., $options: "i" } }]`: Performs a case-insensitive regex search matching the user's keyword against product names or descriptions.
- `await Product.countDocuments(query)`: Counts the total number of matching products in MongoDB to compute total pages.
- `.populate("category", "name slug")`: Replaces the raw `category` ObjectId with the full category name and slug document.
- `.limit(pageSize).skip(pageSize * (page - 1))`: Calculates how many database items to skip for page 2, 3, etc.

---

# 4. Axios Auto-Refresh Token Interceptor (`client/src/services/api.js`)

### 📜 The Code:
```javascript
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const { data } = await axios.post('http://localhost:5000/api/v1/auth/refresh-token', {}, { withCredentials: true });
      const newAccessToken = data.data.accessToken;
      localStorage.setItem('accessToken', newAccessToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return API(originalRequest);
    }
    return Promise.reject(error);
  }
);
```

### 💡 Big Picture (What to say first):
> *"This frontend Axios interceptor acts like an automatic safety net. If an API call fails with a 401 Unauthorized error because the 15-minute Access Token expired, it silently requests a fresh token using the HTTP-only cookie and retries the original request seamlessly."*

### 🔍 Line-by-Line Plain English Explanation:
- `API.interceptors.response.use(...)`: Listens to every HTTP response coming back from the backend.
- `if (error.response?.status === 401 && !originalRequest._retry)`: Checks if the request failed specifically due to an expired token (HTTP 401).
- `originalRequest._retry = true`: Flags the request so we don't end up in an infinite loop if the refresh fails.
- `await axios.post('/auth/refresh-token', ..., { withCredentials: true })`: Calls the backend refresh endpoint, automatically sending the HTTP-only refresh cookie.
- `localStorage.setItem('accessToken', newAccessToken)`: Saves the new access token.
- `originalRequest.headers.Authorization = 'Bearer ...'`: Attaches the new token to the failed request and re-runs it transparently for the user.

---

# 5. Role-Based Access Control (`server/middleware/roleMiddleware.js`)

### 📜 The Code:
```javascript
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, `User role '${req.user.role}' is not authorized`));
    }
    next();
  };
};
```

### 💡 Big Picture (What to say first):
> *"This higher-order middleware function checks if the logged-in user possesses the required role (such as `'admin'`). If not, it blocks access with an HTTP 403 Forbidden error."*

---

# 🎯 General Cheat-Sheet Terms (Know these definitions!)

| Term | What it means in simple English |
|---|---|
| **MERN** | **M**ongoDB (Database), **E**xpress (Backend Framework), **R**eact (Frontend Framework), **N**ode.js (JavaScript Runtime). |
| **REST API** | A standard architectural style for sending and receiving JSON data over HTTP requests (`GET`, `POST`, `PUT`, `DELETE`). |
| **JWT (JSON Web Token)** | A secure, digitally signed token that proves a user is logged in. |
| **HTTP-Only Cookie** | A cookie that JavaScript cannot access, preventing hackers from stealing sensitive session tokens via malicious scripts. |
| **Mongoose** | An ODM (Object Data Modeling) library for Node.js that manages MongoDB schemas, indexes, and queries easily. |
| **Axios** | A JavaScript HTTP client library used in React to make API requests to Node.js backend endpoints. |
| **Middleware** | Functions in Express that run sequentially before your final route handler (e.g., checking if user is logged in, validating request payload). |
| **Vite** | A modern, ultra-fast build tool and development server for React applications. |

# MERN E-Commerce Architecture & System Design Documentation

## 1. System Overview
The MERN E-Commerce platform is built as a enterprise-grade, highly scalable micro-monolith web application divided into two distinct components:
- **Backend (API Server)**: Built with Node.js & Express.js implementing MVC architecture, RESTful endpoints, JWT dual-token security, MongoDB Mongoose ODM, Cloudinary media storage, and Stripe payment gateway integration.
- **Frontend (Client App)**: Built with React 19, Vite, Tailwind CSS, React Router v7, Axios with auto-refresh token interceptors, and robust state management.

---

## 2. System Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                  CLIENT LAYER                                     |
|  React 19 + Vite + Tailwind CSS + Axios Interceptors + Context API / State Store  |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          | HTTPS / REST APIs
                                          v
+-----------------------------------------------------------------------------------+
|                                  SECURITY LAYER                                   |
|       Helmet (Security Headers) | CORS Policy | Rate Limiting | Express Sanitize |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                                   BACKEND LAYER                                   |
|  Node.js + Express.js Router                                                      |
|  ├── Controllers (Auth, Product, Cart, Wishlist, Order, Payment, Admin)           |
|  ├── Middleware (JWT Protect, RBAC Admin Check, Input Validation, Error Handling) |
|  └── Services (Stripe API, Cloudinary Storage, Nodemailer Verification)          |
+--------------------+--------------------+--------------------+--------------------+
                     |                    |                    |
                     v                    v                    v
+--------------------+---+ +--------------+---+ +--------------+--------------------+
|  DATABASE LAYER        | |  FILE STORAGE  | |  PAYMENTS                         |
|  MongoDB Atlas         | |  Cloudinary    | |  Stripe Gateway                   |
|  (Users, Products,     | |  (Product      | |  (Webhooks, PaymentIntents,       |
|   Orders, Reviews,     | |   Images &     | |   Checkout Sessions)              |
|   Cart, Wishlist, etc) | |   Avatars)     | |                                   |
+------------------------+ +----------------+ +-----------------------------------+
```

---

## 3. Data Flow & Subsystems Architecture

### A. Authentication Architecture (JWT Dual-Token Flow)
1. **User Login**: Credentials validated with `bcryptjs`.
2. **Token Generation**:
   - **Access Token**: Short-lived (e.g., 15 mins), signed JWT containing `userId` and `role`. Sent in response JSON body for memory storage on frontend.
   - **Refresh Token**: Long-lived (e.g., 7 days), signed JWT stored in an `httpOnly`, `sameSite`, `secure` cookie and hashed in the MongoDB `User` schema.
3. **Protected Requests**: Frontend sends `Authorization: Bearer <AccessToken>` header.
4. **Token Refresh**: Upon 401 Unauthorized, Axios response interceptor triggers `/api/v1/auth/refresh-token` with the HTTP-only cookie to receive a fresh Access Token seamlessly without user interruption.

### B. Payment & Order Lifecycle Architecture
```
User -> Checkout Page -> Create PaymentIntent (/api/v1/payments/create-intent)
                     -> Stripe API generates ClientSecret
User -> Enters Card via Stripe Elements -> Stripe processes payment
                     -> Stripe Webhook / Direct Confirmation (/api/v1/payments/verify)
                     -> Backend validates Payment & creates Order Document
                     -> Inventory deducted & Cart cleared
```

---

## 4. API Standardization & Response Format

All backend endpoints adhere strictly to unified JSON formats:

### Success Response (HTTP 200 / 201)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Resource fetched successfully",
  "data": {}
}
```

### Error Response (HTTP 4xx / 5xx)
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Invalid input parameters",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ],
  "stack": "Development stack trace..."
}
```

---

## 5. Security & Best Practices Specification
- **XSS & Injection Protection**: Input sanitization via `express-mongo-sanitize` and parameterized Mongoose queries.
- **CSRF & Cookie Protection**: Cookie configuration with `httpOnly: true`, `sameSite: 'strict'`, `secure: true` (in production).
- **Rate Limiting**: `express-rate-limit` on authentication endpoints (e.g., max 5 login requests per 15 min window).
- **Helmet Headers**: Configured Content Security Policies (CSP) and security headers.
- **SOLID Principles**: Controller handlers decoupled from data models, middleware handling validation and error boundary cleanly.

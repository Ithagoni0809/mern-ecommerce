# 🛍️ BharatKart — Multi-Vendor E-Commerce Platform

> **Proximity-based regional seller routing · Indian address system · Doorstep OTP verification**
> B.Tech Academic Project | Full-Stack MERN Web Application

[![Node.js](https://img.shields.io/badge/Node.js-v20-green)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://mongodb.com/atlas)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-blueviolet)](https://stripe.com)
[![JWT](https://img.shields.io/badge/Auth-JWT-orange)](https://jwt.io)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## 📸 Features

| Customer | Seller | Delivery Partner | Admin |
|----------|--------|-----------------|-------|
| 🛒 Browse & search product catalog | 📦 Manage inventory & listings | 🚚 View assigned pickup queue | 📊 Real-time sales dashboard |
| 📍 Multi-address book (Indian format) | 🏪 Pack orders at outlet | 🗺️ Navigate to merchant outlet | 👥 Manage users & roles |
| 💳 Stripe checkout (sandbox) | 🚀 Dispatch orders to courier | 🔐 6-digit OTP verification at doorstep | 🛍️ Product & category oversight |
| 📦 Live shipment tracking | 📈 Sales & revenue view | ✅ Mark delivery confirmed | 📈 Revenue & order analytics |
| 🔒 Private 6-digit doorstep OTP | 🔔 New order notifications | 📜 Delivery history | 🔔 Platform-wide notifications |
| ❤️ Wishlist & saved items | 🗂️ Category & brand filters | — | 📥 Manage orders & disputes |
| 🌙 Responsive modern UI | — | — | — |

---

## 🏗️ Architecture

```
React 19 + Vite 6 (Vercel / Netlify)
          │
          │ HTTPS + REST API
          ▼
Node.js + Express.js (Render / Railway)
          │
          │ Mongoose ODM
          ▼
MongoDB Atlas (Cloud Database)
          │
     ┌────┴────┐
  Stripe     Nodemailer
 Payments    (Email OTP)
```

**Proximity routing flow:** Customer state → Nearest regional hub → Merchant seller assigned → Courier dispatched → OTP verified at doorstep ✅

---

## 🛠️ Technology Stack

```
Frontend  :  React 19  ·  Vite 6  ·  Tailwind CSS  ·  React Router v7  ·  Axios  ·  Lucide Icons
Backend   :  Node.js  ·  Express.js  ·  REST API  ·  Nodemailer SMTP
Database  :  MongoDB Atlas  ·  Mongoose ODM
Auth      :  JWT (JSON Web Tokens)  ·  Bcrypt.js  ·  Role-Based Access Control (RBAC)
Payments  :  Stripe SDK (Sandbox / Test mode)
```

---

## 🌏 Proximity-Based Regional Routing

| Customer's State | Assigned Merchant Hub |
|---|---|
| Telangana, Andhra Pradesh | 🏪 Hyderabad Hub |
| Karnataka | 🏪 Bengaluru Hub |
| Maharashtra, Goa | 🏪 Mumbai Hub |
| Tamil Nadu, Kerala | 🏪 Chennai Hub |
| Other States | 🏪 Nearest available hub |

---

## 🚀 Quick Start

```bash
# 1. Clone
git clone https://github.com/Ithagoni0809/mern-ecommerce.git
cd mern-ecommerce

# 2. Backend setup
cd backend
npm install
cp .env.example .env        # Fill in your MongoDB URI, JWT secret, Stripe key
node seed_clean.js          # Seeds admin, sellers, delivery partner, products
node server.js              # Starts on http://localhost:5000

# 3. Frontend setup (new terminal)
cd ../frontend
npm install
npm run dev                 # Starts on http://localhost:5173
```

### 🔑 Default Seed Accounts — Password: `password123`

| Role | Email |
|------|-------|
| 👑 Platform Admin | admin@example.com |
| 🏪 Merchant — Hyderabad | seller@example.com |
| 🏪 Merchant — Bengaluru | seller.sf@example.com |
| 🏪 Merchant — Mumbai | seller.texas@example.com |
| 🚚 Delivery Partner | delivery@example.com |
| 👤 Customer | user@example.com |

---

## ⚙️ Environment Variables

Create a `.env` file inside the `backend/` folder:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# Optional — only needed if testing Stripe payments
# STRIPE_SECRET_KEY=sk_test_your_stripe_sandbox_key
# STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

---

## 📁 Repository Structure

```
mern-ecommerce/
├── frontend/
│   └── src/
│       ├── components/         # Navbar, Footer, Cards, Common UI
│       ├── context/            # Auth, Cart, Wishlist Contexts
│       ├── pages/
│       │   ├── auth/           # Login, Register (role-specific)
│       │   ├── user/           # Home, Shop, Product, Cart, Checkout, Tracking
│       │   ├── seller/         # Seller Dashboard, Inventory, Orders
│       │   ├── delivery/       # Delivery Queue, OTP Verification
│       │   └── admin/          # Analytics, Users, Catalog Management
│       └── services/           # Axios API Client
│
├── backend/
│   ├── controllers/            # Auth, User, Product, Order, Seller, Delivery, Admin
│   ├── middleware/             # JWT Auth, RBAC, Error Handler
│   ├── models/                 # User, Product, Order, Category, Brand schemas
│   ├── routes/                 # All Express API routes
│   ├── server.js               # App entry point
│   ├── seed_clean.js           # DB reset + seeder
│   ├── test_e2e.js             # End-to-end integration tests
│   └── test_proximity.js       # Proximity routing tests
│
└── README.md
```

---

## 🧪 Testing

```bash
cd backend

# Full end-to-end integration test suite
node test_e2e.js

# Regional proximity routing tests
node test_proximity.js
```

---

## 🔐 Security Features

- **JWT Authentication** with secure HTTP-only token handling
- **Bcrypt** password hashing (salt rounds: 10)
- **RBAC** — each role can only access their own portal routes
- **Delivery OTP** — 6-digit code visible only to the authenticated customer; verified at doorstep before marking delivered
- **Email Verification** — token-based with 24-hour expiry
- **Password Reset** — cryptographic token with 30-minute expiry

---

## 🎓 Project Info

- **Type:** B.Tech Academic Project — IIT Patna
- **Domain:** Full-Stack Web Development · E-Commerce Systems
- **Key Concepts:** MERN Stack, RBAC, REST API Design, Proximity Routing, Geolocation Logic, Payment Gateway Integration

---

*Built with ❤️ — BharatKart | IIT Patna*
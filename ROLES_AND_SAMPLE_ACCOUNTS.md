# Sample Credentials & Role Permissions Reference

This guide gives you the sample login accounts for each role and explains all options available in the **Admin Dashboard**.

---

## 🔑 Sample Login Accounts for Each Role

| Role | Email Address | Password | Permissions & Capabilities |
|---|---|---|---|
| **🛡️ Administrator** | `admin@example.com` | `password123` | Full access to Platform Analytics, User Management, Seller Option, Product CRUD, Order Status Updates. |
| **🏪 Seller / Vendor** | `seller@example.com` | `password123` | Store management, product listings, merchant inventory, vendor payouts. |
| **🛍️ Customer / User** | `user@example.com` | `password123` | Browsing catalog, search/filters, Cart & Wishlist, Stripe Checkout, Order Tracking (`TRK-...`), Reviews. |

---

## 📋 What the Admin Role Can See & Manage

In the **Admin Command Center** (`/admin`), the Administrator has access to 5 dedicated tabs:

### 1. 📊 Overview Analytics
- **Total Sales Revenue**: Aggregate revenue from all paid orders.
- **Total Orders**: Total orders processed through the platform.
- **Active Products**: Real-time count of inventory items.
- **Registered Users Count**: Total number of registered platform users.
- **Verified Sellers Count**: Total count of active vendor stores.

### 2. 👥 Manage Users Tab (User Count & Role Control)
- Displays the **Total Number of Registered Users**.
- View user names, email addresses, and verification badges.
- **Role Switcher**: Change any user's role on the fly (`User`, `Seller`, `Admin`).

### 3. 🏪 Seller Option & Multi-Vendor Management
- Displays approved merchant stores (e.g. *Apex Global Store*).
- Shows seller status (`ACTIVE MERCHANT`), store catalog count, and payout gateways (Stripe Connect).
- Manage vendor commission rates (10% platform fee).

### 4. 📦 Manage Inventory
- Product listings table with category, price, stock levels, and ratings.
- **Add Product Modal**: Create and publish new products with name, price, stock, category, and brand.

### 5. 🚚 Manage Orders & Fulfillment
- View customer orders with customer names, order totals, and payment confirmation.
- **Status Switcher**: Update delivery stages from `Processing` ➔ `Dispatched` ➔ `In Transit` ➔ `Delivered`.

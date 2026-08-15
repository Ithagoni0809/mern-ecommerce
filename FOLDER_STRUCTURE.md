# Project Folder Structure

```
mern-ecommerce/
├── ARCHITECTURE.md
├── FOLDER_STRUCTURE.md
├── package.json                   # Root package.json managing subprojects & concurrent execution
├── .gitignore
├── server/                        # Express.js Backend API
│   ├── .env.example               # Backend Environment variables template
│   ├── package.json               # Backend dependencies
│   ├── server.js                  # Application entry point
│   ├── config/                    # System configurations
│   │   ├── db.js                  # MongoDB Atlas connection setup
│   │   ├── cloudinary.js          # Image upload storage configuration
│   │   └── stripe.js              # Stripe payment gateway initialization
│   ├── controllers/               # Express Controllers (MVC pattern)
│   │   ├── authController.js      # Register, Login, Refresh, Password Reset
│   │   ├── userController.js      # User Profile & Address management
│   │   ├── productController.js   # Product CRUD, search, filter, pagination
│   │   ├── categoryController.js  # Category management
│   │   ├── brandController.js     # Brand management
│   │   ├── cartController.js     # Cart operations
│   │   ├── wishlistController.js # Wishlist toggle & view
│   │   ├── orderController.js    # Order creation, history, status updates
│   │   ├── paymentController.js  # Stripe Webhook & PaymentIntent processing
│   │   └── adminController.js    # Analytics & platform overview
│   ├── models/                    # Mongoose Schemas & Data Models
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Category.js
│   │   ├── Brand.js
│   │   ├── Order.js
│   │   ├── Review.js
│   │   ├── Wishlist.js
│   │   ├── Cart.js
│   │   ├── Coupon.js
│   │   └── Payment.js
│   ├── routes/                    # API Route definitions
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── productRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── brandRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── wishlistRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── paymentRoutes.js
│   │   └── adminRoutes.js
│   ├── middleware/                # Security & Operational Middleware
│   │   ├── authMiddleware.js      # JWT Access token protection
│   │   ├── roleMiddleware.js      # Admin / User authorization
│   │   ├── errorMiddleware.js     # Centralized error handler
│   │   ├── rateLimiter.js         # Express rate limiters
│   │   └── validate.js            # Input validation middleware
│   └── utils/                     # Helpers & Utility functions
│       ├── generateToken.js       # Access & Refresh token generator
│       ├── sendEmail.js           # Nodemailer transport
│       ├── asyncHandler.js        # Async error wrapper
│       ├── apiError.js            # Custom ApiError class
│       └── apiResponse.js         # Standardized ApiResponse class
└── client/                        # React 19 + Vite Frontend
    ├── package.json               # Frontend dependencies
    ├── vite.config.js             # Vite configuration
    ├── tailwind.config.js         # Tailwind CSS styling framework
    ├── index.html
    └── src/
        ├── assets/                # Static assets, logos, fallback images
        ├── components/
        │   ├── common/            # Navbar, Footer, Loader, Pagination, Modal
        │   ├── layout/            # MainLayout, AdminLayout, AuthLayout
        │   ├── product/           # ProductCard, FilterSidebar, RatingStars
        │   ├── cart/              # CartItem, OrderSummary
        │   └── admin/             # StatsCard, AdminTable, ChartWrapper
        ├── context/               # AuthContext, CartContext, WishlistContext
        ├── hooks/                 # Custom React Hooks (useAuth, useFetch)
        ├── pages/
        │   ├── auth/              # Login, Register, ForgotPassword, ResetPassword
        │   ├── user/              # Home, ProductListing, ProductDetails, Cart, Checkout, Profile, Orders, OrderDetails, Wishlist
        │   └── admin/             # AdminDashboard, ManageProducts, ManageOrders, ManageUsers, ManageCategories
        ├── services/              # Axios HTTP service client with refresh interceptor
        └── utils/                 # Formatters, currency helpers, constants
```

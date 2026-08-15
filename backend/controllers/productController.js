/**
 * @file server/controllers/productController.js
 * Production Product Catalog, Search, Filtering, Sorting, Pagination & Reviews
 */
const Product = require("../models/Product");
const Review = require("../models/Review");
const ApiError = require("../utils/apiError");
const ApiResponse = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

/**
 * @desc    Get all public products with Search, Filtering, Sorting & Pagination
 * @route   GET /api/v1/products
 * @access  Public
 */
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.limit) || 12;
  const page = Number(req.query.page) || 1;

  // Filter only approved & unarchived products for public store
  const query = { isArchived: false, isApproved: true };

  // Keyword Regex Search
  if (req.query.keyword) {
    query.$or = [
      { name: { $regex: req.query.keyword, $options: "i" } },
      { description: { $regex: req.query.keyword, $options: "i" } },
    ];
  }

  // Category Filter
  if (req.query.category) {
    query.category = req.query.category;
  }

  // Brand Filter
  if (req.query.brand) {
    query.brand = req.query.brand;
  }

  // Price Range Filter
  if (req.query.minPrice || req.query.maxPrice) {
    query.price = {};
    if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
  }

  // Rating Filter
  if (req.query.rating) {
    query.rating = { $gte: Number(req.query.rating) };
  }

  // Sorting
  let sortOption = { createdAt: -1 };
  if (req.query.sort === "price-low") sortOption = { price: 1 };
  if (req.query.sort === "price-high") sortOption = { price: -1 };
  if (req.query.sort === "rating") sortOption = { rating: -1 };
  if (req.query.sort === "featured") sortOption = { isFeatured: -1, createdAt: -1 };

  const count = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate("category", "name slug")
    .populate("brand", "name slug")
    .populate("seller", "name storeName")
    .sort(sortOption)
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.status(200).json(
    new ApiResponse(
      200,
      {
        products,
        page,
        pages: Math.ceil(count / pageSize),
        total: count,
      },
      "Products fetched successfully"
    )
  );
});

/**
 * @desc    Get single product details by ID
 * @route   GET /api/v1/products/:id
 * @access  Public
 */
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate("category", "name slug")
    .populate("brand", "name slug")
    .populate("seller", "name email");

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const reviews = await Review.find({ product: product._id })
    .populate("user", "name avatar")
    .sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(
      200,
      { product, reviews },
      "Product details retrieved successfully"
    )
  );
});

/**
 * @desc    Create product (Admin direct publish)
 * @route   POST /api/v1/products
 * @access  Private/Admin
 */
const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, discountPrice, category, brand, stock, images, isFeatured } = req.body;

  const slug = name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");

  const product = await Product.create({
    name,
    slug,
    description,
    price: Number(price),
    discountPrice: discountPrice ? Number(discountPrice) : 0,
    category,
    brand,
    stock: Number(stock),
    isFeatured: Boolean(isFeatured),
    isApproved: true, // Admin direct products are approved automatically
    approvalStatus: "approved",
    seller: req.user._id,
    images: images || [{ public_id: "default_img", url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80" }],
  });

  res.status(201).json(new ApiResponse(201, product, "Product created and published successfully"));
});

/**
 * @desc    Update product
 * @route   PUT /api/v1/products/:id
 * @access  Private/Admin
 */
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  Object.assign(product, req.body);
  if (req.body.name) {
    product.slug = req.body.name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
  }

  const updatedProduct = await product.save();
  res.status(200).json(new ApiResponse(200, updatedProduct, "Product updated successfully"));
});

/**
 * @desc    Delete / Archive product
 * @route   DELETE /api/v1/products/:id
 * @access  Private/Admin
 */
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  await product.deleteOne();
  res.status(200).json(new ApiResponse(200, {}, "Product removed successfully"));
});

/**
 * @desc    Create verified product review
 * @route   POST /api/v1/products/:id/reviews
 * @access  Private
 */
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment, title } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const alreadyReviewed = await Review.findOne({
    product: req.params.id,
    user: req.user._id,
  });

  if (alreadyReviewed) {
    throw new ApiError(400, "You have already reviewed this product");
  }

  await Review.create({
    product: product._id,
    user: req.user._id,
    title,
    comment,
    rating: Number(rating),
    isVerifiedPurchase: true,
  });

  // Calculate new average rating
  const reviews = await Review.find({ product: product._id });
  product.numReviews = reviews.length;
  product.rating =
    reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

  await product.save();

  res.status(201).json(new ApiResponse(201, {}, "Review added successfully"));
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
};

/**
 * @file server/controllers/categoryController.js
 * Production Category Controllers
 */
const Category = require("../models/Category");
const ApiError = require("../utils/apiError");
const ApiResponse = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ name: 1 });
  res.status(200).json(new ApiResponse(200, categories, "Categories retrieved successfully"));
});

const createCategory = asyncHandler(async (req, res) => {
  const { name, description, image } = req.body;
  const slug = name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");

  const category = await Category.create({ name, slug, description, image });
  res.status(201).json(new ApiResponse(201, category, "Category created successfully"));
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, "Category not found");

  Object.assign(category, req.body);
  if (req.body.name) category.slug = req.body.name.toLowerCase().replace(/ /g, "-");
  await category.save();

  res.status(200).json(new ApiResponse(200, category, "Category updated successfully"));
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, "Category not found");

  await category.deleteOne();
  res.status(200).json(new ApiResponse(200, {}, "Category deleted successfully"));
});

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };

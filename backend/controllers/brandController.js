/**
 * @file server/controllers/brandController.js
 * Production Brand Controllers
 */
const Brand = require("../models/Brand");
const ApiError = require("../utils/apiError");
const ApiResponse = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

const getBrands = asyncHandler(async (req, res) => {
  const brands = await Brand.find({}).sort({ name: 1 });
  res.status(200).json(new ApiResponse(200, brands, "Brands fetched successfully"));
});

const createBrand = asyncHandler(async (req, res) => {
  const { name, logo, description } = req.body;
  const slug = name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");

  const brand = await Brand.create({ name, slug, logo, description });
  res.status(201).json(new ApiResponse(201, brand, "Brand created successfully"));
});

const updateBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.params.id);
  if (!brand) throw new ApiError(404, "Brand not found");

  Object.assign(brand, req.body);
  if (req.body.name) brand.slug = req.body.name.toLowerCase().replace(/ /g, "-");
  await brand.save();

  res.status(200).json(new ApiResponse(200, brand, "Brand updated successfully"));
});

const deleteBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.params.id);
  if (!brand) throw new ApiError(404, "Brand not found");

  await brand.deleteOne();
  res.status(200).json(new ApiResponse(200, {}, "Brand deleted successfully"));
});

module.exports = { getBrands, createBrand, updateBrand, deleteBrand };

const Review = require("../models/Review");
const Product = require("../models/Product");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

// Reviews go live immediately — there's no moderation queue, so a
// product's rating/reviewCount is just the aggregate over every review
// it has (see admin-backend's mirror of this in review.controller.js,
// which only adds the ability to delete a review, not approve one).
async function updateProductRating(productId) {
  const reviews = (await Review.find({ product: productId })) || [];
  const reviewCount = Array.isArray(reviews) ? reviews.length : 0;
  const rating = reviewCount === 0 ? 0 : Number((reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount).toFixed(1));

  await Product.findByIdAndUpdate(productId, { rating, reviewCount });
}

const create = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const product = await Product.findById(productId);
  if (!product) throw ApiError.notFound("Product not found.");

  const existing = await Review.findOne({ product: productId, user: req.auth.userId });
  if (existing) {
    throw ApiError.conflict("You have already reviewed this product.");
  }

  const review = await Review.create({
    product: productId,
    user: req.auth.userId,
    rating: req.body.rating,
    comment: req.body.comment || "",
  });
  await updateProductRating(productId);
  if (typeof review.populate === "function") await review.populate("user", "name");

  res.status(201).json({ review });
});

const listByProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { page, limit } = req.query;

  // Public and unfiltered — every review shows here, and only the
  // reviewer's name is populated (never email or anything else).
  const [items, total] = await Promise.all([
    Review.find({ product: productId })
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Review.countDocuments({ product: productId }),
  ]);

  res.json({ items, page, limit, total, totalPages: Math.ceil(total / limit) });
});

module.exports = { create, listByProduct, updateProductRating };

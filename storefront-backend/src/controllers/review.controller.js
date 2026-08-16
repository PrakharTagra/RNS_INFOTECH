const Review = require("../models/Review");
const Product = require("../models/Product");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const REVIEW_STATUS = ["pending", "approved", "rejected"];

async function updateProductRating(productId) {
  const approvedReviews = (await Review.find({ product: productId, status: "approved" })) || [];
  const reviewCount = Array.isArray(approvedReviews) ? approvedReviews.length : 0;
  const rating = reviewCount === 0 ? 0 : Number((approvedReviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount).toFixed(1));

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
    status: "pending",
  });

  res.status(201).json({ review });
});

const listByProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { page, limit } = req.query;

  const [items, total] = await Promise.all([
    Review.find({ product: productId, status: "approved" })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Review.countDocuments({ product: productId, status: "approved" }),
  ]);

  res.json({ items, page, limit, total, totalPages: Math.ceil(total / limit) });
});

module.exports = { REVIEW_STATUS, create, listByProduct, updateProductRating };

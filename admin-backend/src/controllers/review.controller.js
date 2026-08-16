const Review = require("../models/Review");
const Product = require("../models/Product");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

async function recomputeProductRating(productId) {
  const approved = (await Review.find({ product: productId, status: "approved" })) || [];
  const reviewCount = Array.isArray(approved) ? approved.length : 0;
  const rating = reviewCount === 0 ? 0 : Number((approved.reduce((sum, review) => sum + review.rating, 0) / reviewCount).toFixed(1));

  await Product.findByIdAndUpdate(productId, { rating, reviewCount });
}

const list = asyncHandler(async (req, res) => {
  const { page, limit, status, product } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (product) filter.product = product;

  let query = Review.find(filter);
  if (typeof query.populate === "function") query = query.populate("product", "name sku");
  if (typeof query.populate === "function") query = query.populate("user", "name email");
  if (typeof query.sort === "function") query = query.sort({ createdAt: -1 });
  if (typeof query.skip === "function") query = query.skip((page - 1) * limit);
  if (typeof query.limit === "function") query = query.limit(limit);

  const [items, total] = await Promise.all([query, Review.countDocuments(filter)]);

  res.json({ items, page, limit, total, totalPages: Math.ceil(total / limit) });
});

const stats = asyncHandler(async (req, res) => {
  const [total, pending, approved, rejected] = await Promise.all([
    Review.countDocuments({}),
    Review.countDocuments({ status: "pending" }),
    Review.countDocuments({ status: "approved" }),
    Review.countDocuments({ status: "rejected" }),
  ]);
  res.json({ total, pending, approved, rejected });
});

const getById = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw ApiError.notFound("Review not found.");
  res.json({ review });
});

const updateStatus = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw ApiError.notFound("Review not found.");

  review.status = req.body.status;
  review.moderationNote = req.body.moderationNote || "";
  await review.save();
  await recomputeProductRating(review.product);

  res.json({ review });
});

const remove = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw ApiError.notFound("Review not found.");

  await review.deleteOne();
  await recomputeProductRating(review.product);
  res.status(204).send();
});

module.exports = { list, stats, getById, updateStatus, remove };

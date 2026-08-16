const Product = require("../models/Product");
const Category = require("../models/Category");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const SORT_OPTIONS = {
  newest: { createdAt: -1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  rating: { rating: -1 },
  name: { name: 1 },
};

// GET /api/categories — public, always isActive: true only. No pagination:
// the storefront nav renders every active category at once, and category
// counts stay small enough that this never needs it.
const listCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 }).lean();
  res.json({ items: categories });
});

// GET /api/categories/:slug — public
const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug, isActive: true }).lean();
  if (!category) throw ApiError.notFound("Category not found.");
  res.json({ category });
});

// discountPercent is a Mongoose virtual on Product — .lean() (used below
// for read-only public queries) skips virtuals, so it's computed here
// instead to keep the response shape identical.
function withDiscountPercent(product) {
  if (!product) return product;
  const discountPercent = product.mrp && product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
  return { ...product, discountPercent };
}

// GET /api/products — public list/filter/sort/paginate/search
const listProducts = asyncHandler(async (req, res) => {
  const { page, limit, search, category, minPrice, maxPrice, featured, sort } = req.query;
  const filter = { isActive: true };

  if (category) {
    // Accept either a category slug or its id, since both the storefront
    // nav (slug-based URLs) and a "same category" product-detail widget
    // (id already in hand) need to filter by category.
    const categoryFilter = category.match(/^[a-f0-9]{24}$/i) ? { _id: category } : { slug: category };
    const matchedCategory = await Category.findOne({ ...categoryFilter, isActive: true }).select("_id");
    // No matching category → empty result set, not a 404: a stale/typo'd
    // category filter in the URL should just show zero products, not
    // break the whole product listing page.
    filter.category = matchedCategory ? matchedCategory._id : null;
  }
  if (typeof featured === "boolean") filter.isFeatured = featured;
  if (minPrice != null || maxPrice != null) {
    filter.price = {};
    if (minPrice != null) filter.price.$gte = minPrice;
    if (maxPrice != null) filter.price.$lte = maxPrice;
  }
  if (search) filter.$text = { $search: search };

  const [items, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "name slug")
      .sort(SORT_OPTIONS[sort] || SORT_OPTIONS.newest)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  res.json({ items: items.map(withDiscountPercent), page, limit, total, totalPages: Math.ceil(total / limit) });
});

// GET /api/products/:slug — public detail
const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true }).populate("category", "name slug").lean();
  if (!product) throw ApiError.notFound("Product not found.");
  res.json({ product: withDiscountPercent(product) });
});

module.exports = { listCategories, getCategoryBySlug, listProducts, getProductBySlug };

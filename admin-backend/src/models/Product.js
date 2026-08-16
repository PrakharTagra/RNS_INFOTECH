const mongoose = require("mongoose");

// Collection: `products` — owned by admin-backend, read-only in
// storefront-backend, per BACKEND_PLAN.md's ownership matrix. Mirror any
// field change in storefront-backend/src/models/Product.js too — see the
// note in Category.js for why there's no shared schema package yet.
//
// Single brand catalogue (per the earlier storefront redesign this build
// is based on) — deliberately no `brand` field.
const PRODUCT_TYPES = ["Pen Tablet", "Pen Display", "Stylus", "Accessory"];

const productImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, default: null },
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    brand: { type: String, trim: true, default: "" },
    productType: { type: String, enum: PRODUCT_TYPES, default: "Pen Tablet" },
    description: { type: String, trim: true, default: "" },
    shortDescription: { type: String, trim: true, default: "", maxlength: 200 },
    images: { type: [productImageSchema], default: [], validate: { validator: (images) => images.length <= 12, message: "A product may have at most 12 images." } },
    price: { type: Number, required: true, min: 0 },
    // Struck-through "original" price shown alongside `price` in the UI;
    // discountPercent below is derived from the two, never stored.
    mrp: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    // Free-form spec sheet (e.g. "Active Area" -> "10 x 6 in") so new spec
    // rows never need a schema migration. Structured stock adjustments
    // with an audit trail are Phase B10 (inventorylog) — this field is
    // just the current count.
    specifications: { type: Map, of: String, default: {} },
    tags: [{ type: String, trim: true, lowercase: true }],
    // Both set by Phase B6 (Reviews) moderation, not written here in B2 —
    // present now so the field exists on every product from the start
    // rather than being backfilled later.
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

productSchema.statics.PRODUCT_TYPES = PRODUCT_TYPES;

productSchema.virtual("discountPercent").get(function computeDiscountPercent() {
  if (!this.mrp || this.mrp <= this.price) return 0;
  return Math.round(((this.mrp - this.price) / this.mrp) * 100);
});

// Text index backs both services' `search` query param ($text search
// across name/description/tags) — see product.controller.js (admin) and
// catalog.controller.js (storefront).
productSchema.index({ name: "text", description: "text", tags: "text" });

// Mirrors storefront-backend/src/models/Product.js — same physical
// collection, so defined here too to keep both mongoose models' index
// declarations in sync (avoid drift, even though MongoDB only needs the
// index created once). Backs the storefront's default "isActive +
// newest" product listing and its isFeatured filter.
productSchema.index({ isActive: 1, createdAt: -1 });
productSchema.index({ isActive: 1, isFeatured: 1 });

module.exports = mongoose.model("Product", productSchema);

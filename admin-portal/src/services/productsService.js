import { adminApiRequest, adminApiUpload } from "../lib/adminApi";
import { getLowStockThresholdSync } from "./settingsService";

function normalizeProduct(product = {}) {
  const stockQty = Number(product.stock ?? product.stockQty ?? 0);
  const category = product.category || {};
  const images = Array.isArray(product.images) ? product.images : [];
  const image = images[0]?.url || product.image || images[0] || "";
  const tag = Array.isArray(product.tags) && product.tags.length ? product.tags[0] : product.tag || "none";
  const status = product.isActive === false ? "inactive" : "active";
  const nextStock = stockQty <= 0 ? "out-of-stock" : stockQty <= getLowStockThresholdSync() ? "low-stock" : "in-stock";

  return {
    id: product._id || product.id || product.slug,
    name: product.name || "",
    sku: product.sku || "",
    price: Number(product.price || 0),
    mrp: Number(product.mrp || product.price || 0),
    category: category.name || product.categoryName || product.category || "",
    categoryId: category._id || category.id || product.categoryId || "",
    brand: product.brand || "",
    stock: nextStock,
    stockQty: stockQty,
    status,
    tag: tag === "none" ? "none" : tag,
    image,
    images: images.map((entry) => ({ id: entry._id || entry.id || "", url: entry.url || entry, publicId: entry.publicId || null })),
    shortDescription: product.shortDescription || "",
    description: product.description || "",
    highlights: Array.isArray(product.highlights) ? product.highlights : [],
    specs: Array.isArray(product.specifications) ? product.specifications : [],
    rating: Number(product.rating || 0),
    reviewCount: Number(product.reviewCount || 0),
    isFeatured: Boolean(product.isFeatured),
    slug: product.slug || "",
    createdAt: product.createdAt || null,
    updatedAt: product.updatedAt || null,
  };
}

function toApiPayload(data) {
  const tag = data.tag || "none";
  const stockQty = Number(data.stockQty ?? data.stock ?? 0);
  return {
    name: data.name,
    category: data.categoryId || data.category || "",
    brand: data.brand || "",
    price: Number(data.price || 0),
    mrp: Number(data.mrp || data.price || 0),
    stock: stockQty,
    isActive: (data.status || "active") === "active",
    isFeatured: tag === "featured",
    shortDescription: data.shortDescription || "",
    description: data.description || data.shortDescription || "",
    sku: String(data.sku || "").trim(),
    tags: tag && tag !== "none" ? [tag] : [],
    highlights: Array.isArray(data.highlights) ? data.highlights.filter(Boolean) : [],
    specifications: Array.isArray(data.specs) ? Object.fromEntries(data.specs.filter((s) => s && s.label && s.value).map((s) => [s.label, s.value])) : {},
  };
}

function buildQueryString(filters = {}) {
  const params = new URLSearchParams();
  const { q = "", categoryId = "", brand = "", status = "", stock = "", sort = "", page = 1, limit = 20 } = filters;
  if (q) params.set("search", q);
  if (categoryId) params.set("category", categoryId);
  if (brand) params.set("brand", brand);
  if (status) params.set("isActive", status === "active");
  if (stock) params.set("stock", stock);
  if (sort) params.set("sort", sort);
  params.set("page", String(page));
  params.set("limit", String(limit));
  return params.toString();
}

export async function getProductsPage(filters = {}) {
  const payload = await adminApiRequest(`/products?${buildQueryString(filters)}`);
  return {
    items: (payload?.items || []).map(normalizeProduct),
    page: Number(payload?.page || filters.page || 1),
    limit: Number(payload?.limit || filters.limit || 20),
    total: Number(payload?.total || 0),
    totalPages: Number(payload?.totalPages || 0),
  };
}

// Kept for existing dashboard/inventory/category consumers. The product list
// page uses getProductsPage so catalogue browsing is server-side paginated.
export async function getProducts(filters = {}) {
  const payload = await getProductsPage({ ...filters, page: 1, limit: filters.limit || 100 });
  return payload.items;
}

export async function getProduct(id) {
  const payload = await adminApiRequest(`/products/${id}`);
  return payload?.product ? normalizeProduct(payload.product) : null;
}

export async function createProduct(data) {
  const payload = await adminApiRequest("/products", { method: "POST", body: toApiPayload(data) });
  return payload?.product ? normalizeProduct(payload.product) : null;
}

export async function updateProduct(id, data) {
  const payload = await adminApiRequest(`/products/${id}`, { method: "PATCH", body: toApiPayload(data) });
  return payload?.product ? normalizeProduct(payload.product) : null;
}

export async function uploadProductImages(id, files, { onProgress } = {}) {
  const formData = new FormData();
  files.forEach((file) => formData.append("images", file, file.name));
  const payload = await adminApiUpload(`/products/${id}/images`, formData, { onProgress });
  return payload?.product ? normalizeProduct(payload.product) : null;
}

export async function replaceProductImage(id, imageId, file, { onProgress } = {}) {
  const formData = new FormData();
  formData.append("image", file, file.name);
  const payload = await adminApiUpload(`/products/${id}/images/${imageId}`, formData, { method: "PATCH", onProgress });
  return payload?.product ? normalizeProduct(payload.product) : null;
}

export async function deleteProductImage(id, imageId) {
  const payload = await adminApiRequest(`/products/${id}/images/${imageId}`, { method: "DELETE" });
  return payload?.product ? normalizeProduct(payload.product) : null;
}

export async function bulkProductAction(action, ids, categoryId = "") {
  const payload = await adminApiRequest("/products/bulk", { method: "POST", body: { action, ids, ...(categoryId ? { categoryId } : {}) } });
  return payload;
}

export async function deleteProduct(id) {
  await adminApiRequest(`/products/${id}`, { method: "DELETE" });
  return true;
}

export async function getProductStats() {
  const items = await getProducts();
  return {
    total: items.length,
    active: items.filter((p) => p.status === "active").length,
    lowStock: items.filter((p) => p.stock === "low-stock").length,
    outOfStock: items.filter((p) => p.stock === "out-of-stock").length,
  };
}


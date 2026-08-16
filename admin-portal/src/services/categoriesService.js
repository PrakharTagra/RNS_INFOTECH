import { adminApiRequest } from "../lib/adminApi";
import { getProducts } from "./productsService";

function normalizeCategory(category = {}) {
  return {
    id: category._id || category.id || category.slug,
    name: category.name || "",
    slug: category.slug || "",
    description: category.description || "",
    image: category.image?.url || category.image || "",
    icon: category.icon || "tag",
    status: category.isActive === false ? "inactive" : "active",
    isActive: category.isActive !== false,
    count: Number(category.count || 0),
  };
}

async function withCounts(items) {
  const products = await getProducts();
  return items.map((category) => {
    const normalized = normalizeCategory(category);
    return {
      ...normalized,
      count: products.filter((product) => product.categoryId === normalized.id).length,
    };
  });
}

export async function getCategories() {
  const payload = await adminApiRequest(`/categories?page=1&limit=100`);
  return withCounts(payload?.items || []);
}

export async function getCategory(id) {
  const list = await getCategories();
  return list.find((category) => category.id === id) || null;
}

export async function createCategory(data) {
  const response = await adminApiRequest("/categories", {
    method: "POST",
    body: {
      name: String(data.name || "").trim(),
      description: String(data.description || "").trim(),
      isActive: (data.status || "active") === "active",
      sortOrder: Number(data.sortOrder || 0),
    },
  });
  return normalizeCategory(response?.category);
}

export async function updateCategory(id, data) {
  const response = await adminApiRequest(`/categories/${id}`, {
    method: "PATCH",
    body: {
      name: data.name,
      description: data.description,
      isActive: data.status === undefined ? undefined : (data.status === "active"),
      sortOrder: data.sortOrder,
    },
  });
  return normalizeCategory(response?.category);
}

export async function deleteCategory(id) {
  await adminApiRequest(`/categories/${id}`, { method: "DELETE" });
  return true;
}

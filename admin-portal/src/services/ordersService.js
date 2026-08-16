import { adminApiRequest } from "../lib/adminApi";

function normalizeOrder(order = {}) {
  const shipping = order.shippingAddress || {};
  const items = Array.isArray(order.items) ? order.items : [];

  return {
    id: order._id || order.id,
    date: order.createdAt || order.date || new Date().toISOString(),
    status: order.status || "pending",
    items: items.map((item) => ({
      id: item.product || item.id || "",
      name: item.name || "",
      image: item.image || "",
      category: item.category || "",
      qty: Number(item.quantity || item.qty || 1),
      price: Number(item.price || 0),
    })),
    subtotal: Number(order.itemsTotal || order.subtotal || 0),
    shipping: Number(order.shipping || 0),
    savings: Number(order.savings || 0),
    total: Number(order.total || order.itemsTotal || 0),
    shippingAddress: {
      name: shipping.fullName || shipping.name || "",
      phone: shipping.phone || "",
      line1: shipping.line1 || "",
      line2: shipping.line2 || "",
      city: shipping.city || "",
      state: shipping.state || "",
      pincode: shipping.pincode || "",
      country: shipping.country || "India",
    },
    paymentMethod: order.paymentMethod || "Online payment",
    paymentStatus: order.paymentStatus || "unpaid",
    customerEmail: order.user?.email || order.customerEmail || "",
    courierName: order.courierName || null,
    trackingId: order.trackingId || null,
  };
}

export async function getOrders(filters = {}) {
  const { q = "", status = "" } = filters;
  const params = new URLSearchParams({ page: "1", limit: "100" });
  if (q) params.set("search", q);
  if (status) params.set("status", status);

  const payload = await adminApiRequest(`/orders?${params.toString()}`);
  return (payload?.items || []).map(normalizeOrder).sort((a, b) => new Date(b.date) - new Date(a.date));
}

export async function getOrder(id) {
  const payload = await adminApiRequest(`/orders/${id}`);
  return payload?.order ? normalizeOrder(payload.order) : null;
}

export async function getOrderStats() {
  const items = await getOrders({});
  return {
    total: items.length,
    pending: items.filter((o) => o.status === "pending").length,
    confirmed: items.filter((o) => o.status === "confirmed").length,
    shipped: items.filter((o) => o.status === "shipped").length,
    delivered: items.filter((o) => o.status === "delivered").length,
    cancelled: items.filter((o) => o.status === "cancelled").length,
  };
}

export async function confirmOrder(id) {
  const payload = await adminApiRequest(`/orders/${id}/confirm`, { method: "POST", body: {} });
  return payload?.order ? normalizeOrder(payload.order) : null;
}
export async function packOrder(id) {
  const payload = await adminApiRequest(`/orders/${id}/pack`, { method: "POST", body: {} });
  return payload?.order ? normalizeOrder(payload.order) : null;
}
export async function markOutForDelivery(id) {
  const payload = await adminApiRequest(`/orders/${id}/out-for-delivery`, { method: "POST", body: {} });
  return payload?.order ? normalizeOrder(payload.order) : null;
}
export async function markDelivered(id) {
  const payload = await adminApiRequest(`/orders/${id}/deliver`, { method: "POST", body: {} });
  return payload?.order ? normalizeOrder(payload.order) : null;
}
export async function markReturned(id) {
  const payload = await adminApiRequest(`/orders/${id}/returned`, { method: "POST", body: {} });
  return payload?.order ? normalizeOrder(payload.order) : null;
}

export async function shipOrder(id, { courierName, trackingId }) {
  const payload = await adminApiRequest(`/orders/${id}/ship`, {
    method: "POST",
    body: { courierName, trackingId },
  });
  return payload?.order ? normalizeOrder(payload.order) : null;
}

export async function cancelOrder(id) {
  const payload = await adminApiRequest(`/orders/${id}/cancel`, { method: "POST" });
  return payload?.order ? normalizeOrder(payload.order) : null;
}

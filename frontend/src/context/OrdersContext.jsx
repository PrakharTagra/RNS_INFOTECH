import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest, normalizeOrder } from "../lib/api";
import { useAuth } from "./AuthContext";

const OrdersContext = createContext(null);

// These three stages are the only ones with a place in the visual
// timeline — "cancelled" is a terminal state handled separately by
// isCancelled below, same as admin-backend's ORDER_STATUSES enum
// (pending/confirmed/shipped/cancelled).
export const TRACKING_STAGES = [
  { key: "pending", label: "Order placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "packed", label: "Packed" },
  { key: "shipped", label: "Shipped" },
  { key: "out-for-delivery", label: "Out for delivery" },
  { key: "delivered", label: "Delivered" },
];

// getTrackingInfo/getOrderStatus/canDownloadInvoice used to simulate a
// timeline client-side from the order's placed-at timestamp. Now that
// storefront-backend's GET /orders returns the real status/courierName/
// trackingId/confirmedAt/shippedAt fields admin-backend sets (see
// lib/api.js's normalizeOrder), these read that instead — an order only
// shows "Shipped" once someone in the admin portal has actually marked
// it shipped, not on a fixed timer.
export function getTrackingInfo(order) {
  if (!["shipped", "out-for-delivery", "delivered"].includes(order.status)) return null;
  if (!order.courierName && !order.trackingId) return null;
  return { courierName: order.courierName, trackingId: order.trackingId };
}

export function canDownloadInvoice(order) {
  return ["shipped", "out-for-delivery", "delivered"].includes(order.status);
}

export function getOrderStatus(order) {
  const status = order.status || "pending";
  const terminal = ["cancelled", "return-requested", "returned", "refunded"];
  if (terminal.includes(status)) {
    const labelMap = {
      cancelled: "Cancelled",
      "return-requested": "Return requested",
      returned: "Returned",
      refunded: "Refunded",
    };
    return {
      currentIndex: -1,
      currentStage: { key: status, label: labelMap[status] || status },
      isShipped: ["shipped", "out-for-delivery", "delivered"].includes(status),
      isCancelled: status === "cancelled",
      isTerminal: true,
      cancelReason: order.cancelReason || null,
      cancelledAt: order.cancelledAt || null,
      stages: TRACKING_STAGES.map((stage) => ({
        ...stage,
        date: order[`${stage.key.replace(/-([a-z])/g, (_, c) => c.toUpperCase())}At`] || (stage.key === "pending" ? order.date : null),
        complete: false,
      })),
    };
  }
  const currentIndex = Math.max(0, TRACKING_STAGES.findIndex((s) => s.key === status));
  const fieldMap = {
    pending: "date",
    confirmed: "confirmedAt",
    packed: "packedAt",
    shipped: "shippedAt",
    "out-for-delivery": "outForDeliveryAt",
    delivered: "deliveredAt",
  };
  return {
    currentIndex,
    currentStage: TRACKING_STAGES[currentIndex],
    isShipped: ["shipped", "out-for-delivery", "delivered"].includes(status),
    isCancelled: false,
    isTerminal: false,
    stages: TRACKING_STAGES.map((stage, i) => ({
      ...stage,
      date: order[fieldMap[stage.key]] || null,
      complete: i <= currentIndex,
    })),
  };
}
export function OrdersProvider({ children }) {
  const { currentUser, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [ordersError, setOrdersError] = useState(null);

  const fetchOrders = async () => {
    if (!isAuthenticated) {
      setOrders([]);
      return;
    }

    try {
      setOrdersError(null);
      const response = await apiRequest("/orders?page=1&limit=50", { authRequired: true });
      const items = (response.items || []).map((order) => normalizeOrder(order));
      setOrders(items);
    } catch (error) {
      setOrdersError(error);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, isAuthenticated]);

  const api = useMemo(() => ({
    orders,
    ordersError,
    getOrder: (id) => orders.find((order) => order.id === id) || null,
    refreshOrders: fetchOrders,
    placeOrder: async ({ items, shippingAddress, paymentMethod, total, couponCode }) => {
      const payload = {
        items: items.map((item) => ({
          product: item.product || item.id,
          quantity: Number(item.qty || item.quantity || 1),
        })),
        shippingAddress: {
          fullName: shippingAddress?.name || shippingAddress?.fullName || "",
          phone: shippingAddress?.phone || "",
          line1: shippingAddress?.line1 || "",
          line2: shippingAddress?.line2 || "",
          city: shippingAddress?.city || "",
          state: shippingAddress?.state || "",
          pincode: shippingAddress?.pincode || "",
          country: shippingAddress?.country || "India",
        },
      };
      // Sent as-is; order.controller.js re-validates it server-side and
      // is the only thing that decides the real discount (see
      // lib/coupons.js). Omitted entirely rather than sent empty so an
      // untouched coupon field never trips the backend's non-empty check.
      if (couponCode) payload.couponCode = couponCode;

      const response = await apiRequest("/orders", {
        method: "POST",
        body: payload,
        authRequired: true,
      });

      const order = normalizeOrder(response.order);
      setOrders((prev) => [order, ...prev.filter((item) => item.id !== order.id)]);
      return order;
    },
    getOrderById: async (id) => {
      const response = await apiRequest(`/orders/${id}`, { authRequired: true });
      return normalizeOrder(response.order);
    },
    cancelOrder: async (id, reason = "") => {
      const response = await apiRequest(`/orders/${id}/cancel`, { method: "POST", body: { reason }, authRequired: true });
      const order = normalizeOrder(response.order);
      setOrders((prev) => prev.map((item) => item.id === order.id ? order : item));
      return order;
    },
    requestReturn: async (id, payload) => {
      const response = await apiRequest(`/orders/${id}/return`, { method: "POST", body: payload, authRequired: true });
      const orderResponse = await apiRequest(`/orders/${id}`, { authRequired: true });
      const order = normalizeOrder(orderResponse.order);
      setOrders((prev) => prev.map((item) => item.id === order.id ? order : item));
      return response.returnRequest;
    },
  }), [orders, currentUser, isAuthenticated]);

  return <OrdersContext.Provider value={api}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used within an OrdersProvider");
  return ctx;
}

const Order = require("../models/Order");
const Payment = require("../models/Payment");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { OBJECT_ID_RE } = require("../validators/order.validators");
const { transitionOrder } = require("../services/orderLifecycle.service");
const { releaseOrderStock, restoreConsumedOrderStock } = require("../services/inventory.service");
const { releaseCoupon, rollbackConsumedCoupon } = require("../services/coupon.service");
const { initiateRefund } = require("../services/refund.service");

const SORT_NEWEST = { createdAt: -1 };

async function attachPaymentStatus(orders) {
  if (!orders.length) return [];
  const orderIds = orders.map((o) => o._id);
  const payments = await Payment.find({ order: { $in: orderIds } }).sort({ createdAt: -1 });
  const statusByOrder = new Map();
  for (const payment of payments) {
    const key = String(payment.order);
    if (!statusByOrder.has(key)) statusByOrder.set(key, payment.status);
    if (payment.status === "paid") statusByOrder.set(key, "paid");
  }
  return orders.map((order) => ({ ...order.toJSON(), paymentStatus: statusByOrder.get(String(order._id)) || "unpaid" }));
}

const list = asyncHandler(async (req, res) => {
  const { page, limit, status, search } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (search) filter._id = OBJECT_ID_RE.test(search) ? search : null;
  const [orders, total] = await Promise.all([
    Order.find(filter).populate("user", "name email").sort(SORT_NEWEST).skip((page - 1) * limit).limit(limit),
    Order.countDocuments(filter),
  ]);
  res.json({ items: await attachPaymentStatus(orders), page, limit, total, totalPages: Math.ceil(total / limit) });
});

const getById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name email");
  if (!order) throw ApiError.notFound("Order not found.");
  const [withPaymentStatus] = await attachPaymentStatus([order]);
  res.json({ order: withPaymentStatus });
});

async function transition(req, res, to) {
  const order = await Order.findById(req.params.id);
  if (!order) throw ApiError.notFound("Order not found.");
  const updated = await transitionOrder(order, to, { actorType: "admin", actorId: req.admin?._id || null, note: req.body?.note || null });
  res.json({ order: updated });
}

// Admin's role is exactly three actions on an order, in this order:
// confirm (pending -> confirmed), ship (confirmed -> shipped, with
// courier + tracking), or cancel (pending/confirmed -> cancelled).
// Nothing else — see PROGRESS_ORDER_SIMPLIFICATION.md.
const confirm = asyncHandler((req, res) => transition(req, res, "confirmed"));

const ship = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw ApiError.notFound("Order not found.");
  if (order.status !== "confirmed") throw ApiError.conflict(`Cannot ship an order in "${order.status}" status — it must be confirmed first.`);
  const updated = await transitionOrder(order, "shipped", { actorType: "admin", actorId: req.admin?._id || null, note: `${req.body.courierName} / ${req.body.trackingId}` });
  updated.courierName = req.body.courierName;
  updated.trackingId = req.body.trackingId;
  await updated.save();
  res.json({ order: updated });
});

const cancel = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw ApiError.notFound("Order not found.");
  if (!["pending", "confirmed"].includes(order.status)) throw ApiError.conflict(`Cannot cancel an order in "${order.status}" status.`);

  const paidPayment = await Payment.findOne({ order: order._id, status: "paid" });
  if (paidPayment) {
    await initiateRefund(paidPayment, { reason: req.body.reason || "Order cancelled by admin", actorId: req.admin?._id || null });
    await restoreConsumedOrderStock(order, { actorUser: req.admin?._id || null, reason: "Order cancelled and refund initiated" });
    await rollbackConsumedCoupon(order._id, "Order cancelled");
  } else {
    await releaseOrderStock(order, { actorUser: req.admin?._id || null, reason: "Order cancelled" });
    if (order.couponReservationId) await releaseCoupon(order.couponReservationId, "Order cancelled");
  }
  const updated = await transitionOrder(order, "cancelled", { actorType: "admin", actorId: req.admin?._id || null, note: req.body.reason || "Order cancelled" });
  res.json({ order: updated });
});

module.exports = { list, getById, confirm, ship, cancel };

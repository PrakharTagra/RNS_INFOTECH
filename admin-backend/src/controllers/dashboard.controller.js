const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const InventoryLog = require("../models/InventoryLog");
const SiteSettings = require("../models/SiteSettings");
const asyncHandler = require("../utils/asyncHandler");

const DEFAULT_LOW_STOCK_THRESHOLD = 8;
const DAY_MS = 24 * 60 * 60 * 1000;

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function periodDelta(current, previous, { suffix = "vs previous 30d" } = {}) {
  const now = Number(current || 0);
  const before = Number(previous || 0);
  if (before === 0 && now === 0) {
    return { text: `No change ${suffix}`, direction: "flat" };
  }
  if (before === 0) {
    return { text: `New ${suffix}`, direction: "up" };
  }
  const percentage = ((now - before) / Math.abs(before)) * 100;
  const rounded = Math.abs(percentage) < 0.1 ? 0 : Number(percentage.toFixed(1));
  return {
    text: `${rounded > 0 ? "+" : ""}${rounded}% ${suffix}`,
    direction: rounded > 0 ? "up" : rounded < 0 ? "down" : "flat",
  };
}

async function getDashboardSummary(req, res) {
  const now = new Date();
  const currentStart = new Date(now.getTime() - 30 * DAY_MS);
  const previousStart = new Date(now.getTime() - 60 * DAY_MS);
  const weekStart = new Date(now.getTime() - 6 * DAY_MS);

  const settings = await SiteSettings.findOne({ key: "global" })
    .select("commerce")
    .lean();
  const lowStockThreshold = Math.max(
    0,
    Number(settings?.commerce?.lowStockThreshold ?? DEFAULT_LOW_STOCK_THRESHOLD)
  );

  const revenueFilter = {
    createdAt: { $gte: currentStart, $lt: now },
    status: { $nin: ["cancelled", "refunded", "returned"] },
  };
  const previousRevenueFilter = {
    createdAt: { $gte: previousStart, $lt: currentStart },
    status: { $nin: ["cancelled", "refunded", "returned"] },
  };

  const [
    currentSalesAgg,
    previousSalesAgg,
    currentOrders,
    previousOrders,
    pendingOrders,
    previousPendingOrders,
    customerCount,
    currentCustomers,
    previousCustomers,
    lowStockProducts,
    recentOrders,
    recentLogs,
    salesTrend,
  ] = await Promise.all([
    Order.aggregate([{ $match: revenueFilter }, { $group: { _id: null, total: { $sum: "$itemsTotal" } } }]),
    Order.aggregate([{ $match: previousRevenueFilter }, { $group: { _id: null, total: { $sum: "$itemsTotal" } } }]),
    Order.countDocuments({ createdAt: { $gte: currentStart, $lt: now } }),
    Order.countDocuments({ createdAt: { $gte: previousStart, $lt: currentStart } }),
    Order.countDocuments({ status: "pending" }),
    Order.countDocuments({ status: "pending", createdAt: { $gte: previousStart, $lt: currentStart } }),
    User.countDocuments(),
    User.countDocuments({ createdAt: { $gte: currentStart, $lt: now } }),
    User.countDocuments({ createdAt: { $gte: previousStart, $lt: currentStart } }),
    Product.find({ stock: { $lte: lowStockThreshold }, isActive: true })
      .select("name sku stock")
      .sort({ stock: 1, name: 1 })
      .limit(5)
      .lean(),
    Order.find({})
      .sort({ createdAt: -1 })
      .select("_id user itemsTotal status createdAt")
      .populate("user", "name email")
      .limit(5)
      .lean(),
    InventoryLog.find({})
      .sort({ createdAt: -1 })
      .select("reason productName delta createdAt")
      .limit(5)
      .lean(),
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: weekStart, $lt: new Date(now.getTime() + DAY_MS) },
          status: { $nin: ["cancelled", "refunded", "returned"] },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          sales: { $sum: "$itemsTotal" },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const currentSales = Number(currentSalesAgg[0]?.total || 0);
  const previousSales = Number(previousSalesAgg[0]?.total || 0);
  const salesDelta = periodDelta(currentSales, previousSales);
  const ordersDelta = periodDelta(currentOrders, previousOrders);
  const customersDelta = periodDelta(currentCustomers, previousCustomers);
  const pendingDelta = periodDelta(pendingOrders, previousPendingOrders);

  const salesByDay = new Map(
    salesTrend.map((entry) => [entry._id, Number(entry.sales || 0)])
  );
  const salesTrendData = Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(weekStart.getTime() + offset * DAY_MS);
    const key = date.toISOString().slice(0, 10);
    return {
      day: date.toLocaleDateString("en-IN", { weekday: "short" }),
      sales: salesByDay.get(key) || 0,
    };
  });

  const stats = [
    {
      label: "Sales (30d)",
      value: formatCurrency(currentSales),
      delta: salesDelta.text,
      deltaDirection: salesDelta.direction,
      icon: "creditCard",
    },
    {
      label: "Orders (30d)",
      value: String(currentOrders),
      delta: ordersDelta.text,
      deltaDirection: ordersDelta.direction,
      icon: "truck",
    },
    {
      label: "Customers",
      value: String(customerCount),
      delta: `${currentCustomers} new in 30d (${customersDelta.text.replace("vs previous 30d", "vs previous 30d")})`,
      deltaDirection: customersDelta.direction,
      icon: "user",
    },
    {
      label: "Pending orders",
      value: String(pendingOrders),
      delta: pendingDelta.text,
      deltaDirection: pendingDelta.direction,
      icon: "inbox",
    },
    {
      label: "Low-stock products",
      value: String(lowStockProducts.length),
      delta: `Stock ≤ ${lowStockThreshold}`,
      deltaDirection: "flat",
      icon: "warehouse",
    },
  ];

  const recentOrderItems = recentOrders.map((order) => ({
    id: String(order._id),
    customer: order.user?.name || order.user?.email || "Unknown customer",
    total: formatCurrency(order.itemsTotal || 0),
    status: order.status,
  }));

  const lowStockItems = lowStockProducts.map((product) => ({
    name: product.name,
    sku: product.sku,
    stock: product.stock,
  }));

  const recentActivity = recentLogs.map((log) => ({
    text: `${log.reason || "Stock adjusted"} for ${log.productName || "a product"}${log.delta != null ? ` (${log.delta > 0 ? "+" : ""}${log.delta})` : ""}`,
    time: log.createdAt
      ? new Date(log.createdAt).toLocaleString("en-IN", {
          dateStyle: "short",
          timeStyle: "short",
        })
      : "Just now",
  }));

  res.set("Cache-Control", "no-store");
  res.json({
    stats,
    salesTrend: salesTrendData,
    recentOrders: recentOrderItems,
    lowStock: lowStockItems,
    recentActivity,
  });
}

module.exports = { getDashboardSummary: asyncHandler(getDashboardSummary) };

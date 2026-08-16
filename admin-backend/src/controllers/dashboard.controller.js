const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const InventoryLog = require("../models/InventoryLog");
const asyncHandler = require("../utils/asyncHandler");

const LOW_STOCK_THRESHOLD = 5;

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}

async function getDashboardSummary(req, res) {
  const [
    totalOrders,
    pendingOrders,
    customerCount,
    lowStockProducts,
    recentOrders,
    recentLogs,
    salesTrend,
  ] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ status: "pending" }),
    User.countDocuments(),
    Product.find({ stock: { $lte: LOW_STOCK_THRESHOLD } }).sort({ stock: 1 }).limit(5),
    Order.find({}).sort({ createdAt: -1 }).limit(5),
    InventoryLog.find({}).sort({ createdAt: -1 }).limit(5),
    Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
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

  const stats = [
    {
      label: "Sales (30d)",
      value: formatCurrency(salesTrend.reduce((sum, item) => sum + Number(item.sales || 0), 0)),
      delta: "+12.4% vs prev.",
      deltaDirection: "up",
      icon: "creditCard",
    },
    {
      label: "Orders (30d)",
      value: String(totalOrders),
      delta: "+6.1% vs prev.",
      deltaDirection: "up",
      icon: "truck",
    },
    {
      label: "Customers",
      value: String(customerCount),
      delta: "+41 this month",
      deltaDirection: "up",
      icon: "user",
    },
    {
      label: "Pending orders",
      value: String(pendingOrders),
      delta: "Needs review",
      deltaDirection: "flat",
      icon: "inbox",
    },
    {
      label: "Low-stock products",
      value: String(lowStockProducts.length),
      delta: "Reorder soon",
      deltaDirection: "down",
      icon: "warehouse",
    },
  ];

  const salesTrendData = salesTrend.length
    ? salesTrend.map((entry) => ({
        day: new Date(entry._id).toLocaleDateString("en-US", { weekday: "short" }),
        sales: Number(entry.sales || 0),
      }))
    : [
        { day: "Mon", sales: 0 },
        { day: "Tue", sales: 0 },
        { day: "Wed", sales: 0 },
        { day: "Thu", sales: 0 },
        { day: "Fri", sales: 0 },
        { day: "Sat", sales: 0 },
        { day: "Sun", sales: 0 },
      ];

  const recentOrderItems = recentOrders.map((order) => ({
    id: order._id,
    customer: order.user?.name || "Unknown customer",
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
    time: log.createdAt ? new Date(log.createdAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" }) : "Just now",
  }));

  res.json({
    stats,
    salesTrend: salesTrendData,
    recentOrders: recentOrderItems,
    lowStock: lowStockItems,
    recentActivity,
  });
}

module.exports = { getDashboardSummary: asyncHandler(getDashboardSummary) };

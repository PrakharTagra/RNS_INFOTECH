const { Router } = require("express");
const validateParam = require("../middleware/validateParam");

const orderController = require("../controllers/order.controller");
const validate = require("../middleware/validate");
const requireAdmin = require("../middleware/requireAdmin");
const { listOrdersQuerySchema, shipOrderSchema, cancelOrderSchema, transitionOrderSchema } = require("../validators/order.validators");

const router = Router();

// Every route in this service is staff-only, per this project's convention
// (see HANDOFF.md) — no public route here at all, unlike storefront-backend.
const requirePermission = require("../middleware/requirePermission");
const { sensitiveRateLimit } = require("../middleware/rateLimit");

router.use(requireAdmin);

router.get("/", validate(listOrdersQuerySchema, "query"), orderController.list);
router.get("/:id", validateParam("id"), orderController.getById);
router.post("/:id/confirm", sensitiveRateLimit, validateParam("id"), requirePermission("orders.write"), orderController.confirm);
router.post("/:id/pack", sensitiveRateLimit, validateParam("id"), requirePermission("orders.write"), orderController.pack);
router.post("/:id/ship", sensitiveRateLimit, validateParam("id"), requirePermission("orders.write"), validate(shipOrderSchema), orderController.ship);
router.post("/:id/out-for-delivery", sensitiveRateLimit, validateParam("id"), requirePermission("orders.write"), orderController.outForDelivery);
router.post("/:id/deliver", sensitiveRateLimit, validateParam("id"), requirePermission("orders.write"), orderController.deliver);
router.post("/:id/return-requested", sensitiveRateLimit, validateParam("id"), requirePermission("orders.write"), orderController.requestReturn);
router.post("/:id/returned", sensitiveRateLimit, validateParam("id"), requirePermission("orders.write"), orderController.markReturned);
router.post("/:id/cancel", sensitiveRateLimit, validateParam("id"), requirePermission("orders.write"), validate(cancelOrderSchema), orderController.cancel);

module.exports = router;

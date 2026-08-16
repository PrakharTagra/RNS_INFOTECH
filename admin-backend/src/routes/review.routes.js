const { Router } = require("express");
const validateParam = require("../middleware/validateParam");

const reviewController = require("../controllers/review.controller");
const validate = require("../middleware/validate");
const requireAdmin = require("../middleware/requireAdmin");
const { listReviewsQuerySchema, setReviewStatusSchema } = require("../validators/review.validators");

const router = Router();

const requirePermission = require("../middleware/requirePermission");

router.use(requireAdmin);

router.get("/stats", reviewController.stats);
router.get("/", validate(listReviewsQuerySchema, "query"), reviewController.list);
router.get("/:id", validateParam("id"), reviewController.getById);
router.patch("/:id/status", validateParam("id"), requirePermission("reviews.write"), validate(setReviewStatusSchema), reviewController.updateStatus);
router.delete("/:id", validateParam("id"), requirePermission("reviews.write"), reviewController.remove);

module.exports = router;

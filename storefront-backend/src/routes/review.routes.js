const { Router } = require("express");

const reviewController = require("../controllers/review.controller");
const validate = require("../middleware/validate");
const requireAuth = require("../middleware/requireAuth");
const validateParam = require("../middleware/validateParam");
const { createReviewSchema, listReviewsQuerySchema } = require("../validators/review.validators");

const router = Router();

router.use(requireAuth);

router.post("/:productId/reviews", validateParam("productId"), validate(createReviewSchema), reviewController.create);
router.get("/:productId/reviews", validateParam("productId"), validate(listReviewsQuerySchema, "query"), reviewController.listByProduct);

module.exports = router;

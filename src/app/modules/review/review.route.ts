import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { ReviewController } from "./review.controller";
import { createReviewZodSchema, updateReviewZodSchema } from "./review.validation";

const router = Router();

router.post(
  "/",
  checkAuth(Role.CUSTOMER),
  validateRequest(createReviewZodSchema),
  ReviewController.createReview,
);

router.get(
  "/my-reviews",
  checkAuth(Role.CUSTOMER),
  ReviewController.getMyReviews,
);

router.get(
  "/product/:productId",
  ReviewController.getProductReviews,
);

router.patch(
  "/:id",
  checkAuth(Role.CUSTOMER),
  validateRequest(updateReviewZodSchema),
  ReviewController.updateReview,
);

router.delete(
  "/:id",
  checkAuth(Role.CUSTOMER, Role.ADMIN, Role.SUPER_ADMIN),
  ReviewController.deleteReview,
);

export const ReviewRoutes = router;

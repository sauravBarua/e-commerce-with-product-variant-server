import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { PaymentController } from "./payment.controller";

const router = Router();

// Create Stripe checkout session for a given order
router.post(
    "/:orderId",
    checkAuth(Role.CUSTOMER),
    PaymentController.createCheckoutSession,
);

export const PaymentRoutes = router;
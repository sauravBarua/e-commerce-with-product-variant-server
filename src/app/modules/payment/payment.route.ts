import express, { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { PaymentController } from "./payment.controller";

const router = Router();

// Stripe webhook — must use raw body, no auth middleware
router.post(
    "/webhook",
    express.raw({ type: "application/json" }),
    PaymentController.handleStripeWebhookEvent,
);

// Create Stripe checkout session for a given order
router.post(
    "/:orderId",
    checkAuth(Role.CUSTOMER),
    PaymentController.createCheckoutSession,
);

export const PaymentRoutes = router;
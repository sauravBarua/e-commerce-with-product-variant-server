import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { OrderController } from "./order.controller";
import { createOrderZodSchema, updateOrderStatusZodSchema } from "./order.validation";

const router = Router();

router.post(
  "/",
  checkAuth(Role.CUSTOMER),
  validateRequest(createOrderZodSchema),
  OrderController.createOrder,
);

router.get(
  "/my-orders",
  checkAuth(Role.CUSTOMER),
  OrderController.getMyOrders,
);

router.get(
  "/",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  OrderController.getAllOrders,
);

router.get(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.CUSTOMER),
  OrderController.getOrderById,
);

router.patch(
  "/:id/status",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(updateOrderStatusZodSchema),
  OrderController.updateOrderStatus,
);

router.patch(
  "/:id/cancel",
  checkAuth(Role.CUSTOMER),
  OrderController.cancelOrder,
);

export const OrderRoutes = router;

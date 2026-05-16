import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { InventoryController } from "./inventory.controller";
import { createInventoryZodSchema, updateInventoryZodSchema } from "./inventory.validation";

const router = Router();

router.post(
  "/",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(createInventoryZodSchema),
  InventoryController.createInventory,
);

router.get(
  "/",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  InventoryController.getAllInventory,
);

router.get(
  "/:productId",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  InventoryController.getInventoryByProductId,
);

router.patch(
  "/:productId",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(updateInventoryZodSchema),
  InventoryController.updateInventory,
);

export const InventoryRoutes = router;

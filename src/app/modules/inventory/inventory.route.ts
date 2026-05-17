import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { InventoryController } from "./inventory.controller";
import { updateInventoryZodSchema } from "./inventory.validation";

const router = Router();

router.get(
  "/",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  InventoryController.getAllInventory,
);

router.get(
  "/:variantId",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  InventoryController.getInventoryByVariantId,
);

router.patch(
  "/:variantId",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(updateInventoryZodSchema),
  InventoryController.updateInventory,
);

export const InventoryRoutes = router;

import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { CustomerController } from "./customer.controller";
import { updateCustomerZodSchema } from "./customer.validation";

const router = Router();

router.get(
  "/",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  CustomerController.getAllCustomers,
);
router.get(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  CustomerController.getCustomerById,
);
router.patch(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(updateCustomerZodSchema),
  CustomerController.updateCustomer,
);
router.delete(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  CustomerController.deleteCustomer,
);

export const CustomerRoutes = router;

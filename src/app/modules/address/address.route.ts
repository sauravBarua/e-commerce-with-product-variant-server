import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { AddressController } from "./address.controller";
import { createAddressZodSchema, updateAddressZodSchema } from "./address.validation";

const router = Router();

router.post(
  "/",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.CUSTOMER),
  validateRequest(createAddressZodSchema),
  AddressController.createAddress,
);

router.get("/", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), AddressController.getAllAddresses);

router.get("/my", checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.CUSTOMER), AddressController.getMyAddresses);

router.get("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.CUSTOMER), AddressController.getAddressById);

router.patch(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.CUSTOMER),
  validateRequest(updateAddressZodSchema),
  AddressController.updateAddress,
);

router.delete("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), AddressController.deleteAddress);

export const AddressRoutes = router;

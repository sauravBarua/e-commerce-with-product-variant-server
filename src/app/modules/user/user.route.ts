import { Router } from "express";
import { validateRequest } from "../../middleware/validateRequest";
import { UserController } from "./user.controller";
import { createAdminZodSchema } from "./user.validation";
// import { checkAuth } from "../../middleware/checkAuth";
// import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post(
  "/create-admin",
  // checkAuth(Role.SUPER_ADMIN),
  validateRequest(createAdminZodSchema),
  UserController.createAdmin,
);

export const UserRoutes = router;

import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
// import { multerUpload } from "../../config/multer.config";
import { checkAuth } from "../../middleware/checkAuth";
import { AuthController } from "./auth.controller";
import { multerUpload } from "../../config/multer.config";

const router = Router();

router.post("/register", AuthController.registerCustomer);
router.post("/login", AuthController.loginUser);
router.get(
  "/me",
  checkAuth(Role.ADMIN, Role.CUSTOMER, Role.SUPER_ADMIN),
  AuthController.getMe,
);
router.patch(
  "/update-profile",
  checkAuth(Role.ADMIN, Role.CUSTOMER, Role.SUPER_ADMIN),
  multerUpload.single("file"),
  AuthController.updateProfile,
);
router.post("/refresh-token", AuthController.getNewToken);
router.post(
  "/change-password",
  checkAuth(Role.ADMIN, Role.CUSTOMER, Role.SUPER_ADMIN),
  AuthController.changePassword,
);
router.post("/logout", AuthController.logoutUser);
router.post("/verify-email", AuthController.verifyEmail);
router.post("/forget-password", AuthController.forgetPassword);
router.post("/reset-password", AuthController.resetPassword);

router.get("/login/google", AuthController.googleLogin);
router.get("/google/success", AuthController.googleLoginSuccess);
router.get("/oauth/error", AuthController.handleOAuthError);

export const AuthRoutes = router;

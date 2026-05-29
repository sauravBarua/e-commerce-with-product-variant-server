import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { CartController } from "./cart.controller";
import { addToCartZodSchema, updateCartItemZodSchema } from "./cart.validation";

const router = Router();

router.use(checkAuth(Role.CUSTOMER));

router.post("/", validateRequest(addToCartZodSchema), CartController.addToCart);

router.get("/", CartController.getMyCart);

router.patch(
  "/items/:cartItemId",
  validateRequest(updateCartItemZodSchema),
  CartController.updateCartItem,
);

router.delete("/items/:cartItemId", CartController.removeCartItem);

router.delete("/", CartController.clearCart);

export const CartRoutes = router;

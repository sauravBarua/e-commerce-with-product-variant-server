import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { multerUpload } from "../../config/multer.config";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { ProductController } from "./product.controller";
import {
  createColorGroupZodSchema,
  createProductZodSchema,
  createVariantZodSchema,
  updateProductZodSchema,
  updateVariantZodSchema,
} from "./product.validation";

const router = Router();

// ── Product ──────────────────────────────────────────────
router.post(
  "/",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(createProductZodSchema),
  ProductController.createProduct,
);

router.get("/", ProductController.getAllProducts);

router.get("/:id", ProductController.getProductById);

router.patch(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(updateProductZodSchema),
  ProductController.updateProduct,
);

router.delete(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  ProductController.deleteProduct,
);

// ── Color Groups ──────────────────────────────────────────
router.post(
  "/:id/color-groups",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(createColorGroupZodSchema),
  ProductController.addColorGroup,
);

router.delete(
  "/:id/color-groups/:colorGroupId",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  ProductController.deleteColorGroup,
);

// ── Variants (under color groups) ────────────────────────
router.post(
  "/:id/color-groups/:colorGroupId/variants",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(createVariantZodSchema),
  ProductController.addVariant,
);

router.patch(
  "/:id/color-groups/:colorGroupId/variants/:variantId",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(updateVariantZodSchema),
  ProductController.updateVariant,
);

router.delete(
  "/:id/color-groups/:colorGroupId/variants/:variantId",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  ProductController.deleteVariant,
);

// ── Color Group Images ────────────────────────────────────
router.post(
  "/:id/color-groups/:colorGroupId/images",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  multerUpload.array("images"),
  ProductController.uploadColorGroupImages,
);

router.delete(
  "/:id/color-groups/:colorGroupId/images/:imageId",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  ProductController.deleteColorGroupImage,
);

export const ProductRoutes = router;


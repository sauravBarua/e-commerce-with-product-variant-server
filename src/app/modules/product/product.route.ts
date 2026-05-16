import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { multerUpload } from "../../config/multer.config";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { ProductController } from "./product.controller";
import {
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

// ── Variants ─────────────────────────────────────────────
router.post(
  "/:id/variants",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(createVariantZodSchema),
  ProductController.addVariant,
);

router.patch(
  "/:id/variants/:variantId",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(updateVariantZodSchema),
  ProductController.updateVariant,
);

router.delete(
  "/:id/variants/:variantId",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  ProductController.deleteVariant,
);

// ── Variant Images ────────────────────────────────────────
router.post(
  "/:id/variants/:variantId/images",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  multerUpload.array("images"),
  ProductController.uploadVariantImages,
);

router.delete(
  "/:id/variants/:variantId/images/:imageId",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  ProductController.deleteVariantImage,
);

export const ProductRoutes = router;


import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { multerUpload } from "../../config/multer.config";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { BrandController } from "./brand.controller";
import { createBrandZodSchema} from "./brand.validation";

const router = Router();

router.post(
  "/",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  multerUpload.single("file"),
  validateRequest(createBrandZodSchema),
  BrandController.createBrand,
);

router.get("/", BrandController.getAllBrands);

// router.get("/:id", BrandController.getBrandById);

// router.patch(
//   "/:id",
//   checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
//   multerUpload.single("file"),
//   validateRequest(updateBrandZodSchema),
//   BrandController.updateBrand,
// );

router.delete(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  BrandController.deleteBrand,
);

export const BrandRoutes = router;

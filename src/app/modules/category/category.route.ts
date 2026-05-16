import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { multerUpload } from "../../config/multer.config";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { CategoryController } from "./category.controller";
import { createCategoryZodSchema, updateCategoryZodSchema } from "./category.validation";

const router = Router();

router.post(
  "/",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  multerUpload.single("file"),
  validateRequest(createCategoryZodSchema),
  CategoryController.createCategory,
);

router.get("/", CategoryController.getAllCategories);

router.get("/:id", CategoryController.getCategoryById);

router.patch(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  multerUpload.single("file"),
  validateRequest(updateCategoryZodSchema),
  CategoryController.updateCategory,
);

router.delete(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  CategoryController.deleteCategory,
);

export const CategoryRoutes = router;

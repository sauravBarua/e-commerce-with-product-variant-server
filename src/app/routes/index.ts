import { Router } from "express";
import { AddressRoutes } from "../modules/address/address.route";
import { AdminRoutes } from "../modules/admin/admin.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { BrandRoutes } from "../modules/brand/brand.route";
import { CategoryRoutes } from "../modules/category/category.route";
import { InventoryRoutes } from "../modules/inventory/inventory.route";
import { OrderRoutes } from "../modules/order/order.route";
import { ProductRoutes } from "../modules/product/product.route";
import { UserRoutes } from "../modules/user/user.route";
import { PaymentRoutes } from "../modules/payment/payment.route";
import { ReviewRoutes } from "../modules/review/review.route";
import { StatsRoutes } from "../modules/stats/stats.route";

const router = Router();

router.use("/auth", AuthRoutes);
router.use("/users", UserRoutes);
router.use("/admins", AdminRoutes);
router.use("/addresses", AddressRoutes);
router.use("/brands", BrandRoutes);
router.use("/categories", CategoryRoutes);
router.use("/orders", OrderRoutes);
router.use("/inventories", InventoryRoutes);
router.use("/products", ProductRoutes);
router.use("/payments", PaymentRoutes);
router.use("/reviews", ReviewRoutes);
router.use("/stats", StatsRoutes)


export const IndexRoutes = router;

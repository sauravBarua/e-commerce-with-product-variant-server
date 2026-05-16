import express from 'express';
import { Role } from '../../../generated/prisma/browser';
import { checkAuth } from '../../middleware/checkAuth';
import { StatsController } from './stats.controller';

const router = express.Router();

router.get(
    '/',
    checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
    StatsController.getDashboardStatsData
)


export const StatsRoutes = router;
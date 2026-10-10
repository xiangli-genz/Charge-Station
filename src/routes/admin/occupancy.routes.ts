import { Router } from 'express';
import { authenticate, requireAdmin } from '../../middlewares/admin/auth.middleware';
import { getOccupancyDataset } from '../../controllers/admin/occupancy.controller';

const router = Router();
router.use(authenticate, requireAdmin);
router.get('/dataset', getOccupancyDataset);

export default router;

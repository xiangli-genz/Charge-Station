import { Router } from 'express';
import {
  createAdminChargingPointHandler,
  deleteAdminChargingPointHandler,
  getAdminChargingPointByIdHandler,
  importAdminChargingPointsHandler,
  listAdminChargingPointsHandler,
  updateAdminChargingPointHandler,
} from '../controllers/admin-charging-point.controller';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate, requireAdmin);
router.get('/', listAdminChargingPointsHandler);
router.post('/import', importAdminChargingPointsHandler);
router.get('/:id', getAdminChargingPointByIdHandler);
router.post('/', createAdminChargingPointHandler);
router.patch('/:id', updateAdminChargingPointHandler);
router.delete('/:id', deleteAdminChargingPointHandler);

export default router;

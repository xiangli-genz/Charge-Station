import { Router } from 'express';
import {
  createAdminSwapStationHandler,
  deleteAdminSwapStationHandler,
  getAdminSwapStationByIdHandler,
  importAdminSwapStationsHandler,
  listAdminSwapStationsHandler,
  updateAdminSwapStationHandler,
} from '../controllers/admin-swap-station.controller';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate, requireAdmin);
router.get('/', listAdminSwapStationsHandler);
router.post('/import', importAdminSwapStationsHandler);
router.get('/:id', getAdminSwapStationByIdHandler);
router.post('/', createAdminSwapStationHandler);
router.patch('/:id', updateAdminSwapStationHandler);
router.delete('/:id', deleteAdminSwapStationHandler);

export default router;

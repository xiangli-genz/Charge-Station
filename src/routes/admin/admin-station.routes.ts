import { Router } from 'express';
import {
  createAdminStationHandler,
  deleteAdminStationHandler,
  getAdminStationByIdHandler,
  importAdminStationsHandler,
  listAdminStationsHandler,
  updateAdminStationHandler,
} from '../../controllers/admin/admin-station.controller';
import { authenticate, requireAdmin } from '../../middlewares/admin/auth.middleware';

const router = Router();

router.use(authenticate, requireAdmin);
router.get('/', listAdminStationsHandler);
router.post('/import', importAdminStationsHandler);
router.get('/:id', getAdminStationByIdHandler);
router.post('/', createAdminStationHandler);
router.patch('/:id', updateAdminStationHandler);
router.delete('/:id', deleteAdminStationHandler);

export default router;

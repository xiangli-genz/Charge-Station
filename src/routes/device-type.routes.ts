import { Router } from 'express';
import {
  createDeviceTypeHandler,
  deleteDeviceTypeHandler,
  listDeviceTypesHandler,
  updateDeviceTypeHandler,
} from '../controllers/device-type.controller';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate, requireAdmin);
router.get('/', listDeviceTypesHandler);
router.post('/', createDeviceTypeHandler);
router.patch('/:id', updateDeviceTypeHandler);
router.delete('/:id', deleteDeviceTypeHandler);

export default router;

import { Router } from 'express';
import {
  createChargingConnectorTypeHandler,
  deleteChargingConnectorTypeHandler,
  listChargingConnectorTypesHandler,
  updateChargingConnectorTypeHandler,
} from '../../controllers/admin/charging-connector-type.controller';
import { authenticate, requireAdmin } from '../../middlewares/admin/auth.middleware';

const router = Router();

router.use(authenticate, requireAdmin);
router.get('/', listChargingConnectorTypesHandler);
router.post('/', createChargingConnectorTypeHandler);
router.patch('/:id', updateChargingConnectorTypeHandler);
router.delete('/:id', deleteChargingConnectorTypeHandler);

export default router;

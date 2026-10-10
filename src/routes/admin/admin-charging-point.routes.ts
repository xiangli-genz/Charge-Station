import { Router } from 'express';
import {
  createAdminChargingPointHandler,
  deleteAdminChargingPointHandler,
  getAdminChargingPointByIdHandler,
  importAdminChargingPointsHandler,
  listAdminChargingPointsHandler,
  listChargingConnectorProfilesHandler,
  updateAdminChargingPointHandler,
} from '../../controllers/admin/admin-charging-point.controller';
import { listPointOperationsHandler, recordPointErrorHandler, recordPointHeartbeatHandler, recordPointStatusHandler, recordPointTelemetryHandler } from '../../controllers/admin/charging-point-operations.controller';
import { authenticate, requireAdmin } from '../../middlewares/admin/auth.middleware';

const router = Router();

router.use(authenticate, requireAdmin);
router.get('/', listAdminChargingPointsHandler);
router.get('/connector-types', listChargingConnectorProfilesHandler);
router.post('/import', importAdminChargingPointsHandler);
router.get('/:id', getAdminChargingPointByIdHandler);
router.post('/', createAdminChargingPointHandler);
router.patch('/:id', updateAdminChargingPointHandler);
router.delete('/:id', deleteAdminChargingPointHandler);
router.get('/:id/operations', listPointOperationsHandler);
router.post('/:id/status', recordPointStatusHandler);
router.post('/:id/telemetry', recordPointTelemetryHandler);
router.post('/:id/heartbeat', recordPointHeartbeatHandler);
router.post('/:id/errors', recordPointErrorHandler);

export default router;

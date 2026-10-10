import { Router } from 'express';
import { authenticate, requireAdmin } from '../../middlewares/admin/auth.middleware';
import { listAdminChargingSessionsHandler } from '../../controllers/admin/charging-session.controller';

const router = Router();
router.use(authenticate, requireAdmin);
router.get('/', listAdminChargingSessionsHandler);

export default router;

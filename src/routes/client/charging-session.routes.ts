import { Router } from 'express';
import { authenticate, requireCustomer } from '../../middlewares/client/auth.middleware';
import { requireIdempotencyKey } from '../../middlewares/idempotency.middleware';
import { finishChargingSessionHandler, getUserChargingSessionHandler, listUserChargingSessionsHandler, startChargingSessionHandler } from '../../controllers/client/charging-session.controller';

const router = Router();
router.use(authenticate, requireCustomer);
router.get('/', listUserChargingSessionsHandler);
router.get('/:id', getUserChargingSessionHandler);
router.post('/start', requireIdempotencyKey, startChargingSessionHandler);
router.patch('/:id/finish', requireIdempotencyKey, finishChargingSessionHandler);

export default router;

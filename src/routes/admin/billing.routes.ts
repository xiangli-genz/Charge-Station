import { Router } from 'express';
import { authenticate, requireAdmin } from '../../middlewares/admin/auth.middleware';
import { completeRefundHandler } from '../../controllers/admin/billing.controller';

const router = Router();
router.use(authenticate, requireAdmin);
router.patch('/refunds/:refundId/complete', completeRefundHandler);
export default router;

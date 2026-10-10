import { Router } from 'express';
import { authenticate, requireCustomer } from '../../middlewares/client/auth.middleware';
import { requireIdempotencyKey } from '../../middlewares/idempotency.middleware';
import { listInvoicesHandler, requestRefundHandler } from '../../controllers/client/billing.controller';

const router = Router();
router.use(authenticate, requireCustomer);
router.get('/invoices', listInvoicesHandler);
router.post('/invoices/:invoiceId/refunds', requireIdempotencyKey, requestRefundHandler);
export default router;

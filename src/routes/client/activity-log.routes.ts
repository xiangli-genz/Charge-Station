import { Router } from 'express';
import { listActivityLogsHandler } from '../../controllers/client/activity-log.controller';
import { authenticate, requireCustomer } from '../../middlewares/client/auth.middleware';

const router = Router();

router.use(authenticate, requireCustomer);
router.get('/', listActivityLogsHandler);

export default router;

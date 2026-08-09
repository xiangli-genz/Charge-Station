import { Router } from 'express';
import { listActivityLogsHandler } from '../controllers/activity-log.controller';
import { authenticate, requireCustomer } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate, requireCustomer);
router.get('/', listActivityLogsHandler);

export default router;

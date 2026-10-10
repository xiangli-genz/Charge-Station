import { Router } from 'express';
import {
  getCustomerMeHandler,
  updateCustomerProfileHandler,
} from '../../controllers/client/customer-auth.controller';
import { authenticate, requireCustomer } from '../../middlewares/client/auth.middleware';

const router = Router();

router.use(authenticate, requireCustomer);
router.get('/', getCustomerMeHandler);
router.patch('/', updateCustomerProfileHandler);

export default router;

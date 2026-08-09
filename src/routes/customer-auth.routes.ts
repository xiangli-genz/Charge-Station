import { Router } from 'express';
import {
  getCustomerMeHandler,
  loginCustomerHandler,
  registerCustomerHandler,
  updateCustomerProfileHandler,
} from '../controllers/customer-auth.controller';
import { authenticate, requireCustomer } from '../middlewares/auth.middleware';

const router = Router();

router.post('/register', registerCustomerHandler);
router.post('/login', loginCustomerHandler);
router.get('/me', authenticate, requireCustomer, getCustomerMeHandler);
router.patch('/me', authenticate, requireCustomer, updateCustomerProfileHandler);

export default router;

import { Router } from 'express';
import {
  getCustomerMeHandler,
  getCustomerLoginMethodsHandler,
  loginCustomerHandler,
  loginCustomerByPinHandler,
  requestCustomerPinResetOtpHandler,
  resetCustomerPinWithOtpHandler,
  resetCustomerPinWithPasswordHandler,
  registerCustomerHandler,
  setCustomerPinHandler,
  updateCustomerProfileHandler,
  verifyCustomerRegistrationHandler,
} from '../controllers/customer-auth.controller';
import { authenticate, requireCustomer } from '../middlewares/auth.middleware';

const router = Router();

router.post('/register', registerCustomerHandler);
router.post('/register/verify', verifyCustomerRegistrationHandler);
router.get('/login/methods', getCustomerLoginMethodsHandler);
router.post('/login', loginCustomerHandler);
router.post('/login/pin', loginCustomerByPinHandler);
router.post('/pin/reset/password', resetCustomerPinWithPasswordHandler);
router.post('/pin/reset/request-otp', requestCustomerPinResetOtpHandler);
router.post('/pin/reset/verify-otp', resetCustomerPinWithOtpHandler);
router.get('/me', authenticate, requireCustomer, getCustomerMeHandler);
router.patch('/me', authenticate, requireCustomer, updateCustomerProfileHandler);
router.post('/pin', authenticate, requireCustomer, setCustomerPinHandler);

export default router;

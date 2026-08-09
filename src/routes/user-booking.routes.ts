import { Router } from 'express';
import {
  cancelUserBookingHandler,
  createUserBookingHandler,
  getUserBookingByIdHandler,
  listUserBookingsHandler,
} from '../controllers/user-booking.controller';
import { authenticate, requireCustomer } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate, requireCustomer);
router.get('/', listUserBookingsHandler);
router.get('/:id', getUserBookingByIdHandler);
router.post('/', createUserBookingHandler);
router.patch('/:id/cancel', cancelUserBookingHandler);

export default router;

import { Router } from 'express';
import {
  cancelUserBookingHandler,
  createUserBookingHandler,
  getUserBookingByIdHandler,
  listUserBookingsHandler,
} from '../../controllers/client/user-booking.controller';
import { authenticate, requireCustomer } from '../../middlewares/client/auth.middleware';
import { requireIdempotencyKey } from '../../middlewares/idempotency.middleware';

const router = Router();

router.use(authenticate, requireCustomer);
router.get('/', listUserBookingsHandler);
router.get('/:id', getUserBookingByIdHandler);
router.post('/', requireIdempotencyKey, createUserBookingHandler);
router.patch('/:id/cancel', requireIdempotencyKey, cancelUserBookingHandler);

export default router;

import { Router } from 'express';
import {
  createAdminBookingHandler,
  deleteAdminBookingHandler,
  getAdminBookingByIdHandler,
  listAdminBookingsHandler,
  updateAdminBookingHandler,
} from '../../controllers/admin/admin-booking.controller';
import { authenticate, requireAdmin } from '../../middlewares/admin/auth.middleware';

const router = Router();

router.use(authenticate, requireAdmin);
router.get('/', listAdminBookingsHandler);
router.get('/:id', getAdminBookingByIdHandler);
router.post('/', createAdminBookingHandler);
router.patch('/:id', updateAdminBookingHandler);
router.delete('/:id', deleteAdminBookingHandler);

export default router;

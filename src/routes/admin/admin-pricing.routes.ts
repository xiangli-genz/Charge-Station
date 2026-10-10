import { Router } from 'express';
import {
  createAdminPricingHandler,
  deleteAdminPricingHandler,
  getAdminPricingByIdHandler,
  importAdminPricingsHandler,
  listAdminPricingsHandler,
  updateAdminPricingHandler,
} from '../../controllers/admin/admin-pricing.controller';
import { authenticate, requireAdmin } from '../../middlewares/admin/auth.middleware';

const router = Router();

router.use(authenticate, requireAdmin);
router.get('/', listAdminPricingsHandler);
router.post('/import', importAdminPricingsHandler);
router.get('/:id', getAdminPricingByIdHandler);
router.post('/', createAdminPricingHandler);
router.patch('/:id', updateAdminPricingHandler);
router.delete('/:id', deleteAdminPricingHandler);

export default router;

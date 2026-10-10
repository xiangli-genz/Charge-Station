import { Router } from 'express';
import {
  getAdminMeHandler,
  loginAdminHandler,
  registerAdminHandler,
} from '../../controllers/admin/auth.controller';
import { authenticate, requireAdmin } from '../../middlewares/admin/auth.middleware';

const router = Router();

router.post('/register', registerAdminHandler);
router.post('/login', loginAdminHandler);
router.get('/me', authenticate, requireAdmin, getAdminMeHandler);

export default router;

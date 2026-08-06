import { Router } from 'express';
import {
  createStaffHandler,
  getSuperAdminMeHandler,
  listSuperAdminStaffHandler,
  loginSuperAdminHandler,
  updateStaffRoleHandler,
} from '../controllers/superadmin.controller';
import { authenticate, requireSuperAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.post('/auth/login', loginSuperAdminHandler);
router.get('/auth/me', authenticate, requireSuperAdmin, getSuperAdminMeHandler);
router.get('/staff', authenticate, requireSuperAdmin, listSuperAdminStaffHandler);
router.post('/staff', authenticate, requireSuperAdmin, createStaffHandler);
router.patch('/staff/:id/role', authenticate, requireSuperAdmin, updateStaffRoleHandler);

export default router;

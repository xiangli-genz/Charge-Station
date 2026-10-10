import { Router } from 'express';
import {
  createManagedUserHandler,
  deleteManagedUserHandler,
  listManagedUsersHandler,
  resetManagedUserPasswordHandler,
  updateManagedUserHandler,
} from '../../controllers/admin/admin-user-tree.controller';
import { authenticate, requireAdmin } from '../../middlewares/admin/auth.middleware';

const router = Router();

router.use(authenticate, requireAdmin);
router.get('/tree', listManagedUsersHandler);
router.post('/', createManagedUserHandler);
router.patch('/:id', updateManagedUserHandler);
router.post('/:id/reset-password', resetManagedUserPasswordHandler);
router.delete('/:id', deleteManagedUserHandler);

export default router;

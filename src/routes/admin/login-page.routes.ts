import { Router } from 'express';
import {
  createLoginPageHandler,
  deleteLoginPageHandler,
  listLoginPagesHandler,
  updateLoginPageHandler,
} from '../../controllers/admin/login-page.controller';
import { authenticate, requireAdmin } from '../../middlewares/admin/auth.middleware';

const router = Router();

router.use(authenticate, requireAdmin);
router.get('/', listLoginPagesHandler);
router.post('/', createLoginPageHandler);
router.patch('/:id', updateLoginPageHandler);
router.delete('/:id', deleteLoginPageHandler);

export default router;

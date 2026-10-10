import { Router } from 'express';
import {
  createSimTypeHandler,
  deleteSimTypeHandler,
  listSimTypesHandler,
  updateSimTypeHandler,
} from '../../controllers/admin/sim-type.controller';
import { authenticate, requireAdmin } from '../../middlewares/admin/auth.middleware';

const router = Router();

router.use(authenticate, requireAdmin);
router.get('/', listSimTypesHandler);
router.post('/', createSimTypeHandler);
router.patch('/:id', updateSimTypeHandler);
router.delete('/:id', deleteSimTypeHandler);

export default router;

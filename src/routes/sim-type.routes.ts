import { Router } from 'express';
import {
  createSimTypeHandler,
  deleteSimTypeHandler,
  listSimTypesHandler,
  updateSimTypeHandler,
} from '../controllers/sim-type.controller';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate, requireAdmin);
router.get('/', listSimTypesHandler);
router.post('/', createSimTypeHandler);
router.patch('/:id', updateSimTypeHandler);
router.delete('/:id', deleteSimTypeHandler);

export default router;

import { Router } from 'express';
import {
  createPermissionGroupHandler,
  deletePermissionGroupHandler,
  getPermissionCatalogHandler,
  listPermissionGroupsHandler,
  updatePermissionGroupHandler,
} from '../controllers/permission-group.controller';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate, requireAdmin);
router.get('/catalog', getPermissionCatalogHandler);
router.get('/', listPermissionGroupsHandler);
router.post('/', createPermissionGroupHandler);
router.patch('/:id', updatePermissionGroupHandler);
router.delete('/:id', deletePermissionGroupHandler);

export default router;

import { Router } from 'express';
import {
  createPermissionHandler,
  deletePermissionHandler,
  getPermissionCatalogHandler,
  getPermissionGroupOptionsHandler,
  listPermissionsHandler,
  updatePermissionHandler,
} from '../../controllers/admin/permission.controller';
import { authenticate, requireAdmin } from '../../middlewares/admin/auth.middleware';

const router = Router();

router.use(authenticate, requireAdmin);
router.get('/catalog', getPermissionCatalogHandler);
router.get('/groups', getPermissionGroupOptionsHandler);
router.get('/', listPermissionsHandler);
router.post('/', createPermissionHandler);
router.patch('/:id', updatePermissionHandler);
router.delete('/:id', deletePermissionHandler);

export default router;

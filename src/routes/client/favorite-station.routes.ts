import { Router } from 'express';
import {
  addFavoriteStationHandler,
  listFavoriteStationsHandler,
  removeFavoriteStationHandler,
} from '../../controllers/client/favorite-station.controller';
import { authenticate, requireCustomer } from '../../middlewares/client/auth.middleware';

const router = Router();

router.use(authenticate, requireCustomer);
router.get('/', listFavoriteStationsHandler);
router.post('/', addFavoriteStationHandler);
router.delete('/:stationId', removeFavoriteStationHandler);

export default router;

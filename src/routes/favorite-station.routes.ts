import { Router } from 'express';
import {
  addFavoriteStationHandler,
  listFavoriteStationsHandler,
  removeFavoriteStationHandler,
} from '../controllers/favorite-station.controller';
import { authenticate, requireCustomer } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate, requireCustomer);
router.get('/', listFavoriteStationsHandler);
router.post('/', addFavoriteStationHandler);
router.delete('/:stationId', removeFavoriteStationHandler);

export default router;

import { Router } from 'express';
import { getNearbyStations, getStationById, getStations } from '../../controllers/client/station.controller';

const router = Router();

router.get('/', getStations);
router.get('/nearby', getNearbyStations);
router.get('/:id', getStationById);

export default router;

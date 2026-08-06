import { Router } from 'express';
import { getNearbySwapStations, getSwapStations } from '../controllers/swap-station.controller';

const router = Router();

router.get('/', getSwapStations);
router.get('/nearby', getNearbySwapStations);

export default router;

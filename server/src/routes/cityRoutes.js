import { Router } from 'express';
import { getCities, getCityById, getCityActivities } from '../controllers/cityController.js';

const router = Router();

router.get('/', getCities);
router.get('/:id', getCityById);
router.get('/:id/activities', getCityActivities);

export default router;

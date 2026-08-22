import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { updateTripActivity, deleteTripActivity } from '../controllers/tripActivityController.js';

const router = Router();

router.use(authenticateToken);

router.patch('/:id', updateTripActivity);
router.delete('/:id', deleteTripActivity);

export default router;

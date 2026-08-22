import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { updateStop, deleteStop } from '../controllers/stopController.js';
import { addActivityToStop } from '../controllers/tripActivityController.js';

const router = Router();

router.use(authenticateToken);

router.patch('/:id', updateStop);
router.delete('/:id', deleteStop);
router.post('/:id/activities', addActivityToStop);

export default router;

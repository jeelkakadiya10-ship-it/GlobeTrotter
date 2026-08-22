import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getMe, updateMe, deleteMe } from '../controllers/userController.js';

const router = Router();

router.use(authenticateToken);

router.get('/me', getMe);
router.patch('/me', updateMe);
router.delete('/me', deleteMe);

export default router;

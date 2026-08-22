import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { getAdminStats, getAdminUsers, toggleDisableUser } from '../controllers/adminController.js';

const router = Router();

// Strictly protect all admin routes with authentication and server-side role check
router.use(authenticateToken);
router.use(requireAdmin);

router.get('/stats', getAdminStats);
router.get('/users', getAdminUsers);
router.patch('/users/:id/disable', toggleDisableUser);

export default router;

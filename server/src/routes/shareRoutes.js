import { Router } from 'express';
import { getPublicTripBySlug } from '../controllers/shareController.js';

const router = Router();

// Completely public endpoint - zero auth required
router.get('/:slug', getPublicTripBySlug);

export default router;

import { Router } from 'express';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import {
  getMyTrips,
  createTrip,
  getTripById,
  updateTrip,
  deleteTrip,
  toggleShare,
  copyTrip
} from '../controllers/tripController.js';
import { addStop, reorderStops } from '../controllers/stopController.js';
import { getTripBudget, addBudgetEntry } from '../controllers/budgetController.js';

const router = Router();

// Publicly viewable or authenticated
router.get('/:id', optionalAuth, getTripById);

// Protected routes
router.use(authenticateToken);

router.get('/', getMyTrips);
router.post('/', createTrip);
router.patch('/:id', updateTrip);
router.delete('/:id', deleteTrip);
router.patch('/:id/share', toggleShare);
router.post('/:id/copy', copyTrip);

// Stops on a trip
router.post('/:id/stops', addStop);
router.patch('/:id/stops/reorder', reorderStops);

// Budget on a trip
router.get('/:id/budget', getTripBudget);
router.post('/:id/budget-entries', addBudgetEntry);

export default router;

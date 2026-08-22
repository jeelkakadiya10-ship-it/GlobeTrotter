import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { deleteBudgetEntry } from '../controllers/budgetController.js';

const router = Router();

router.use(authenticateToken);

router.delete('/:id', deleteBudgetEntry);

export default router;

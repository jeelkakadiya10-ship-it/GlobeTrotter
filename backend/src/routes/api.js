import express from 'express';
import { signup, login, forgotPassword } from '../controllers/authController.js';
import { getMe, updateMe, deleteMe, toggleSaveCity } from '../controllers/userController.js';
import { getTrips, createTrip, getTripById, updateTrip, deleteTrip, toggleShare, copyTrip } from '../controllers/tripController.js';
import { addStop, updateStop, deleteStop, reorderStops } from '../controllers/stopController.js';
import { getCities, getCityActivities } from '../controllers/cityController.js';
import { addActivityToStop, updateTripActivity, deleteTripActivity } from '../controllers/tripActivityController.js';
import { getTripBudget, addBudgetEntry, deleteBudgetEntry } from '../controllers/budgetController.js';
import { getPublicTrip } from '../controllers/publicController.js';
import { getAdminStats, getAdminUsers, toggleDisableUser } from '../controllers/adminController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Auth Endpoints
router.post('/auth/signup', signup);
router.post('/auth/login', login);
router.post('/auth/forgot-password', forgotPassword);

// Users Endpoints
router.get('/users/me', authenticateToken, getMe);
router.patch('/users/me', authenticateToken, updateMe);
router.delete('/users/me', authenticateToken, deleteMe);
router.post('/users/save-city', authenticateToken, toggleSaveCity);

// Trips Endpoints
router.get('/trips', authenticateToken, getTrips);
router.post('/trips', authenticateToken, createTrip);
router.get('/trips/:id', authenticateToken, getTripById);
router.patch('/trips/:id', authenticateToken, updateTrip);
router.delete('/trips/:id', authenticateToken, deleteTrip);
router.patch('/trips/:id/share', authenticateToken, toggleShare);
router.post('/trips/:id/copy', authenticateToken, copyTrip);

// Stops Endpoints
router.post('/trips/:id/stops', authenticateToken, addStop);
router.patch('/stops/:id', authenticateToken, updateStop);
router.delete('/stops/:id', authenticateToken, deleteStop);
router.patch('/trips/:id/stops/reorder', authenticateToken, reorderStops);

// Cities & Activities Endpoints
router.get('/cities', getCities);
router.get('/cities/:id/activities', getCityActivities);

// Trip Activities Endpoints
router.post('/stops/:id/activities', authenticateToken, addActivityToStop);
router.patch('/trip-activities/:id', authenticateToken, updateTripActivity);
router.delete('/trip-activities/:id', authenticateToken, deleteTripActivity);

// Budget Endpoints
router.get('/trips/:id/budget', authenticateToken, getTripBudget);
router.post('/trips/:id/budget-entries', authenticateToken, addBudgetEntry);
router.delete('/budget-entries/:id', authenticateToken, deleteBudgetEntry);

// Public Endpoints (No Auth)
router.get('/share/:slug', getPublicTrip);

// Admin Endpoints (Role = 'admin' checked on server)
router.get('/admin/stats', authenticateToken, requireAdmin, getAdminStats);
router.get('/admin/users', authenticateToken, requireAdmin, getAdminUsers);
router.patch('/admin/users/:id/disable', authenticateToken, requireAdmin, toggleDisableUser);

export default router;
import express from 'express';
import { getMessProfile, requestJoin } from '../controllers/messController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Owner routes
router.get('/profile', protect, authorizeRoles('mess_owner'), getMessProfile);

// Student routes
router.post('/join', protect, authorizeRoles('student'), requestJoin);

export default router;

import express from 'express';
import { getPlatformStats } from '../controllers/adminController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, authorizeRoles('super_admin'), getPlatformStats);

export default router;

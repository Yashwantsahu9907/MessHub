import express from 'express';
import { 
  getPlatformStats,
  getAllMesses,
  updateMessStatus,
  getAllUsers,
  updateUserSuspension,
  broadcastAnnouncement,
  getAllComplaints,
  resolveComplaint,
  getSettings,
  updateSetting,
  getSystemHealth
} from '../controllers/adminController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// All admin routes are protected and restricted to Super Admins
router.use(protect);
router.use(authorizeRoles('super_admin'));

router.get('/stats', getPlatformStats);
router.get('/messes', getAllMesses);
router.put('/messes/:id/status', updateMessStatus);
router.get('/users', getAllUsers);
router.put('/users/:id/suspend', updateUserSuspension);
router.post('/broadcast', broadcastAnnouncement);
router.get('/complaints', getAllComplaints);
router.put('/complaints/:id/resolve', resolveComplaint);
router.get('/settings', getSettings);
router.put('/settings', updateSetting);
router.get('/health', getSystemHealth);

export default router;

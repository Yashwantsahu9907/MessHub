import express from 'express';
import { 
  getMessProfile, 
  requestJoin,
  getJoinRequests,
  processJoinRequest,
  getMessMembers,
  removeMember,
  getStudentMess,
  markAttendance,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  createPlan,
  getPlans,
  assignPlan,
  updatePaymentStatus,
  getOwnerPayments,
  getStudentPayments
} from '../controllers/messController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Common
router.get('/plans', protect, getPlans);

// Owner routes
router.get('/profile', protect, authorizeRoles('mess_owner'), getMessProfile);
router.get('/requests', protect, authorizeRoles('mess_owner'), getJoinRequests);
router.put('/requests/:id', protect, authorizeRoles('mess_owner'), processJoinRequest);
router.get('/members', protect, authorizeRoles('mess_owner'), getMessMembers);
router.delete('/members/:studentId', protect, authorizeRoles('mess_owner'), removeMember);

// Owner Plans & Payments
router.post('/plans', protect, authorizeRoles('mess_owner'), createPlan);
router.get('/payments', protect, authorizeRoles('mess_owner'), getOwnerPayments);
router.post('/payments/assign', protect, authorizeRoles('mess_owner'), assignPlan);
router.put('/payments/:id/status', protect, authorizeRoles('mess_owner'), updatePaymentStatus);

// Student routes
router.post('/join', protect, authorizeRoles('student'), requestJoin);
router.get('/student/active', protect, authorizeRoles('student'), getStudentMess);
router.post('/attendance', protect, authorizeRoles('student'), markAttendance);
router.get('/notifications', protect, getNotifications);
router.put('/notifications/read-all', protect, markAllNotificationsRead);
router.put('/notifications/:id/read', protect, markNotificationRead);
router.get('/student/payments', protect, authorizeRoles('student'), getStudentPayments);

export default router;

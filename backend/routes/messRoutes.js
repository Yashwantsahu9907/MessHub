import express from 'express';
import { 
  getMessProfile, 
  requestJoin,
  getJoinRequests,
  processJoinRequest,
  getMessMembers,
  removeMember,
  getStudentMess
} from '../controllers/messController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Owner routes
router.get('/profile', protect, authorizeRoles('mess_owner'), getMessProfile);
router.get('/requests', protect, authorizeRoles('mess_owner'), getJoinRequests);
router.put('/requests/:id', protect, authorizeRoles('mess_owner'), processJoinRequest);
router.get('/members', protect, authorizeRoles('mess_owner'), getMessMembers);
router.delete('/members/:studentId', protect, authorizeRoles('mess_owner'), removeMember);

// Student routes
router.post('/join', protect, authorizeRoles('student'), requestJoin);
router.get('/student/active', protect, authorizeRoles('student'), getStudentMess);

export default router;

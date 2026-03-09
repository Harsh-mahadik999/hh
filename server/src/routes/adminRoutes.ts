import { Router } from 'express';
import {
  getDashboardStats,
  updateSettings,
  getSettings,
  getAllStudents,
  addStudent,
  resetVotes,
} from '../controllers/adminController';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

router.use(protect, adminOnly);

router.get('/stats', getDashboardStats);
router.get('/settings', getSettings);
router.put('/settings', updateSettings);
router.get('/students', getAllStudents);
router.post('/students', addStudent);
router.post('/reset-votes', resetVotes);

export default router;

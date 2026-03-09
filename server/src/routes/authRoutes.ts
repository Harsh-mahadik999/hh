import { Router } from 'express';
import { studentLogin, adminLogin } from '../controllers/authController';

const router = Router();

router.post('/student-login', studentLogin);
router.post('/admin-login', adminLogin);

export default router;

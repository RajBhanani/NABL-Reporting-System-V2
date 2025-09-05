import { Router } from 'express';

import {
  login,
  logout,
  me,
  refreshToken,
  register,
} from '../controllers/auth.controller';
import authenticate from '../middlewares/auth.middleware';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.get('/refresh-token', refreshToken);
router.get('/me', authenticate, me);
router.post('/logout', authenticate, logout);

export default router;

import express from 'express';
import { 
  register, 
  login, 
  logout, 
  refreshAccessToken, 
  getProfile 
} from '../controller/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();

// Public routes with rate limiting
router.post('/register', register);
router.post('/login',  login);
router.post('/logout', logout);
router.post('/refresh-token', refreshAccessToken);

// Protected routes
router.get('/profile', authenticateToken, getProfile);

export default router;
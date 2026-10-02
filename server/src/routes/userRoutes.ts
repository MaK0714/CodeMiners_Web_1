import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

// Get current user profile
router.get('/me', requireAuth, (req: any, res: any) => {
  res.json({ success: true, user: req.user });
});

export default router;

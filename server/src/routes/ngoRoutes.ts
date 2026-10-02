import { Router, Request, Response } from 'express';
import { Ngo } from '../models/Ngo';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

// Get all NGOs
router.get('/', async (req: Request, res: Response) => {
  try {
    const ngos = await Ngo.find().populate('userId', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, ngos });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create or update NGO profile
router.post('/profile', requireAuth, async (req: any, res: any) => {
  try {
    if (req.user.role !== 'ngo') {
      return res.status(403).json({ success: false, message: 'Only users with NGO role can create a profile.' });
    }

    const { mission, website } = req.body;
    let ngo = await Ngo.findOne({ userId: req.user._id });
    
    if (ngo) {
      ngo.mission = mission;
      ngo.website = website;
      await ngo.save();
    } else {
      ngo = await Ngo.create({
        userId: req.user._id,
        mission,
        website
      });
    }
    
    res.json({ success: true, ngo });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

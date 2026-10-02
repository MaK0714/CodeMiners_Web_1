import { Router } from 'express';
import { User } from '../models/User';

const router = Router();

// Basic register endpoint (No email verification needed)
router.post('/register', async (req: any, res: any) => {
  try {
    const { email, password, name, role } = req.body;
    
    // Check if user exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const user = await User.create({
      email,
      password, // In a real app, hash this with bcrypt!
      name: name || email.split('@')[0],
      role: role === 'ngo' ? 'ngo' : 'supporter'
    });

    // We'll use the user ID as a simple token for MVP
    res.json({ success: true, token: user._id, user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Basic login endpoint
router.post('/login', async (req: any, res: any) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.json({ success: true, token: user._id, user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Profile route using simple token
router.get('/me', async (req: any, res: any) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });

    const user = await User.findById(token);
    if (!user) return res.status(401).json({ error: 'User not found' });

    res.json({ success: true, user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

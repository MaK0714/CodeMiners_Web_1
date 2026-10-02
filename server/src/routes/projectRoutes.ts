import { Router, Request, Response } from 'express';
import { Project } from '../models/Project';
import { requireAuth, requireRole } from '../middleware/authMiddleware';
import { Ngo } from '../models/Ngo';

const router = Router();

// Get all projects
router.get('/', async (req: Request, res: Response) => {
  try {
    const projects = await Project.find().populate('ngoId', 'mission verified').sort({ createdAt: -1 });
    res.json({ success: true, projects });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create project (NGO only)
router.post('/', requireAuth, requireRole(['ngo']), async (req: any, res: any) => {
  try {
    const ngo = await Ngo.findOne({ userId: req.user._id });
    if (!ngo) {
      return res.status(404).json({ success: false, message: 'NGO profile not found' });
    }

    const { title, description, status, needs } = req.body;
    const project = await Project.create({
      ngoId: ngo._id,
      title,
      description,
      status,
      needs
    });
    res.status(201).json({ success: true, project });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get project by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const project = await Project.findById(req.params.id).populate('ngoId');
    if (!project) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, project });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

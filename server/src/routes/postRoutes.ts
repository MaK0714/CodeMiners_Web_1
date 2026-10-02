import { Router, Request, Response } from 'express';
import { Post } from '../models/Post';
import { requireAuth, requireRole, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

// Get main feed (Instagram/Twitter style)
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const posts = await Post.find()
      .populate('authorId', 'name profilePic role')
      .populate('projectId')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, posts });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create a new post (For NGOs and Users)
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { content, mediaUrls, type, projectId } = req.body;
    
    // In Twitter/Instagram, anyone can post. But we can restrict if needed.
    const post = await Post.create({
      authorId: req.user!._id,
      content,
      mediaUrls: mediaUrls || [],
      type: type || 'general',
      projectId,
      likes: []
    });

    const populatedPost = await post.populate('authorId', 'name profilePic role');
    res.status(201).json({ success: true, post: populatedPost });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Like / Unlike a post
router.post('/:id/like', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const userId = req.user!._id;
    const hasLiked = post.likes.includes(userId);

    if (hasLiked) {
      // Unlike
      post.likes = post.likes.filter(id => id.toString() !== userId.toString());
    } else {
      // Like
      post.likes.push(userId);
    }

    await post.save();
    res.json({ success: true, likes: post.likes.length, hasLiked: !hasLiked });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

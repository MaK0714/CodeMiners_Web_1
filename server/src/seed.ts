import { User } from './models/User';
import { Ngo } from './models/Ngo';
import { Project } from './models/Project';
import { Post } from './models/Post';
import mongoose from 'mongoose';

export const seedDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) return; // Already seeded

    console.log('[SEED] Seeding demo data...');

    // 1. Create Demo User
    const demoUser = await User.create({
      supabaseId: 'demo-supabase-id-123',
      email: 'demo-ngo@example.com',
      name: 'Global Health Initiative',
      role: 'ngo'
    });

    // 2. Create NGO Profile
    const ngo = await Ngo.create({
      userId: demoUser._id,
      mission: 'Providing access to clean water and healthcare in rural communities.',
      website: 'https://example-globalhealth.org',
      verified: true
    });

    // 3. Create a Project
    const project = await Project.create({
      ngoId: ngo._id,
      title: 'Clean Water for Samburu County',
      description: 'Building 5 new solar-powered boreholes to provide clean drinking water to 10,000 residents.',
      status: 'active',
      needs: ['Solar Panels', 'Water Pumps', 'Volunteer Engineers']
    });

    // 4. Create Posts
    await Post.create([
      {
        ngoId: ngo._id,
        projectId: project._id,
        type: 'update',
        content: 'Surveying for the first two borehole locations is complete! We found excellent aquifers at 80m depth. Drilling begins next Monday.',
        mediaUrls: []
      },
      {
        ngoId: ngo._id,
        projectId: project._id,
        type: 'need',
        content: 'URGENT: Due to supply chain delays, we are short on high-capacity solar batteries. If any foundations or corporate partners can expedite this, please reach out.',
        mediaUrls: []
      },
      {
        ngoId: ngo._id,
        projectId: project._id,
        type: 'milestone',
        content: 'Borehole #1 is operational! Over 1,200 people now have access to clean, safe drinking water within a 1km radius of their homes.',
        mediaUrls: []
      }
    ]);

    console.log('[SEED] Demo data seeded successfully.');
  } catch (err) {
    console.error('[SEED ERROR]', err);
  }
};

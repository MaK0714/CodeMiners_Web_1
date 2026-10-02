import React, { useEffect, useState } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from '../context/AuthContext';
import NgoPostCard, { NgoPostData } from '../components/NgoPostCard';

const SEED_POSTS: NgoPostData[] = [
  {
    id: 'seed-1',
    category: 'Environment',
    upcoming: 'This Saturday, 8:00 AM',
    ngoName: 'EcoWarriors India',
    ngoUsername: 'ecowarriors',
    ngoAvatar: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=120&auto=format&fit=crop&q=80',
    ngoId: 'ngo-1',
    isVerified: true,
    isFollowing: true,
    headline: 'Mega Mangrove Restoration & Cleanup Drive at Mahim Nature Creek',
    moneyNeed: {
      raised: 68000,
      goal: 120000
    },
    volunteersNeed: {
      enrolled: 18,
      required: 25
    },
    description: 'Join our weekend coastal mission to extract plastic debris and plant 400 mangrove saplings. Mangroves are our coastal bio-shield against storms and sea erosion. Gloves, gumboots, and drinking water will be supplied for all registered participants.',
    mediaUrls: ['https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80'],
    liveStatus: 'Active Drive • 72% Volunteers Confirmed • Meeting point: Gate 2 Mahim Nature Park',
    likesCount: 84,
    isLiked: false,
    repostsCount: 19,
    suggestions: [
      { id: 's1', authorName: 'Pooja Sharma', text: 'Can we bring our own reusable collection sacks? Happy to bring 10 bags!', time: '2h ago' },
      { id: 's2', authorName: 'Rohan Mehta', text: 'Will there be a waste weighing station before municipal handover?', time: '4h ago' }
    ]
  },
  {
    id: 'seed-2',
    category: 'Food Relief',
    upcoming: 'Tonight, 9:30 PM',
    ngoName: 'Robin Hood Army',
    ngoUsername: 'robinhoodarmy',
    ngoAvatar: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=120&auto=format&fit=crop&q=80',
    ngoId: 'ngo-2',
    isVerified: true,
    isFollowing: false,
    headline: 'Redistributing 1,500 freshly packed surplus meals across central shelter homes',
    moneyNeed: {
      raised: 0,
      goal: 0
    },
    volunteersNeed: {
      enrolled: 28,
      required: 35
    },
    description: 'Hunger has no curfew. Our Green Brigade vehicles are collecting surplus nutritious food from 6 banquets tonight. Every single meal is temperature-checked and distributed directly to children and elderly residents.',
    mediaUrls: ['https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&auto=format&fit=crop&q=80'],
    liveStatus: 'Night Dispatch Mobilized • 6 Partner Banquets Picked Up • Routes active',
    likesCount: 142,
    isLiked: true,
    repostsCount: 45,
    suggestions: [
      { id: 's3', authorName: 'Karan Patel', text: 'I have a van available in Andheri East if extra transport is needed!', time: '1h ago' }
    ]
  },
  {
    id: 'seed-3',
    category: 'Children & Education',
    upcoming: 'Monday Morning, 7:00 AM',
    ngoName: 'Akshaya Patra Foundation',
    ngoUsername: 'akshayapatra',
    ngoAvatar: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=120&auto=format&fit=crop&q=80',
    ngoId: 'ngo-3',
    isVerified: true,
    isFollowing: false,
    headline: 'Hot Mid-Day Meals for 10,000 Government School Students',
    moneyNeed: {
      raised: 340000,
      goal: 500000
    },
    volunteersNeed: {
      enrolled: 14,
      required: 20
    },
    description: 'No child should choose between education and hunger. Our high-tech centralized kitchens cook balanced lentils, rice, and fresh vegetables before dawn, serving schools on time every single weekday.',
    mediaUrls: ['https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&auto=format&fit=crop&q=80'],
    liveStatus: 'Automated Cooking Units Prepped • Food Safety Audits Cleared • 100% On Schedule',
    likesCount: 215,
    isLiked: false,
    repostsCount: 62,
    suggestions: []
  }
];

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<NgoPostData[]>([]);
  const [loading, setLoading] = useState(true);

  // Create post states matching wireframe fields
  const [headline, setHeadline] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Environment');
  const [upcoming, setUpcoming] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [volunteersNeeded, setVolunteersNeeded] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [liveStatus, setLiveStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles(id, full_name, avatar_url, role, username)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data && data.length > 0) {
        const formatted: NgoPostData[] = data.map((p: any) => {
          const author = p.author || {};
          return {
            id: p.id,
            category: p.type === 'milestone' ? 'Milestone' : (p.type === 'need' ? 'Urgent Need' : 'Community'),
            upcoming: 'Recent Activity',
            ngoName: author.full_name || 'Community Member',
            ngoUsername: author.username || 'member',
            ngoAvatar: author.avatar_url,
            ngoId: p.author_id,
            isVerified: author.role === 'ngo',
            headline: p.content.slice(0, 90) + (p.content.length > 90 ? '...' : ''),
            description: p.content,
            mediaUrls: p.media_urls || [],
            liveStatus: 'Published on Goodwork Platform',
            likesCount: Math.floor(Math.random() * 20) + 5,
            isLiked: false,
            repostsCount: Math.floor(Math.random() * 8) + 1,
            suggestions: []
          };
        });

        // Merge DB posts on top of seed posts
        setPosts([...formatted, ...SEED_POSTS]);
      } else {
        setPosts(SEED_POSTS);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts(SEED_POSTS);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!headline.trim() && !description.trim()) return;
    if (!user) return;

    setSubmitting(true);
    try {
      const mediaList = mediaUrl.trim() ? [mediaUrl.trim()] : [];
      const combinedContent = `${headline.trim()}\n\n${description.trim()}`;

      // Insert into Supabase
      const { data, error } = await supabase
        .from('posts')
        .insert({
          author_id: user.id,
          content: combinedContent,
          media_urls: mediaList,
          type: 'general'
        })
        .select('*, author:profiles(id, full_name, avatar_url, role, username)')
        .maybeSingle();

      const newPost: NgoPostData = {
        id: data?.id || Date.now().toString(),
        category: category,
        upcoming: upcoming.trim() || 'Upcoming Volunteer Drive',
        ngoName: user.name || 'Community Member',
        ngoUsername: user.email?.split('@')[0] || 'user',
        ngoAvatar: '',
        ngoId: user.id,
        isVerified: user.role === 'ngo',
        headline: headline.trim() || description.trim().slice(0, 80),
        moneyNeed: goalAmount ? { raised: 0, goal: Number(goalAmount) } : undefined,
        volunteersNeed: volunteersNeeded ? { enrolled: 1, required: Number(volunteersNeeded) } : undefined,
        description: description.trim() || headline.trim(),
        mediaUrls: mediaList,
        liveStatus: liveStatus.trim() || '🟢 Active Initiative • Registrations Open',
        likesCount: 1,
        isLiked: false,
        repostsCount: 0,
        suggestions: []
      };

      setPosts([newPost, ...posts]);
      
      // Reset form
      setHeadline('');
      setDescription('');
      setUpcoming('');
      setGoalAmount('');
      setVolunteersNeeded('');
      setMediaUrl('');
      setLiveStatus('');
      setShowAdvancedFields(false);
    } catch (err) {
      console.error('Failed to create post:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* ========================================================
          CREATE POST CARD (Matches Wireframe Architecture)
          ======================================================== */}
      <div className="twitter-post-card" style={{ padding: '1.25rem 1.5rem' }}>
        <form onSubmit={handleCreatePost} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text-main)' }}>
              {user?.role === 'ngo' ? '📢 Post an NGO Drive / Initiative' : '✍️ Share Volunteer Story or Need'}
            </span>
            <span className="noti-badge">
              {user?.role === 'ngo' ? 'Verified NGO Mode' : 'Supporter'}
            </span>
          </div>

          {/* 1-Line Headline */}
          <input 
            type="text" 
            placeholder="1-Line Headline / Summary (e.g. Mangrove Plantation Drive this Sunday)"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className="auth-input"
            style={{ fontWeight: 600, fontSize: '0.92rem', padding: '0.65rem 0.85rem' }}
            required
          />

          {/* Expandable Story Description */}
          <textarea 
            rows={2}
            placeholder="Detailed description: who is this for, instructions, what to bring..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="auth-input"
            style={{ fontSize: '0.88rem', padding: '0.65rem 0.85rem', resize: 'vertical' }}
            required
          />

          {/* Advanced Wireframe Fields Toggle */}
          {showAdvancedFields && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.75rem', backgroundColor: 'var(--color-bg)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label className="field-label">Category</label>
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                    className="auth-input"
                    style={{ fontSize: '0.82rem', padding: '0.45rem' }}
                  >
                    <option value="Environment">Environment</option>
                    <option value="Food Relief">Food Relief</option>
                    <option value="Education">Education</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Animals">Animals</option>
                    <option value="Disaster Relief">Disaster Relief</option>
                  </select>
                </div>

                <div>
                  <label className="field-label">Upcoming Date / Time</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Next Saturday 8:00 AM"
                    value={upcoming}
                    onChange={(e) => setUpcoming(e.target.value)}
                    className="auth-input"
                    style={{ fontSize: '0.82rem', padding: '0.45rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label className="field-label">Funding Goal (₹)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 50000"
                    value={goalAmount}
                    onChange={(e) => setGoalAmount(e.target.value)}
                    className="auth-input"
                    style={{ fontSize: '0.82rem', padding: '0.45rem' }}
                  />
                </div>

                <div>
                  <label className="field-label">Volunteers Needed</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 20"
                    value={volunteersNeeded}
                    onChange={(e) => setVolunteersNeeded(e.target.value)}
                    className="auth-input"
                    style={{ fontSize: '0.82rem', padding: '0.45rem' }}
                  />
                </div>
              </div>

              <div>
                <label className="field-label">Photo or Video URL</label>
                <input 
                  type="url" 
                  placeholder="Paste direct .jpg, .png, or .mp4 link"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  className="auth-input"
                  style={{ fontSize: '0.82rem', padding: '0.45rem' }}
                />
              </div>

              <div>
                <label className="field-label">Live Status Update Note</label>
                <input 
                  type="text" 
                  placeholder="e.g. Registrations open • 12 spots left"
                  value={liveStatus}
                  onChange={(e) => setLiveStatus(e.target.value)}
                  className="auth-input"
                  style={{ fontSize: '0.82rem', padding: '0.45rem' }}
                />
              </div>

            </div>
          )}

          {/* Bottom Bar: Add Details & Submit Button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.65rem' }}>
            <button 
              type="button" 
              onClick={() => setShowAdvancedFields(!showAdvancedFields)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-green)',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              <span>{showAdvancedFields ? '▲ Less Options' : '▼ Add Needs, Dates & Media'}</span>
            </button>

            <button 
              type="submit" 
              disabled={submitting || (!headline.trim() && !description.trim())}
              className="noti-following-btn active"
              style={{
                padding: '0.45rem 1.4rem',
                fontSize: '0.88rem',
                opacity: (!headline.trim() && !description.trim()) ? 0.6 : 1
              }}
            >
              {submitting ? 'Publishing...' : 'Publish Post'}
            </button>
          </div>

        </form>
      </div>

      {/* ========================================================
          FEED POSTS (Rendering exact 8-row Wireframe Architecture)
          ======================================================== */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
          Loading community initiatives and posts...
        </div>
      ) : (
        posts.map(post => (
          <NgoPostCard 
            key={post.id} 
            post={post} 
            onUpdate={(updated) => {
              setPosts(prev => prev.map(p => p.id === updated.id ? updated : p));
            }}
          />
        ))
      )}

    </div>
  );
};

export default HomePage;

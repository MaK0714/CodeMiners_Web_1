import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { useAuth } from '../context/AuthContext';
import VerifiedBadge from '../components/VerifiedBadge';

const NGO_CATEGORIES = [
  'All', 'Education', 'Healthcare', 'Food', 'Environment', 'Women', 'Children',
  'Elderly', 'Animals', 'Disability', 'Disaster Relief', 'Employment'
];

interface NgoItem {
  id: string;
  name: string;
  username: string;
  mission: string;
  category: string;
  avatar: string;
  verified: boolean;
  followersCount: number;
  location: string;
  certification: string;
}

const DEMO_NGOS: NgoItem[] = [
  {
    id: 'ngo-1',
    name: 'EcoWarriors India',
    username: 'ecowarriors',
    mission: 'Reclaiming urban forests and lake ecosystems across metropolitan zones with community drives.',
    category: 'Environment',
    avatar: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=120&auto=format&fit=crop&q=80',
    verified: true,
    followersCount: 1420,
    location: 'Mumbai, Maharashtra',
    certification: '80G & 12A Certified'
  },
  {
    id: 'ngo-2',
    name: 'Robin Hood Army',
    username: 'robinhoodarmy',
    mission: 'Zero-funds volunteer organization serving surplus food to underprivileged communities across 180+ cities.',
    category: 'Food',
    avatar: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=120&auto=format&fit=crop&q=80',
    verified: true,
    followersCount: 8900,
    location: 'Pan-India',
    certification: 'Govt Registered Non-Profit'
  },
  {
    id: 'ngo-3',
    name: 'Akshaya Patra Foundation',
    username: 'akshayapatra',
    mission: 'Striving to eliminate classroom hunger through nutritional mid-day meal programs across schools.',
    category: 'Children',
    avatar: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=120&auto=format&fit=crop&q=80',
    verified: true,
    followersCount: 12500,
    location: 'Bengaluru, India',
    certification: '80G / FCRA Approved'
  },
  {
    id: 'ngo-4',
    name: 'Save The Stray Animals',
    username: 'strayrescue',
    mission: 'Emergency medical aid, rescue drives and permanent shelter for injured and abandoned animals.',
    category: 'Animals',
    avatar: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=120&auto=format&fit=crop&q=80',
    verified: true,
    followersCount: 740,
    location: 'Pune, Maharashtra',
    certification: 'AWBI Recognized'
  },
  {
    id: 'ngo-5',
    name: 'Teach India Trust',
    username: 'teachindia',
    mission: 'Empowering children with quality education, digital literacy labs, and free learning supplies.',
    category: 'Education',
    avatar: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=120&auto=format&fit=crop&q=80',
    verified: true,
    followersCount: 3100,
    location: 'New Delhi, India',
    certification: 'CSR-1 & 80G Certified'
  }
];

const SearchPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const selectedCategory = searchParams.get('category') || 'All';

  const [activeTab, setActiveTab] = useState<'ngos' | 'posts'>('ngos');
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({
    'ngo-1': true,
    'ngo-2': false,
    'ngo-3': false,
    'ngo-4': true,
    'ngo-5': false
  });
  const [hoveredFollowId, setHoveredFollowId] = useState<string | null>(null);

  const [dbPosts, setDbPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchResults();
  }, [query, selectedCategory]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      let postsQuery = supabase
        .from('posts')
        .select('*, author:profiles(id, full_name, avatar_url, role)')
        .order('created_at', { ascending: false });

      if (query.trim()) {
        postsQuery = postsQuery.ilike('content', `%${query.trim()}%`);
      }
      const { data: postsData } = await postsQuery.limit(10);
      setDbPosts(postsData || []);
    } catch (err) {
      console.error('Error fetching search results:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (cat: string) => {
    const nextParams = new URLSearchParams(searchParams);
    if (cat === 'All') {
      nextParams.delete('category');
    } else {
      nextParams.set('category', cat);
    }
    setSearchParams(nextParams);
  };

  // Follow button handler (fully interactive)
  const handleToggleFollow = async (ngoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const isCurrentlyFollowing = !!followingMap[ngoId];
    setFollowingMap(prev => ({
      ...prev,
      [ngoId]: !isCurrentlyFollowing
    }));

    if (user?.id) {
      try {
        if (isCurrentlyFollowing) {
          await supabase
            .from('follows')
            .delete()
            .eq('follower_id', user.id)
            .eq('following_id', ngoId);
        } else {
          await supabase
            .from('follows')
            .upsert({
              follower_id: user.id,
              following_id: ngoId
            });
        }
      } catch (err) {
        console.error('Follow sync error:', err);
      }
    }
  };

  const filteredNGOs = DEMO_NGOS.filter(ngo => {
    const matchesCat = selectedCategory === 'All' || ngo.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesQuery = !query.trim() || 
      ngo.name.toLowerCase().includes(query.toLowerCase()) || 
      ngo.mission.toLowerCase().includes(query.toLowerCase()) ||
      ngo.username.toLowerCase().includes(query.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="twitter-search-container" style={{ width: '100%', maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Search Header Card */}
      <div style={{
        backgroundColor: 'var(--color-card)',
        border: '1.5px solid var(--border-color)',
        borderRadius: '24px',
        padding: '1.25rem 1.5rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-text-main)', margin: 0 }}>
              {query ? `Search: "${query}"` : 'Explore NGOs'}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>
              Verified non-profit organizations and impact posts
            </p>
          </div>
          {query && (
            <button 
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                next.delete('q');
                setSearchParams(next);
              }}
              style={{
                background: 'var(--color-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '0.35rem 0.8rem',
                fontSize: '0.8rem',
                cursor: 'pointer',
                color: 'var(--color-text-muted)',
                fontWeight: 500
              }}
            >
              Clear &times;
            </button>
          )}
        </div>

        {/* Category Filter Chips */}
        <div style={{ display: 'flex', gap: '0.45rem', overflowX: 'auto', paddingBottom: '0.35rem', scrollbarWidth: 'none' }}>
          {NGO_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`filter-chip ${selectedCategory.toLowerCase() === cat.toLowerCase() ? 'active' : ''}`}
              style={{ whiteSpace: 'nowrap', fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Twitter-style Tabs */}
      <div style={{
        display: 'flex',
        backgroundColor: 'var(--color-card)',
        borderRadius: '18px',
        border: '1.5px solid var(--border-color)',
        overflow: 'hidden'
      }}>
        <button 
          type="button"
          onClick={() => setActiveTab('ngos')}
          style={{
            flex: 1,
            padding: '0.75rem',
            background: 'none',
            border: 'none',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            textAlign: 'center',
            borderBottom: activeTab === 'ngos' ? '3px solid var(--color-green)' : '3px solid transparent',
            color: activeTab === 'ngos' ? 'var(--color-green)' : 'var(--color-text-muted)',
            transition: 'all 0.15s ease'
          }}
        >
          NGOs & Accounts ({filteredNGOs.length})
        </button>
        <button 
          type="button"
          onClick={() => setActiveTab('posts')}
          style={{
            flex: 1,
            padding: '0.75rem',
            background: 'none',
            border: 'none',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            textAlign: 'center',
            borderBottom: activeTab === 'posts' ? '3px solid var(--color-green)' : '3px solid transparent',
            color: activeTab === 'posts' ? 'var(--color-green)' : 'var(--color-text-muted)',
            transition: 'all 0.15s ease'
          }}
        >
          Posts & Media ({dbPosts.length})
        </button>
      </div>

      {/* Search Results in Center (Twitter UI) */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
          Searching community updates and verified NGOs...
        </div>
      ) : activeTab === 'ngos' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {filteredNGOs.length === 0 ? (
            <div className="noti-wireframe-card empty-state">
              <p>No NGOs found matching "{query}". Try clearing the search or choosing another category.</p>
            </div>
          ) : (
            filteredNGOs.map(ngo => {
              const isFollowing = !!followingMap[ngo.id];
              const isHovered = hoveredFollowId === ngo.id;

              return (
                <div 
                  key={ngo.id}
                  className="twitter-account-card"
                  style={{
                    backgroundColor: 'var(--color-card)',
                    border: '1.5px solid var(--border-color)',
                    borderRadius: '22px',
                    padding: '1.25rem 1.5rem',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* Top Row: Avatar + Name + Verified Badge + Category + Follow Button */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                      <Link to={`/profile/${ngo.id}`} style={{ textDecoration: 'none' }}>
                        <img 
                          src={ngo.avatar} 
                          alt={ngo.name} 
                          style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '2px solid var(--color-white)',
                            boxShadow: 'var(--shadow-sm)'
                          }} 
                        />
                      </Link>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexWrap: 'wrap' }}>
                          <Link 
                            to={`/profile/${ngo.id}`} 
                            style={{
                              fontWeight: 700,
                              fontSize: '1.05rem',
                              color: 'var(--color-text-main)',
                              textDecoration: 'none'
                            }}
                          >
                            {ngo.name}
                          </Link>
                          {ngo.verified && <VerifiedBadge size={19} />}
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.15rem' }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                            @{ngo.username}
                          </span>
                          <span className="noti-badge">
                            {ngo.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Twitter-Style Follow / Following Button */}
                    <button 
                      type="button"
                      onClick={(e) => handleToggleFollow(ngo.id, e)}
                      onMouseEnter={() => setHoveredFollowId(ngo.id)}
                      onMouseLeave={() => setHoveredFollowId(null)}
                      style={{
                        padding: '0.5rem 1.35rem',
                        fontSize: '0.88rem',
                        fontWeight: 700,
                        borderRadius: '24px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        border: isFollowing 
                          ? (isHovered ? '1.5px solid #ef4444' : '1.5px solid var(--border-color)')
                          : '1.5px solid var(--color-text-main)',
                        backgroundColor: isFollowing 
                          ? (isHovered ? '#fef2f2' : 'transparent')
                          : 'var(--color-text-main)',
                        color: isFollowing 
                          ? (isHovered ? '#ef4444' : 'var(--color-text-main)')
                          : 'var(--color-white)',
                        minWidth: '105px',
                        textAlign: 'center'
                      }}
                    >
                      {isFollowing 
                        ? (isHovered ? 'Unfollow' : 'Following') 
                        : 'Follow'}
                    </button>
                  </div>

                  {/* Mission Statement */}
                  <p style={{ fontSize: '0.92rem', color: '#334155', lineHeight: 1.45, margin: 0 }}>
                    {ngo.mission}
                  </p>

                  {/* Footer Meta Row: Location + Certification + Profile link */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid var(--border-color)',
                    paddingTop: '0.65rem',
                    fontSize: '0.8rem',
                    color: 'var(--color-text-muted)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <span>📍 {ngo.location}</span>
                      <span>&bull;</span>
                      <span style={{ color: 'var(--color-green)', fontWeight: 600 }}>
                        🛡️ {ngo.certification}
                      </span>
                      <span>&bull;</span>
                      <span>{ngo.followersCount + (isFollowing ? 1 : 0)} followers</span>
                    </div>

                    <Link 
                      to={`/profile/${ngo.id}`}
                      style={{
                        color: 'var(--color-green)',
                        textDecoration: 'none',
                        fontWeight: 600,
                        fontSize: '0.82rem'
                      }}
                    >
                      View Profile &rarr;
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Posts Tab */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {dbPosts.length === 0 ? (
            <div className="noti-wireframe-card empty-state">
              <p>No posts found. Start by sharing an update from the home feed!</p>
            </div>
          ) : (
            dbPosts.map(post => (
              <div key={post.id} className="post-card" style={{ borderRadius: '22px', border: '1.5px solid var(--border-color)' }}>
                <div className="post-header" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="post-avatar">
                    {post.author?.avatar_url ? (
                      <img src={post.author.avatar_url} alt="author" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--color-green)' }}>
                        {post.author?.full_name?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="post-meta">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span className="post-author">{post.author?.full_name || 'Community Member'}</span>
                      {post.author?.role === 'ngo' && <VerifiedBadge size={16} />}
                    </div>
                    <span className="post-time">{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="post-content" style={{ marginTop: '0.5rem' }}>
                  <p>{post.content}</p>
                </div>
                {post.media_urls && post.media_urls.length > 0 && (
                  <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)', marginBottom: '0.75rem' }}>
                    <img src={post.media_urls[0]} alt="media" style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', display: 'block' }} />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPage;

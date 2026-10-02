import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabase';
import VerifiedBadge from '../components/VerifiedBadge';

interface VolunteeringItem {
  id: string;
  title: string;
  ngoName: string;
  date: string;
  description: string;
}

interface ImpactStats {
  hours: number;
  drives: number;
  impactScore: number;
}

const DEFAULT_VOLUNTEERING: VolunteeringItem[] = [
  {
    id: 'v1',
    title: 'Beach Cleanup & Plastic Segregation',
    ngoName: 'EcoWarriors India',
    date: 'February 2026',
    description: 'Helped collect and classify over 250kg of ocean plastics along the coastal zone.'
  },
  {
    id: 'v2',
    title: 'Weekend Food Drive Volunteer',
    ngoName: 'Robin Hood Army',
    date: 'January 2026',
    description: 'Distributed 150+ packed nutritious meals to shelter homes in the district.'
  }
];

const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const { user: authUser } = useAuth();

  const isOwnProfile = !id || id === authUser?.id;
  const profileId = id || authUser?.id;

  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isHoveredFollow, setIsHoveredFollow] = useState(false);

  const [profileData, setProfileData] = useState<any>({
    full_name: authUser?.name || 'Community Member',
    username: authUser?.email?.split('@')[0] || 'user',
    role: authUser?.role || 'supporter',
    avatar_url: '',
    bio: 'Passionate about giving back to nature, supporting local NGOs, and volunteering.',
    location: 'Mumbai, India',
    contact_email: authUser?.email || '',
    isVerifiedNgo: true
  });

  const [impactStats, setImpactStats] = useState<ImpactStats>({
    hours: 38,
    drives: 12,
    impactScore: 450
  });

  const [volunteeringList, setVolunteeringList] = useState<VolunteeringItem[]>(DEFAULT_VOLUNTEERING);
  const [contributions, setContributions] = useState<any[]>([]);

  // Modals / forms
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: '', bio: '', location: '', avatar_url: '' });

  const [showAddVolunteering, setShowAddVolunteering] = useState(false);
  const [volForm, setVolForm] = useState({ title: '', ngoName: '', date: '', description: '' });

  const [showAddMedia, setShowAddMedia] = useState(false);
  const [mediaForm, setMediaForm] = useState({ content: '', mediaUrl: '', mediaType: 'image' });
  const [uploading, setUploading] = useState(false);

const KNOWN_NGOS: Record<string, any> = {
  'ngo-1': {
    id: 'ngo-1',
    full_name: 'EcoWarriors India',
    username: 'ecowarriors',
    role: 'ngo',
    avatar_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=120&auto=format&fit=crop&q=80',
    bio: 'Reclaiming urban forests and lake ecosystems across metropolitan zones with community mangrove drives and scrap recycling.',
    location: 'Mumbai, Maharashtra',
    contact_email: 'volunteer@ecowarriors.org',
    isVerifiedNgo: true,
    impactStats: {
      hours: 1240,
      drives: 48,
      impactScore: 2850
    },
    volunteering: [
      {
        id: 'v-ngo-1',
        title: 'Mahim Nature Park Mangrove Afforestation',
        ngoName: 'EcoWarriors India',
        date: 'March 2026',
        description: 'Planted 400 mangrove saplings and collected 550kg of coastal plastic debris.'
      },
      {
        id: 'v-ngo-2',
        title: 'Mithi River Desiltation Drive',
        ngoName: 'EcoWarriors India',
        date: 'February 2026',
        description: 'Mobilized 80 college volunteers to clear 2 tons of solid waste before monsoon.'
      }
    ],
    contributions: [
      {
        id: 'c-ngo-1',
        content: '🌱 Mega Mangrove Restoration & Cleanup Drive at Mahim Nature Creek! Over 18 volunteers joined us this weekend.',
        media_urls: ['https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80'],
        created_at: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        id: 'c-ngo-2',
        content: '♻️ Recycled 850kg of residential dry scrap collected from housing societies in Bandra.',
        media_urls: ['https://images.unsplash.com/photo-1532629345422-7515f3d16bb0?w=800&auto=format&fit=crop&q=80'],
        created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString()
      }
    ]
  },
  'ngo-2': {
    id: 'ngo-2',
    full_name: 'Robin Hood Army',
    username: 'robinhoodarmy',
    role: 'ngo',
    avatar_url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=120&auto=format&fit=crop&q=80',
    bio: 'Zero-funds volunteer organization serving surplus food to underprivileged communities across 180+ cities.',
    location: 'Pan-India',
    contact_email: 'info@robinhoodarmy.com',
    isVerifiedNgo: true,
    impactStats: {
      hours: 8900,
      drives: 320,
      impactScore: 14500
    },
    volunteering: [
      {
        id: 'v-rha-1',
        title: 'Night Food Rescue Drive',
        ngoName: 'Robin Hood Army',
        date: 'March 2026',
        description: 'Redistributed 1,500 surplus banquet meals to night shelter homes.'
      }
    ],
    contributions: [
      {
        id: 'c-rha-1',
        content: '🍲 Hunger has no curfew. Our Green Brigade vehicles served 1,500 fresh meals tonight!',
        media_urls: ['https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&auto=format&fit=crop&q=80'],
        created_at: new Date(Date.now() - 3600000 * 6).toISOString()
      }
    ]
  },
  'ngo-3': {
    id: 'ngo-3',
    full_name: 'Akshaya Patra Foundation',
    username: 'akshayapatra',
    role: 'ngo',
    avatar_url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=120&auto=format&fit=crop&q=80',
    bio: 'Striving to eliminate classroom hunger through nutritional mid-day meal programs across schools.',
    location: 'Bengaluru, India',
    contact_email: 'contact@akshayapatra.org',
    isVerifiedNgo: true,
    impactStats: {
      hours: 15400,
      drives: 520,
      impactScore: 28900
    },
    volunteering: [
      {
        id: 'v-ap-1',
        title: 'Mid-Day Nutrition Dispatch',
        ngoName: 'Akshaya Patra Foundation',
        date: 'March 2026',
        description: 'Automated packing and hygienic temperature checks for 10,000 mid-day meals.'
      }
    ],
    contributions: [
      {
        id: 'c-ap-1',
        content: '🍎 Hot Mid-Day Meals served to 10,000 Government School Students across the district.',
        media_urls: ['https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&auto=format&fit=crop&q=80'],
        created_at: new Date(Date.now() - 3600000 * 12).toISOString()
      }
    ]
  },
  'ngo-4': {
    id: 'ngo-4',
    full_name: 'Save The Stray Animals',
    username: 'strayrescue',
    role: 'ngo',
    avatar_url: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=120&auto=format&fit=crop&q=80',
    bio: 'Emergency medical aid, rescue drives and permanent shelter for injured and abandoned animals.',
    location: 'Pune, Maharashtra',
    contact_email: 'rescue@strays.org',
    isVerifiedNgo: true,
    impactStats: {
      hours: 1850,
      drives: 64,
      impactScore: 3400
    },
    volunteering: [
      {
        id: 'v-stray-1',
        title: 'Street Dog Vaccination & Treatment Drive',
        ngoName: 'Save The Stray Animals',
        date: 'March 2026',
        description: 'Administered anti-rabies vaccines to 120 stray dogs in Shivaji Nagar.'
      }
    ],
    contributions: [
      {
        id: 'c-stray-1',
        content: '🐕 4 injured puppies rescued from highway construction site and admitted to our recovery clinic.',
        media_urls: ['https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=800&auto=format&fit=crop&q=80'],
        created_at: new Date(Date.now() - 3600000 * 20).toISOString()
      }
    ]
  },
  'ngo-5': {
    id: 'ngo-5',
    full_name: 'Teach India Trust',
    username: 'teachindia',
    role: 'ngo',
    avatar_url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=120&auto=format&fit=crop&q=80',
    bio: 'Empowering children with quality education, digital literacy labs, and free learning supplies.',
    location: 'New Delhi, India',
    contact_email: 'support@teachindia.org',
    isVerifiedNgo: true,
    impactStats: {
      hours: 4200,
      drives: 110,
      impactScore: 8200
    },
    volunteering: [
      {
        id: 'v-teach-1',
        title: 'Weekend Digital Literacy Workshop',
        ngoName: 'Teach India Trust',
        date: 'March 2026',
        description: 'Taught basic computer literacy and coding fundamentals to 65 slum youth.'
      }
    ],
    contributions: [
      {
        id: 'c-teach-1',
        content: '📚 Distributed 500 STEM kits and refurbished laptops to municipal school libraries.',
        media_urls: ['https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80'],
        created_at: new Date(Date.now() - 3600000 * 30).toISOString()
      }
    ]
  }
};

  useEffect(() => {
    loadProfileAndContributions();
  }, [profileId]);

  const loadProfileAndContributions = async () => {
    setLoading(true);
    try {
      // 1. Check if profileId matches a known NGO
      if (profileId && KNOWN_NGOS[profileId]) {
        const ngo = KNOWN_NGOS[profileId];
        setProfileData({
          full_name: ngo.full_name,
          username: ngo.username,
          role: ngo.role,
          avatar_url: ngo.avatar_url,
          bio: ngo.bio,
          location: ngo.location,
          contact_email: ngo.contact_email,
          isVerifiedNgo: true
        });
        setImpactStats(ngo.impactStats);
        setVolunteeringList(ngo.volunteering);
        setContributions(ngo.contributions);
        setIsFollowing(true);
        setLoading(false);
        return;
      }

      // 2. Otherwise check Supabase if it's a valid UUID
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(profileId || '');
      if (profileId && isUuid) {
        const { data: pData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', profileId)
          .maybeSingle();

        if (pData) {
          setProfileData((prev: any) => ({
            ...prev,
            ...pData,
            bio: pData.bio || prev.bio,
            location: pData.location || prev.location
          }));
          setEditForm({
            full_name: pData.full_name || '',
            bio: pData.bio || '',
            location: pData.location || 'Mumbai, India',
            avatar_url: pData.avatar_url || ''
          });
        }

        const { data: postData } = await supabase
          .from('posts')
          .select('*, author:profiles(id, full_name, avatar_url, role)')
          .eq('author_id', profileId)
          .order('created_at', { ascending: false });

        if (postData && postData.length > 0) {
          setContributions(postData);
        } else if (isOwnProfile) {
          setContributions([
            {
              id: 'init-1',
              content: 'Just joined GOODWORK! Excited to contribute to sustainability and volunteer drives.',
              media_urls: ['https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80'],
              created_at: new Date().toISOString()
            }
          ]);
        }
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser?.id) return;
    try {
      const updates = {
        full_name: editForm.full_name,
        bio: editForm.bio,
        location: editForm.location,
        avatar_url: editForm.avatar_url,
        updated_at: new Date().toISOString()
      };

      await supabase
        .from('profiles')
        .update(updates)
        .eq('id', authUser.id);

      setProfileData((prev: any) => ({ ...prev, ...updates }));
      setShowEditProfile(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  const handleAddVolunteering = (e: React.FormEvent) => {
    e.preventDefault();
    if (!volForm.title || !volForm.ngoName) return;
    const newItem: VolunteeringItem = {
      id: Date.now().toString(),
      title: volForm.title,
      ngoName: volForm.ngoName,
      date: volForm.date || 'Recent',
      description: volForm.description
    };
    setVolunteeringList([newItem, ...volunteeringList]);
    setImpactStats(prev => ({
      ...prev,
      hours: prev.hours + 4,
      drives: prev.drives + 1,
      impactScore: prev.impactScore + 50
    }));
    setShowAddVolunteering(false);
    setVolForm({ title: '', ngoName: '', date: '', description: '' });
  };

  const handleAddContribution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaForm.content.trim() && !mediaForm.mediaUrl.trim()) return;
    if (!authUser?.id) return;

    setUploading(true);
    try {
      const mediaList = mediaForm.mediaUrl.trim() ? [mediaForm.mediaUrl.trim()] : [];
      
      const { data, error } = await supabase
        .from('posts')
        .insert({
          author_id: authUser.id,
          content: mediaForm.content,
          media_urls: mediaList,
          type: 'general'
        })
        .select('*, author:profiles(id, full_name, avatar_url, role)')
        .single();

      if (!error && data) {
        setContributions([data, ...contributions]);
      } else {
        // Fallback local addition
        const localPost = {
          id: Date.now().toString(),
          author_id: authUser.id,
          content: mediaForm.content,
          media_urls: mediaList,
          created_at: new Date().toISOString(),
          author: {
            full_name: profileData.full_name,
            avatar_url: profileData.avatar_url,
            role: profileData.role
          }
        };
        setContributions([localPost, ...contributions]);
      }

      setImpactStats(prev => ({
        ...prev,
        impactScore: prev.impactScore + 25
      }));
      setShowAddMedia(false);
      setMediaForm({ content: '', mediaUrl: '', mediaType: 'image' });
    } catch (err) {
      console.error('Error adding contribution:', err);
    } finally {
      setUploading(false);
    }
  };

  const isNgo = profileData.role === 'ngo';

  return (
    <div className="profile-page-container" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Header with Avatar matching Wireframe 'O' */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'var(--color-card)',
        border: '1.5px solid var(--border-color)',
        borderRadius: '24px',
        padding: '1.5rem 2rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {/* Wireframe Circular Avatar */}
          <div style={{
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-bg)',
            border: '3px solid var(--color-green)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            boxShadow: '0 4px 10px rgba(0,0,0,0.06)'
          }}>
            {profileData.avatar_url ? (
              <img src={profileData.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-green)' }}>
                {profileData.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            )}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-text-main)', margin: 0 }}>
                {profileData.full_name}
              </h1>
              {isNgo && <VerifiedBadge size={22} />}
              <span className="noti-badge">
                {isNgo ? 'Official NGO' : 'Active Supporter'}
              </span>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
              @{profileData.username || 'member'} &bull; {profileData.location}
            </p>
          </div>
        </div>

        <div>
          {isOwnProfile ? (
            <button 
              onClick={() => {
                setEditForm({
                  full_name: profileData.full_name || '',
                  bio: profileData.bio || '',
                  location: profileData.location || '',
                  avatar_url: profileData.avatar_url || ''
                });
                setShowEditProfile(true);
              }}
              className="noti-following-btn outline"
              style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem' }}
            >
              Edit Profile
            </button>
          ) : (
            <button 
              type="button"
              onClick={async () => {
                const next = !isFollowing;
                setIsFollowing(next);
                if (authUser?.id && profileId) {
                  try {
                    if (!next) {
                      await supabase.from('follows').delete().eq('follower_id', authUser.id).eq('following_id', profileId);
                    } else {
                      await supabase.from('follows').upsert({ follower_id: authUser.id, following_id: profileId });
                    }
                  } catch (err) {
                    console.error('Follow error:', err);
                  }
                }
              }}
              onMouseEnter={() => setIsHoveredFollow(true)}
              onMouseLeave={() => setIsHoveredFollow(false)}
              style={{
                padding: '0.6rem 2rem',
                fontSize: '0.9rem',
                fontWeight: 700,
                borderRadius: '24px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                border: isFollowing 
                  ? (isHoveredFollow ? '1.5px solid #ef4444' : '1.5px solid var(--border-color)')
                  : '1.5px solid var(--color-text-main)',
                backgroundColor: isFollowing 
                  ? (isHoveredFollow ? '#fef2f2' : 'transparent')
                  : 'var(--color-text-main)',
                color: isFollowing 
                  ? (isHoveredFollow ? '#ef4444' : 'var(--color-text-main)')
                  : 'var(--color-white)',
                minWidth: '120px',
                textAlign: 'center'
              }}
            >
              {isFollowing ? (isHoveredFollow ? 'Unfollow' : 'Following') : 'Follow'}
            </button>
          )}
        </div>
      </div>

      {/* Main 3-Section Wireframe Grid:
          [Personal Info] | [My Impact + Volunteering History] | [Contributions]
      */}
      <div className="profile-wireframe-grid">
        
        {/* ========================================================
            CARD 1: PERSONAL INFO (Left)
            ======================================================== */}
        <div className="wireframe-card personal-info-card">
          <div className="card-header-row">
            <h3 className="wireframe-card-title">personal info</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
            <div>
              <span className="field-label">About / Bio</span>
              <p className="field-value" style={{ lineHeight: 1.5 }}>
                {profileData.bio || 'No bio added yet.'}
              </p>
            </div>

            <div>
              <span className="field-label">Role</span>
              <p className="field-value" style={{ textTransform: 'capitalize' }}>
                {profileData.role === 'ngo' ? 'Registered Non-Governmental Organization' : 'Community Volunteer & Contributor'}
              </p>
            </div>

            {/* Official NGO Verification & Certification Card */}
            {isNgo && (
              <div style={{
                backgroundColor: 'var(--color-bg)',
                border: '1.5px solid var(--border-color)',
                borderRadius: '16px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                marginTop: '0.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <VerifiedBadge size={18} />
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-text-main)' }}>
                      Govt & NGO Verification
                    </span>
                  </div>
                  <span style={{ fontSize: '0.7rem', backgroundColor: 'var(--color-green-subtle)', color: 'var(--color-green)', padding: '0.15rem 0.5rem', borderRadius: '6px', fontWeight: 600 }}>
                    Certified
                  </span>
                </div>

                <div style={{ fontSize: '0.78rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>80G Tax Exemption:</span>
                    <strong style={{ color: 'var(--color-green)' }}>Verified ✓</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>12A Registration:</span>
                    <strong style={{ color: 'var(--color-green)' }}>Active ✓</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>NITI Aayog Darpan:</span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>DL/2023/0481</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>FCRA Compliance:</span>
                    <strong style={{ color: 'var(--color-green)' }}>Approved ✓</strong>
                  </div>
                </div>
              </div>
            )}

            <div>
              <span className="field-label">Location</span>
              <p className="field-value">{profileData.location || 'India'}</p>
            </div>

            <div>
              <span className="field-label">Contact</span>
              <p className="field-value">{profileData.contact_email || authUser?.email || 'Registered on Supabase'}</p>
            </div>
          </div>
        </div>

        {/* ========================================================
            MIDDLE COLUMN: MY IMPACT (Top) + VOLUNTEERING HISTORY (Bottom)
            ======================================================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* CARD 2: MY IMPACT */}
          <div className="wireframe-card my-impact-card">
            <div className="card-header-row">
              <h3 className="wireframe-card-title">{isNgo ? 'organization impact' : 'my impact'}</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-green)', fontWeight: 600 }}>
                Verified Activity
              </span>
            </div>

            <div className="impact-stats-grid">
              <div className="impact-stat-box">
                <span className="impact-number">{impactStats.hours}h</span>
                <span className="impact-label">Hours Volunteered</span>
              </div>
              <div className="impact-stat-box">
                <span className="impact-number">{impactStats.drives}</span>
                <span className="impact-label">{isNgo ? 'Projects Led' : 'Drives Joined'}</span>
              </div>
              <div className="impact-stat-box">
                <span className="impact-number">{impactStats.impactScore}</span>
                <span className="impact-label">Impact Points</span>
              </div>
            </div>
          </div>

          {/* CARD 3: VOLUNTEERING HISTORY */}
          <div className="wireframe-card volunteering-card">
            <div className="card-header-row">
              <h3 className="wireframe-card-title">
                {isNgo ? 'past projects & drives' : 'volunteering history'}
              </h3>
              {isOwnProfile && (
                <button 
                  onClick={() => setShowAddVolunteering(true)}
                  style={{
                    background: 'none',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '0.3rem 0.75rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    color: 'var(--color-green)'
                  }}
                >
                  + Add Experience
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.5rem' }}>
              {volunteeringList.map(item => (
                <div key={item.id} className="volunteering-item-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text-main)' }}>
                      {item.title}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                      {item.date}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-green)', fontWeight: 500 }}>
                    {item.ngoName}
                  </span>
                  <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.25rem', lineHeight: 1.4 }}>
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================
            CARD 4: CONTRIBUTIONS (Right)
            Uploaded photos, videos & descriptions visible to all users
            ======================================================== */}
        <div className="wireframe-card contributions-card">
          <div className="card-header-row">
            <h3 className="wireframe-card-title">contributions</h3>
            {isOwnProfile && (
              <button 
                onClick={() => setShowAddMedia(true)}
                style={{
                  backgroundColor: 'var(--color-text-main)',
                  color: 'var(--color-white)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                + Add Media
              </button>
            )}
          </div>

          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
            Photos, videos and impact posts shared by {profileData.full_name}.
          </p>

          <div className="contributions-gallery">
            {contributions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                No contributions uploaded yet. Click "+ Add Media" to upload photos or videos!
              </div>
            ) : (
              contributions.map(post => (
                <div key={post.id} className="contribution-media-item">
                  {/* Photo or Video Display */}
                  {post.media_urls && post.media_urls.length > 0 ? (
                    post.media_urls[0].endsWith('.mp4') || post.media_urls[0].includes('video') ? (
                      <video 
                        src={post.media_urls[0]} 
                        controls 
                        className="contribution-thumb" 
                      />
                    ) : (
                      <img 
                        src={post.media_urls[0]} 
                        alt="contribution" 
                        className="contribution-thumb" 
                      />
                    )
                  ) : (
                    <div className="contribution-text-placeholder">
                      <span>Post Note</span>
                    </div>
                  )}

                  {/* Description / Text */}
                  <div className="contribution-caption">
                    <p style={{ fontSize: '0.88rem', color: 'var(--color-text-main)', lineHeight: 1.4 }}>
                      {post.content}
                    </p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.35rem', display: 'block' }}>
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* ========================================================
          MODAL: EDIT PROFILE
          ======================================================== */}
      {showEditProfile && (
        <div className="modal-backdrop" onClick={() => setShowEditProfile(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Edit Personal Info</h3>
            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="field-label">Full Name</label>
                <input 
                  type="text" 
                  className="auth-input"
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="field-label">Avatar Photo URL</label>
                <input 
                  type="url" 
                  placeholder="https://example.com/avatar.jpg"
                  className="auth-input"
                  value={editForm.avatar_url}
                  onChange={(e) => setEditForm({ ...editForm, avatar_url: e.target.value })}
                />
              </div>
              <div>
                <label className="field-label">Location</label>
                <input 
                  type="text" 
                  className="auth-input"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                />
              </div>
              <div>
                <label className="field-label">About / Bio</label>
                <textarea 
                  rows={4}
                  className="auth-input"
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="noti-following-btn active" style={{ flex: 1 }}>Save Changes</button>
                <button type="button" onClick={() => setShowEditProfile(false)} className="noti-following-btn outline" style={{ flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: ADD VOLUNTEERING EXPERIENCE
          ======================================================== */}
      {showAddVolunteering && (
        <div className="modal-backdrop" onClick={() => setShowAddVolunteering(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Add Volunteering Record</h3>
            <form onSubmit={handleAddVolunteering} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="field-label">Activity / Drive Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Tree Plantation Drive"
                  className="auth-input"
                  value={volForm.title}
                  onChange={(e) => setVolForm({ ...volForm, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="field-label">NGO / Organization Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Green Earth Trust"
                  className="auth-input"
                  value={volForm.ngoName}
                  onChange={(e) => setVolForm({ ...volForm, ngoName: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="field-label">Date or Month</label>
                <input 
                  type="text" 
                  placeholder="e.g. March 2026"
                  className="auth-input"
                  value={volForm.date}
                  onChange={(e) => setVolForm({ ...volForm, date: e.target.value })}
                />
              </div>
              <div>
                <label className="field-label">What did you do?</label>
                <textarea 
                  rows={3}
                  placeholder="Describe your role, impact, or tasks..."
                  className="auth-input"
                  value={volForm.description}
                  onChange={(e) => setVolForm({ ...volForm, description: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="noti-following-btn active" style={{ flex: 1 }}>Add to History</button>
                <button type="button" onClick={() => setShowAddVolunteering(false)} className="noti-following-btn outline" style={{ flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: ADD MEDIA & CONTRIBUTION
          ======================================================== */}
      {showAddMedia && (
        <div className="modal-backdrop" onClick={() => setShowAddMedia(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>Upload Photo, Video & Description</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
              This will be added to your profile contributions and posted live to the main feed!
            </p>
            <form onSubmit={handleAddContribution} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="field-label">Photo or Video URL</label>
                <input 
                  type="url" 
                  placeholder="Paste direct image (.jpg, .png) or video (.mp4) link"
                  className="auth-input"
                  value={mediaForm.mediaUrl}
                  onChange={(e) => setMediaForm({ ...mediaForm, mediaUrl: e.target.value })}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', display: 'block' }}>
                  Tip: You can paste an image link from Unsplash, Imgur, or direct URL.
                </span>
              </div>
              <div>
                <label className="field-label">Description / Story</label>
                <textarea 
                  rows={4}
                  placeholder="Describe the photo/video, what happened, who you helped..."
                  className="auth-input"
                  value={mediaForm.content}
                  onChange={(e) => setMediaForm({ ...mediaForm, content: e.target.value })}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" disabled={uploading} className="noti-following-btn active" style={{ flex: 1 }}>
                  {uploading ? 'Publishing...' : 'Publish Contribution'}
                </button>
                <button type="button" onClick={() => setShowAddMedia(false)} className="noti-following-btn outline" style={{ flex: 1 }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProfilePage;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import VerifiedBadge from './VerifiedBadge';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabase';

export interface NgoPostData {
  id: string;
  category: string;
  upcoming: string;
  ngoName: string;
  ngoUsername?: string;
  ngoAvatar?: string;
  ngoId?: string;
  isVerified?: boolean;
  isFollowing?: boolean;
  headline: string;
  moneyNeed?: {
    raised: number;
    goal: number;
  };
  volunteersNeed?: {
    enrolled: number;
    required: number;
  };
  description: string;
  mediaUrls?: string[];
  liveStatus: string;
  likesCount: number;
  isLiked?: boolean;
  repostsCount?: number;
  isReposted?: boolean;
  isRegistered?: boolean;
  suggestions?: {
    id: string;
    authorName: string;
    text: string;
    time: string;
  }[];
  createdAt?: string;
}

interface NgoPostCardProps {
  post: NgoPostData;
  onUpdate?: (updatedPost: NgoPostData) => void;
}

export const NgoPostCard: React.FC<NgoPostCardProps> = ({ post, onUpdate }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Interactive states
  const [isFollowing, setIsFollowing] = useState(post.isFollowing || false);
  const [isHoveredFollow, setIsHoveredFollow] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [isReposted, setIsReposted] = useState(post.isReposted || false);
  const [repostsCount, setRepostsCount] = useState(post.repostsCount || 4);
  const [isRegistered, setIsRegistered] = useState(post.isRegistered || false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionInput, setSuggestionInput] = useState('');
  const [suggestionsList, setSuggestionsList] = useState(post.suggestions || []);
  const [copiedToast, setCopiedToast] = useState(false);
  const [showMediaLightbox, setShowMediaLightbox] = useState(false);

  // Toggle Follow
  const handleToggleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !isFollowing;
    setIsFollowing(next);
    if (user?.id && post.ngoId) {
      try {
        if (!next) {
          await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', post.ngoId);
        } else {
          await supabase.from('follows').upsert({ follower_id: user.id, following_id: post.ngoId });
        }
      } catch (err) {
        console.error('Follow sync error:', err);
      }
    }
  };

  // Toggle Like
  const handleToggleLike = () => {
    const next = !isLiked;
    setIsLiked(next);
    setLikesCount(prev => next ? prev + 1 : Math.max(0, prev - 1));
  };

  // Toggle Repost
  const handleToggleRepost = () => {
    const next = !isReposted;
    setIsReposted(next);
    setRepostsCount(prev => next ? prev + 1 : Math.max(0, prev - 1));
  };

  // Handle Volunteer Registration
  const handleRegisterConfirm = () => {
    setIsRegistered(true);
    setShowRegisterModal(false);
  };

  // Add Community Suggestion
  const handleAddSuggestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestionInput.trim()) return;
    const newSug = {
      id: Date.now().toString(),
      authorName: user?.name || 'Community Member',
      text: suggestionInput.trim(),
      time: 'Just now'
    };
    setSuggestionsList([...suggestionsList, newSug]);
    setSuggestionInput('');
  };

  // Share Link
  const handleShare = () => {
    const url = window.location.origin + `/profile/${post.ngoId || ''}`;
    navigator.clipboard?.writeText(url);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  const hasMedia = post.mediaUrls && post.mediaUrls.length > 0 && post.mediaUrls[0];
  const isVideo = hasMedia && (post.mediaUrls![0].endsWith('.mp4') || post.mediaUrls![0].includes('video'));

  // Calculate Funding %
  const fundingPercent = post.moneyNeed && post.moneyNeed.goal > 0 
    ? Math.min(100, Math.round((post.moneyNeed.raised / post.moneyNeed.goal) * 100))
    : 0;

  return (
    <article className="twitter-post-card">
      
      {/* ========================================================
          ROW 1: [catagory] [upcoming]
          ======================================================== */}
      <div className="post-wireframe-tags-row">
        <button 
          type="button"
          onClick={() => navigate(`/search?category=${encodeURIComponent(post.category || '')}`)}
          className="post-wireframe-chip category-chip"
          style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
          title={`Filter by cause: ${post.category}`}
        >
          🏷️ {post.category || 'Initiative'}
        </button>
        <button 
          type="button"
          onClick={() => setShowRegisterModal(true)}
          className="post-wireframe-chip upcoming-chip"
          style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
          title="Click to view event details and register"
        >
          📅 {post.upcoming || 'Upcoming Event'}
        </button>
      </div>

      {/* ========================================================
          ROW 2: [NGO name] [Follow]
          Clicking logo or name opens NGO profile
          ======================================================== */}
      <div className="post-wireframe-ngo-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link 
            to={`/profile/${post.ngoId || ''}`} 
            style={{ textDecoration: 'none' }}
            title={`View ${post.ngoName}'s profile`}
          >
            <div className="post-ngo-avatar">
              {post.ngoAvatar ? (
                <img src={post.ngoAvatar} alt={post.ngoName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div className="avatar-monogram">
                  {post.ngoName?.charAt(0) || 'N'}
                </div>
              )}
            </div>
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Link 
                to={`/profile/${post.ngoId || ''}`} 
                className="post-ngo-name"
                title={`View ${post.ngoName}'s profile`}
              >
                {post.ngoName}
              </Link>
              {post.isVerified !== false && <VerifiedBadge size={18} />}
            </div>
            {post.ngoUsername && (
              <Link 
                to={`/profile/${post.ngoId || ''}`} 
                className="post-ngo-handle" 
                style={{ textDecoration: 'none' }}
              >
                @{post.ngoUsername}
              </Link>
            )}
          </div>
        </div>

        {/* Twitter-style Follow Button */}
        <button 
          type="button"
          onClick={handleToggleFollow}
          onMouseEnter={() => setIsHoveredFollow(true)}
          onMouseLeave={() => setIsHoveredFollow(false)}
          className={`twitter-follow-pill ${isFollowing ? 'following' : ''} ${isHoveredFollow && isFollowing ? 'unfollow-hover' : ''}`}
        >
          {isFollowing ? (isHoveredFollow ? 'Unfollow' : 'Following') : 'Follow'}
        </button>
      </div>

      {/* ========================================================
          ROW 3: [1 line description]
          ======================================================== */}
      <div className="post-wireframe-headline">
        {post.headline}
      </div>

      {/* ========================================================
          ROW 4: [money volunter need]
          ======================================================== */}
      {(post.moneyNeed || post.volunteersNeed) && (
        <div className="post-wireframe-needs-bar">
          {post.moneyNeed && (
            <div className="need-metric-item">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
                <span>💰 ₹{post.moneyNeed.raised.toLocaleString()} raised</span>
                <span style={{ color: 'var(--color-text-muted)' }}>Goal: ₹{post.moneyNeed.goal.toLocaleString()}</span>
              </div>
              <div className="need-progress-track">
                <div className="need-progress-fill" style={{ width: `${fundingPercent}%` }} />
              </div>
            </div>
          )}

          {post.volunteersNeed && (
            <div className="need-metric-item volunteers-metric">
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-green)' }}>
                👥 {post.volunteersNeed.enrolled} / {post.volunteersNeed.required} Volunteers Enrolled
              </span>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          ROW 5: [Description.. expandable]
          ======================================================== */}
      <div className="post-wireframe-expandable-desc">
        <p className={`expandable-text ${isExpanded ? 'expanded' : 'collapsed'}`}>
          {post.description}
        </p>
        {post.description && post.description.length > 130 && (
          <button 
            type="button" 
            onClick={() => setIsExpanded(!isExpanded)}
            className="expand-toggle-btn"
          >
            {isExpanded ? 'Show less ▴' : 'Show more ▾'}
          </button>
        )}
      </div>

      {/* ========================================================
          ROW 6: [Main post] (Photo / Video Embed)
          ======================================================== */}
      {hasMedia && (
        <div 
          className="post-wireframe-media-frame" 
          onClick={() => setShowMediaLightbox(true)} 
          style={{ cursor: 'pointer' }}
          title="Click to view full size"
        >
          {isVideo ? (
            <video 
              src={post.mediaUrls![0]} 
              controls 
              className="post-wireframe-media"
            />
          ) : (
            <img 
              src={post.mediaUrls![0]} 
              alt="Main post media" 
              className="post-wireframe-media"
            />
          )}
        </div>
      )}

      {/* ========================================================
          ROW 7: [Live status update]
          ======================================================== */}
      {post.liveStatus && (
        <div className="post-wireframe-live-status">
          <span className="live-status-dot" />
          <span className="live-status-text">
            <strong>Live status:</strong> {post.liveStatus}
          </span>
        </div>
      )}

      {/* ========================================================
          ROW 8: [likes suggestions register share repost by user]
          ======================================================== */}
      <div className="post-wireframe-actions-bar">
        
        {/* Likes */}
        <button 
          type="button" 
          onClick={handleToggleLike}
          className={`action-btn-twitter ${isLiked ? 'liked' : ''}`}
          title="Like"
        >
          <span className="action-icon">{isLiked ? '❤️' : '🤍'}</span>
          <span>{likesCount}</span>
        </button>

        {/* Suggestions / Comments */}
        <button 
          type="button" 
          onClick={() => setShowSuggestions(!showSuggestions)}
          className={`action-btn-twitter ${showSuggestions ? 'active' : ''}`}
          title="Community Suggestions & Feedback"
        >
          <span className="action-icon">💡</span>
          <span>Suggestions ({suggestionsList.length})</span>
        </button>

        {/* Register / Volunteer Button */}
        <button 
          type="button" 
          onClick={() => setShowRegisterModal(true)}
          className={`action-btn-twitter register-pill ${isRegistered ? 'registered' : ''}`}
          title="Register as Volunteer or Back Campaign"
        >
          <span className="action-icon">✋</span>
          <span>{isRegistered ? 'Registered ✓' : 'Register'}</span>
        </button>

        {/* Repost by user */}
        <button 
          type="button" 
          onClick={handleToggleRepost}
          className={`action-btn-twitter ${isReposted ? 'reposted' : ''}`}
          title="Repost to Community Feed"
        >
          <span className="action-icon">🔁</span>
          <span>{repostsCount}</span>
        </button>

        {/* Share */}
        <button 
          type="button" 
          onClick={handleShare}
          className="action-btn-twitter"
          title="Share Post"
        >
          <span className="action-icon">🔗</span>
          <span>{copiedToast ? 'Copied!' : 'Share'}</span>
        </button>

      </div>

      {/* ========================================================
          EXPANDABLE SUGGESTIONS / FEEDBACK DRAWER
          ======================================================== */}
      {showSuggestions && (
        <div className="post-suggestions-drawer">
          <div className="suggestions-header">
            <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Community Suggestions & Ideas</span>
          </div>

          <form onSubmit={handleAddSuggestion} className="suggestions-input-row">
            <input 
              type="text" 
              placeholder="Suggest an idea, location, or constructive feedback..."
              value={suggestionInput}
              onChange={(e) => setSuggestionInput(e.target.value)}
              className="auth-input"
              style={{ fontSize: '0.85rem', padding: '0.5rem 0.85rem' }}
            />
            <button type="submit" className="noti-following-btn active" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
              Submit
            </button>
          </form>

          <div className="suggestions-list">
            {suggestionsList.length === 0 ? (
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', textAlign: 'center', padding: '0.5rem' }}>
                No suggestions yet. Be the first to suggest something!
              </p>
            ) : (
              suggestionsList.map(s => (
                <div key={s.id} className="suggestion-bubble">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--color-text-main)' }}>{s.authorName}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{s.time}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#334155', marginTop: '0.2rem' }}>{s.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          REGISTRATION MODAL
          ======================================================== */}
      {showRegisterModal && (
        <div className="modal-backdrop" onClick={() => setShowRegisterModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Register for Initiative
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
              You are registering with <strong>{post.ngoName}</strong> for <em>"{post.headline}"</em>.
            </p>

            <div style={{
              backgroundColor: 'var(--color-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '1rem',
              marginBottom: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
              fontSize: '0.85rem'
            }}>
              <div><strong>Name:</strong> {user?.name || 'Registered Supporter'}</div>
              <div><strong>Email:</strong> {user?.email || 'user@goodwork.org'}</div>
              <div><strong>Initiative:</strong> {post.upcoming || 'Upcoming Community Drive'}</div>
              <div><strong>Status:</strong> Instant Confirmation</div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                type="button" 
                onClick={handleRegisterConfirm}
                className="noti-following-btn active"
                style={{ flex: 1 }}
              >
                Confirm Registration
              </button>
              <button 
                type="button" 
                onClick={() => setShowRegisterModal(false)}
                className="noti-following-btn outline"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MEDIA LIGHTBOX MODAL
          ======================================================== */}
      {showMediaLightbox && hasMedia && (
        <div className="modal-backdrop" onClick={() => setShowMediaLightbox(false)}>
          <div 
            style={{ maxWidth: '900px', width: '95%', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }} 
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
              <button 
                type="button" 
                onClick={() => setShowMediaLightbox(false)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: '#fff',
                  fontSize: '1.4rem',
                  cursor: 'pointer',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(4px)'
                }}
              >
                &times;
              </button>
            </div>
            {isVideo ? (
              <video 
                src={post.mediaUrls![0]} 
                controls 
                autoPlay 
                style={{ maxWidth: '100%', maxHeight: '82vh', borderRadius: '18px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }} 
              />
            ) : (
              <img 
                src={post.mediaUrls![0]} 
                alt="Full preview" 
                style={{ maxWidth: '100%', maxHeight: '82vh', borderRadius: '18px', objectFit: 'contain', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }} 
              />
            )}
          </div>
        </div>
      )}

    </article>
  );
};

export default NgoPostCard;

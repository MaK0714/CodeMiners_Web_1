import React, { useState } from 'react';
import { Outlet, Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NGO_CATEGORIES = [
  'Education', 'Healthcare', 'Food', 'Environment', 'Women', 'Children',
  'Elderly', 'Animals', 'Disability', 'Disaster Relief', 'Employment',
  'Rural Development', 'Water & Sanitation', 'Mental Health', 'Community Development'
];

const MainLayout = () => {
  const { user, signOut } = useAuth();
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestedFollows, setSuggestedFollows] = useState<Record<string, boolean>>({
    's1': false,
    's2': false
  });
  const navigate = useNavigate();
  const location = useLocation();

  const isFullWidthView = location.pathname.startsWith('/profile');

  const handleSearchFocus = () => {
    setShowSearchDropdown(true);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setShowSearchDropdown(false);
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/search');
    }
  };

  const handleCategorySelect = (category: string) => {
    setShowSearchDropdown(false);
    setSearchQuery(category);
    navigate(`/search?category=${encodeURIComponent(category)}`);
  };

  return (
    <div className="layout-container">
      {/* Persistent Navbar */}
      <header className="navbar" style={{ position: 'relative', zIndex: 100 }}>
        <div className="navbar-left">
          <Link to="/" className="logo-circle" title="Home" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e2e8f0', color: '#64748b', textDecoration: 'none' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </Link>
        </div>
        
        <div className="navbar-center">
          <form className="twitter-search-form" onSubmit={handleSearchSubmit}>
            <span className="search-icon-left">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
            <input 
              type="text" 
              placeholder="Search NGOs, causes, or drives..." 
              className="twitter-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={handleSearchFocus}
            />
            {searchQuery && (
              <button 
                type="button" 
                onClick={() => setSearchQuery('')}
                className="search-clear-btn"
                title="Clear Search"
              >
                &times;
              </button>
            )}
          </form>
          
          {/* Categories Dropdown */}
          {showSearchDropdown && (
            <div className="search-dropdown" style={{
              position: 'absolute',
              top: '120%',
              left: '1rem',
              right: '1rem',
              backgroundColor: 'var(--color-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '24px',
              padding: '1.25rem',
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              zIndex: 101
            }}>
              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Explore Causes & Sectors
                </span>
                <button 
                  type="button" 
                  onClick={() => setShowSearchDropdown(false)} 
                  style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  Close &times;
                </button>
              </div>
              {NGO_CATEGORIES.map(category => (
                <button 
                  key={category} 
                  type="button"
                  onClick={() => handleCategorySelect(category)}
                  style={{
                    backgroundColor: 'var(--color-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '16px',
                    color: 'var(--color-text-main)',
                    cursor: 'pointer',
                    padding: '0.35rem 0.85rem',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-green)';
                    e.currentTarget.style.color = 'var(--color-green)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.color = 'var(--color-text-main)';
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="navbar-right" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {user && (
            <Link 
              to="/profile" 
              title="View your profile"
              style={{ 
                fontSize: '0.85rem', 
                color: 'var(--color-text-main)', 
                fontWeight: 600, 
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.3rem 0.6rem',
                borderRadius: '8px',
                background: 'var(--color-bg)',
                border: '1px solid var(--border-color)'
              }}
            >
              <span>Hi, {user.name}</span>
            </Link>
          )}
          
          {/* Notification Button */}
          <button 
            className={`noti-btn ${location.pathname === '/notifications' ? 'active' : ''}`}
            onClick={() => navigate('/notifications')}
            aria-label="Notifications"
            title="Notifications"
            style={{
              position: 'relative',
              backgroundColor: location.pathname === '/notifications' ? 'var(--color-green-subtle)' : undefined,
              borderColor: location.pathname === '/notifications' ? 'var(--color-green)' : undefined,
              color: location.pathname === '/notifications' ? 'var(--color-green)' : undefined,
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-green)'
            }} />
          </button>

          <button 
            onClick={signOut}
            title="Sign out"
            style={{
              background: 'transparent',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '0.35rem 0.8rem',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              fontSize: '0.8rem',
              transition: 'all 0.2s'
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Persistent Main Layout Shell */}
      <div className={`main-layout ${isFullWidthView ? 'no-right-sidebar' : ''}`}>
        
        {/* Persistent Left Sidebar */}
        <aside className="sidebar-left">
          <nav className="nav-menu">
            <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              home
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              profile
            </NavLink>
            <NavLink to="/following" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              following
            </NavLink>
            <NavLink to="/notifications" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              notifications
            </NavLink>
            <NavLink to="/search" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              search
            </NavLink>
            <NavLink to="/search?category=Environment" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Upcoming Events
            </NavLink>
            <NavLink to="/notifications" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              saved
            </NavLink>
          </nav>
        </aside>

        {/* Dynamic Center Feed */}
        <main className="feed-center" style={isFullWidthView ? { maxWidth: '100%' } : undefined}>
          <Outlet />
        </main>

        {/* Right Sidebar - Hidden on profile views */}
        {!isFullWidthView && (
          <aside className="sidebar-right">
            <div className="suggested-widget">
              <h3 className="widget-title">Who to follow</h3>
              
              <div className="suggested-item" style={{ alignItems: 'center' }}>
                <img 
                  src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=80&auto=format&fit=crop&q=80" 
                  alt="Green Earth" 
                  style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }} 
                />
                <div className="suggested-info">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <span className="suggested-name">Green Earth</span>
                    <span style={{ color: 'var(--color-green)', fontSize: '0.85rem' }} title="Verified NGO">✓</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>@greenearth &bull; Env</span>
                </div>
                <button 
                  className="follow-btn"
                  onClick={() => setSuggestedFollows(prev => ({ ...prev, 's1': !prev['s1'] }))}
                  style={{
                    backgroundColor: suggestedFollows['s1'] ? 'transparent' : 'var(--color-text-main)',
                    color: suggestedFollows['s1'] ? 'var(--color-text-main)' : 'var(--color-white)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '16px',
                    padding: '0.35rem 0.85rem',
                    fontWeight: 600
                  }}
                >
                  {suggestedFollows['s1'] ? 'Following' : 'Follow'}
                </button>
              </div>
              
              <div className="suggested-item" style={{ alignItems: 'center' }}>
                <img 
                  src="https://images.unsplash.com/photo-1509062522246-3755977927d7?w=80&auto=format&fit=crop&q=80" 
                  alt="EduCare India" 
                  style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }} 
                />
                <div className="suggested-info">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <span className="suggested-name">EduCare India</span>
                    <span style={{ color: 'var(--color-green)', fontSize: '0.85rem' }} title="Verified NGO">✓</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>@educare &bull; Edu</span>
                </div>
                <button 
                  className="follow-btn"
                  onClick={() => setSuggestedFollows(prev => ({ ...prev, 's2': !prev['s2'] }))}
                  style={{
                    backgroundColor: suggestedFollows['s2'] ? 'transparent' : 'var(--color-text-main)',
                    color: suggestedFollows['s2'] ? 'var(--color-text-main)' : 'var(--color-white)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '16px',
                    padding: '0.35rem 0.85rem',
                    fontWeight: 600
                  }}
                >
                  {suggestedFollows['s2'] ? 'Following' : 'Follow'}
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default MainLayout;

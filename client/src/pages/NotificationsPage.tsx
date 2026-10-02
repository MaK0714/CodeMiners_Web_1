import React, { useState } from 'react';

interface NotificationItem {
  id: string;
  ngoName: string;
  avatar: string;
  category: string;
  message: string;
  time: string;
  isFollowing: boolean;
  unread: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    ngoName: 'EcoWarriors India',
    avatar: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=100&auto=format&fit=crop&q=80',
    category: 'Environment',
    message: 'shared a new project: "Clean Riverfront Initiative 2026"',
    time: '15m ago',
    isFollowing: true,
    unread: true,
  },
  {
    id: '2',
    ngoName: 'Robin Hood Army',
    avatar: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=100&auto=format&fit=crop&q=80',
    category: 'Food Relief',
    message: 'started following your community contributions',
    time: '1h ago',
    isFollowing: true,
    unread: true,
  },
  {
    id: '3',
    ngoName: 'Akshaya Patra Foundation',
    avatar: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=100&auto=format&fit=crop&q=80',
    category: 'Children & Education',
    message: 'announced: 10,000 mid-day meals successfully distributed',
    time: '3h ago',
    isFollowing: true,
    unread: false,
  },
  {
    id: '4',
    ngoName: 'Save The Stray Animals',
    avatar: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=100&auto=format&fit=crop&q=80',
    category: 'Animals',
    message: 'posted an urgent emergency rescue need near Bandra West',
    time: '1d ago',
    isFollowing: true,
    unread: false,
  },
  {
    id: '5',
    ngoName: 'Green Earth Trust',
    avatar: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb0?w=100&auto=format&fit=crop&q=80',
    category: 'Environment',
    message: 'invited you to "Mega Plantation Drive" this weekend',
    time: '2d ago',
    isFollowing: true,
    unread: false,
  },
  {
    id: '6',
    ngoName: 'ChildCare Hope Foundation',
    avatar: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=100&auto=format&fit=crop&q=80',
    category: 'Education',
    message: 'verified a new volunteer certificate for your profile',
    time: '3d ago',
    isFollowing: true,
    unread: false,
  }
];

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'unread' | 'following'>('all');

  const toggleFollow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev =>
      prev.map(item =>
        item.id === id ? { ...item, isFollowing: !item.isFollowing } : item
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(item => ({ ...item, unread: false })));
  };

  const filteredNotifications = notifications.filter(item => {
    if (filter === 'unread') return item.unread;
    if (filter === 'following') return item.isFollowing;
    return true;
  });

  return (
    <div className="notifications-container">
      {/* Header with Title and Filters */}
      <div className="notifications-header">
        <div>
          <h2 className="notifications-title">Notifications</h2>
          <p className="notifications-subtitle">Recent activity and updates from NGOs you follow</p>
        </div>
        <div className="notifications-filter-bar">
          <button 
            className={`filter-chip ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({notifications.length})
          </button>
          <button 
            className={`filter-chip ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            Unread ({notifications.filter(n => n.unread).length})
          </button>
          <button 
            className={`filter-chip ${filter === 'following' ? 'active' : ''}`}
            onClick={() => setFilter('following')}
          >
            Following ({notifications.filter(n => n.isFollowing).length})
          </button>
          {notifications.some(n => n.unread) && (
            <button className="mark-read-btn" onClick={markAllAsRead}>
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Notifications Cards matching the wireframe */}
      <div className="notifications-list">
        {filteredNotifications.length === 0 ? (
          <div className="noti-wireframe-card empty-state">
            <p>No notifications in this tab.</p>
          </div>
        ) : (
          filteredNotifications.map(noti => (
            <div 
              key={noti.id} 
              className={`noti-wireframe-card ${noti.unread ? 'unread' : ''}`}
              onClick={() => {
                setNotifications(prev =>
                  prev.map(item => item.id === noti.id ? { ...item, unread: false } : item)
                );
              }}
            >
              {/* Inner Left Pill / Content Container */}
              <div className="noti-inner-pill">
                <img src={noti.avatar} alt={noti.ngoName} className="noti-avatar" />
                <div className="noti-content-wrapper">
                  <div className="noti-text">
                    <span className="noti-ngo-name">{noti.ngoName}</span>{' '}
                    <span className="noti-message">{noti.message}</span>
                  </div>
                  <div className="noti-meta">
                    <span className="noti-badge">{noti.category}</span>
                    <span className="noti-time">{noti.time}</span>
                    {noti.unread && <span className="noti-dot" />}
                  </div>
                </div>
              </div>

              {/* Right Action Button - Wireframe "following" button */}
              <button 
                type="button"
                className={`noti-following-btn ${noti.isFollowing ? 'active' : 'outline'}`}
                onClick={(e) => toggleFollow(noti.id, e)}
              >
                {noti.isFollowing ? 'following' : 'follow'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;

import React, { useState, useEffect } from 'react';
import { NotificationService, NotificationItem } from '../services/NotificationService';
import { Bell, CheckCheck, Loader2, MessageSquare, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const getNotificationIcon = (type: string) => {
    switch (type) {
        case 'TEAM_INVITATION':
        case 'INVITATION_ACCEPTED':
        case 'INVITATION_DECLINED':
            return <Users size={20} className="text-blue-500" />;
        default:
            return <MessageSquare size={20} className="text-gray-400" />;
    }
};

const getTimeAgo = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
};

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await NotificationService.getMyNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleNotificationClick = (notif: NotificationItem) => {
    console.log("Notification clicked in page:", notif);
    if (!notif.isRead) {
      NotificationService.markAsRead(notif.id).catch(console.error);
      setNotifications(prev =>
        prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n)
      );
    }
    
    const typeStr = notif.type ? notif.type.toUpperCase() : '';
    switch (typeStr) {
        case 'TEAM_INVITATION':
        case 'INVITE':
        case 'INVITATION_DECLINED':
        case 'TEAM_INVITATION_REVOKED':
            console.log("Navigating to /invitations");
            navigate('/invitations');
            break;
        case 'INVITATION_ACCEPTED':
        case 'TEAM_MEMBER_JOINED':
        case 'TEAM_DISQUALIFIED':
        case 'TEAM':
            console.log("Navigating to /my-team");
            navigate('/my-team');
            break;
        case 'HACKATHON_EVENT':
        case 'SYSTEM_ALERT':
            console.log("Navigating to /events");
            navigate('/events');
            break;
        case 'MENTORSHIP_REQUEST':
            console.log("Navigating to mentorship requests");
            navigate(typeStr === 'MENTORSHIP_REQUEST' ? '/mentor/requests' : '/my-mentorship-requests');
            break;
        case 'MENTORSHIP_ACCEPTED':
        case 'MENTORSHIP_RESOLVED':
        case 'MENTORSHIP_REJECTED':
            console.log("Navigating to /my-mentorship-requests");
            navigate('/my-mentorship-requests');
            break;
        case 'SUPPORT_TICKET_CREATED':
            console.log("Navigating to /support-tickets");
            navigate('/support-tickets');
            break;
        default:
            console.log("No specific route for type:", typeStr);
            break;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-headline-lg font-bold text-on-surface mb-6">Notification Center</h1>
      <div className="bg-surface-container-lowest border border-neutral-border rounded-lg shadow-floating overflow-hidden">
        <div className="p-4 border-b border-neutral-border flex justify-between items-center bg-white">
          <span className="text-label-lg text-on-surface font-semibold">Recent Alerts</span>
          <button 
            onClick={handleMarkAllAsRead}
            disabled={notifications.every(n => n.isRead)}
            className="flex items-center gap-2 text-primary hover:text-primary-container disabled:text-gray-400 text-sm font-semibold transition-colors"
          >
            <CheckCheck size={16} />
            Mark all as read
          </button>
        </div>
        
        <div className="divide-y divide-neutral-border bg-white min-h-[300px]">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 size={32} className="animate-spin text-primary" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-64 text-gray-500">
              <Bell size={48} className="text-gray-300 mb-4" />
              <p className="text-lg">No notifications yet</p>
              <p className="text-sm">When you get notifications, they'll show up here.</p>
            </div>
          ) : (
            notifications.map(notif => (
              <div 
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-6 flex items-start space-x-4 cursor-pointer hover:bg-gray-50 transition-colors ${!notif.isRead ? 'bg-blue-50/30' : ''}`}
              >
                <div className="mt-1">
                  {getNotificationIcon(notif.type)}
                </div>
                <div className="flex-1">
                  <p className={`text-body-md ${!notif.isRead ? 'text-gray-900 font-semibold' : 'text-gray-700'}`}>
                    {notif.title}
                  </p>
                  <p className="text-body-sm text-gray-600 mt-1">
                    {notif.message}
                  </p>
                  <span className="text-label-md text-gray-400 block mt-2">{getTimeAgo(notif.createdAt)}</span>
                </div>
                {!notif.isRead && (
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-2 flex-shrink-0 shadow-sm"></span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;

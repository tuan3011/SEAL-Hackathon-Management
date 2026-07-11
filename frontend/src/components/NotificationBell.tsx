import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, CheckCheck, Loader2, MessageSquare, Users } from 'lucide-react';
import { NotificationService, NotificationItem } from '../services/NotificationService';
import { useNavigate } from 'react-router-dom';

const getNotificationIcon = (type: string) => {
    switch (type) {
        case 'TEAM_INVITATION':
        case 'INVITATION_ACCEPTED':
        case 'INVITATION_DECLINED':
            return <Users size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />;
        default:
            return <MessageSquare size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />;
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

const NotificationBell: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Poll unread count every 30s
    const fetchUnreadCount = useCallback(async () => {
        try {
            const count = await NotificationService.getUnreadCount();
            setUnreadCount(count);
        } catch {
            // Silent fail — don't disrupt UX
        }
    }, []);

    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, [fetchUnreadCount]);

    // Fetch full list when dropdown opens
    useEffect(() => {
        if (!open) return;
        const fetchNotifications = async () => {
            setLoading(true);
            try {
                const data = await NotificationService.getMyNotifications();
                setNotifications(data);
            } catch {
                // ignore
            } finally {
                setLoading(false);
            }
        };
        fetchNotifications();
    }, [open]);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleMarkAsRead = async (notif: NotificationItem, e: React.MouseEvent) => {
        e.stopPropagation();
        if (notif.isRead) return;
        try {
            await NotificationService.markAsRead(notif.id);
            setNotifications(prev =>
                prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch { /* ignore */ }
    };

    const handleMarkAllRead = async () => {
        try {
            await NotificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch { /* ignore */ }
    };

    const handleNotificationClick = (notif: NotificationItem) => {
        console.log("Notification clicked:", notif);
        if (!notif.isRead) {
            NotificationService.markAsRead(notif.id).catch(console.error);
            setNotifications(prev =>
                prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
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
        
        setOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                id="notification-bell-btn"
                onClick={() => setOpen(prev => !prev)}
                className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                aria-label="Notifications"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors font-medium"
                                id="mark-all-read-btn"
                            >
                                <CheckCheck size={14} />
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Body */}
                    <div className="max-h-80 overflow-y-auto">
                        {loading ? (
                            <div className="flex justify-center items-center py-10">
                                <Loader2 size={24} className="animate-spin text-blue-500" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="py-10 text-center">
                                <Bell size={32} className="mx-auto text-gray-200 mb-2" />
                                <p className="text-sm text-gray-400">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map(notif => (
                                <div
                                    key={notif.id}
                                    onClick={() => handleNotificationClick(notif)}
                                    className={`flex gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-50 ${
                                        !notif.isRead ? 'bg-blue-50/60' : ''
                                    }`}
                                >
                                    {getNotificationIcon(notif.type)}
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm leading-snug ${!notif.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                            {notif.title}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                                        <p className="text-xs text-gray-400 mt-1">{getTimeAgo(notif.createdAt)}</p>
                                    </div>
                                    {!notif.isRead && (
                                        <button
                                            onClick={(e) => handleMarkAsRead(notif, e)}
                                            className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-blue-500 hover:bg-blue-700"
                                            title="Mark as read"
                                        />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                    
                    {/* Footer - View All */}
                    <div className="border-t border-gray-100 p-2 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
                        <button
                            onClick={() => {
                                setOpen(false);
                                navigate('/notifications');
                            }}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800 w-full py-1"
                        >
                            View all notifications
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;

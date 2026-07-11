import React from 'react';
import { useParams, NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, Award, ListOrdered, Target, Tag, Clock, BarChart2, History } from 'lucide-react';

const EventDashboardPage: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();

    const navLinks = [
        { to: `/organizer/events/${eventId}/dashboard/submissions`, icon: <FileText size={16} />, label: 'Submissions' },
        { to: `/organizer/events/${eventId}/dashboard/teams`, icon: <Users size={16} />, label: 'Teams' },
        { to: `/organizer/events/${eventId}/dashboard/rounds`, icon: <Clock size={16} />, label: 'Rounds' },
        { to: `/organizer/events/${eventId}/dashboard/criteria`, icon: <Target size={16} />, label: 'Criteria' },
        { to: `/organizer/events/${eventId}/dashboard/tracks`, icon: <Tag size={16} />, label: 'Tracks' },
        { to: `/organizer/events/${eventId}/dashboard/judges`, icon: <LayoutDashboard size={16} />, label: 'Judges' },
        { to: `/organizer/events/${eventId}/dashboard/ranking`, icon: <ListOrdered size={16} />, label: 'Ranking' },
        { to: `/organizer/events/${eventId}/dashboard/prizes`, icon: <Award size={16} />, label: 'Prizes' },
        { to: `/organizer/events/${eventId}/dashboard/analytics`, icon: <BarChart2 size={16} />, label: 'Analytics' },
        { to: `/organizer/events/${eventId}/dashboard/activity-log`, icon: <History size={16} />, label: 'Activity Log' },
    ];

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Event Dashboard</h1>
                <p className="text-sm text-gray-500 mt-1">Event ID: {eventId}</p>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center overflow-x-auto border-b border-gray-200 mb-6 gap-1">
                {navLinks.map(link => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) =>
                            `flex items-center gap-1.5 px-4 py-2.5 border-b-2 transition-colors whitespace-nowrap text-sm font-medium ${
                                isActive
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`
                        }
                    >
                        {link.icon}
                        {link.label}
                    </NavLink>
                ))}
            </div>

            {/* Tab Content */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <Outlet />
            </div>
        </div>
    );
};

export default EventDashboardPage;

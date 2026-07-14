import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, NavLink, useLocation } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import Input from './ui/Input';
import { 
    LayoutDashboard, Users, Trophy, Layers, MapPin, Bell, Settings,
    LogOut, HelpCircle, User as UserIcon, Menu, X, Search, MessageSquare
} from 'lucide-react';
import { Role, getUserRole } from '../services/authUtils';
import api from '../services/api';

const SidebarItem: React.FC<{ to: string, icon: React.ReactNode, label: string, onClick?: () => void }> = ({ to, icon, label, onClick }) => {
    const location = useLocation();
    const isActive = location.pathname.startsWith(to) && to !== '/' || (to === '/' && location.pathname === '/');
    
    return (
        <NavLink 
            to={to} 
            onClick={onClick}
            className={`flex items-center px-4 py-3 mx-2 my-1 rounded-lg transition-all duration-200 relative ${
                isActive 
                ? 'bg-brand-orange/10 text-brand-orange font-semibold border-l-4 border-brand-orange shadow-sm' 
                : 'text-slate-300 hover:bg-slate-800/40 hover:text-white'
            }`}
        >
            <span className="mr-3">{icon}</span>
            <span className="font-medium">{label}</span>
        </NavLink>
    );
};

const Sidebar: React.FC<{ isOpen: boolean, closeSidebar: () => void }> = ({ isOpen, closeSidebar }) => {
    const navigate = useNavigate();
    const role = getUserRole();

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/login');
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 z-20 md:hidden transition-opacity duration-300"
                    onClick={closeSidebar}
                />
            )}
            
            {/* Sidebar */}
            <div className={`
                fixed inset-y-0 left-0 z-30 w-64 bg-brand-navy text-white flex flex-col shadow-xl 
                transform transition-transform duration-300 ease-in-out md:translate-x-0
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="p-6 flex flex-col justify-center border-b border-slate-800 min-h-20">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                            <div className="bg-brand-orange p-2 rounded-lg">
                                <Trophy size={20} className="text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg font-bold tracking-tight leading-tight">SEAL Hackathon</span>
                                <span className="text-[10px] text-slate-400 font-medium">FPT University</span>
                            </div>
                        </div>
                        <button onClick={closeSidebar} className="md:hidden text-slate-400 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto py-4 custom-scrollbar flex flex-col justify-between">
                    <div>
                        <SidebarItem to="/dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" onClick={closeSidebar} />
                        
                        {/* ADMIN MENU */}
                        {role === Role.ADMIN && (
                            <>
                                <SidebarItem to="/admin/users" icon={<Users size={18} />} label="User Management" onClick={closeSidebar} />
                                <SidebarItem to="/admin/pending-approvals" icon={<Users size={18} />} label="Pending Approvals" onClick={closeSidebar} />
                                <SidebarItem to="/hackathon-events" icon={<Trophy size={18} />} label="Hackathons" onClick={closeSidebar} />
                                <SidebarItem to="/teams" icon={<Users size={18} />} label="All Teams" onClick={closeSidebar} />
                                <SidebarItem to="/admin/audit-logs" icon={<Layers size={18} />} label="Audit Logs" onClick={closeSidebar} />
                                <SidebarItem to="/support-tickets" icon={<MessageSquare size={18} />} label="Support Tickets" onClick={closeSidebar} />
                                <SidebarItem to="/admin/preferences" icon={<Settings size={18} />} label="System Settings" onClick={closeSidebar} />
                            </>
                        )}

                        {/* PARTICIPANT MENU */}
                        {role === Role.PARTICIPANT && (
                            <>
                                <SidebarItem to="/my-team" icon={<Users size={18} />} label="My Team" onClick={closeSidebar} />
                                <SidebarItem to="/events" icon={<Trophy size={18} />} label="Hackathons" onClick={closeSidebar} />
                                <SidebarItem to="/invitations" icon={<Bell size={18} />} label="Invitations" onClick={closeSidebar} />
                                <SidebarItem to="/my-mentorship-requests" icon={<HelpCircle size={18} />} label="Mentorship Sessions" onClick={closeSidebar} />
                            </>
                        )}

                        {/* ORGANIZER MENU */}
                        {role === Role.ORGANIZER && (
                            <>
                                <SidebarItem to="/organizer/events" icon={<Trophy size={18} />} label="My Events" onClick={closeSidebar} />
                            </>
                        )}

                        {/* JUDGE MENU */}
                        {role === Role.JUDGE && (
                            <>
                                <SidebarItem to="/judge/dashboard" icon={<LayoutDashboard size={18} />} label="Scoring Dashboard" onClick={closeSidebar} />
                            </>
                        )}

                        {/* MENTOR MENU */}
                        {role === Role.MENTOR && (
                            <>
                                <SidebarItem to="/mentor/dashboard" icon={<LayoutDashboard size={18} />} label="Mentor Dashboard" onClick={closeSidebar} />
                                <SidebarItem to="/mentor/requests" icon={<Bell size={18} />} label="Session Requests" onClick={closeSidebar} />
                            </>
                        )}

                        {/* COMMON MENU FOR ALL LOGGED IN USERS */}
                        <SidebarItem to="/profile" icon={<UserIcon size={18} />} label="Profile" onClick={closeSidebar} />
                        <SidebarItem to="/notifications" icon={<Bell size={18} />} label="Notifications" onClick={closeSidebar} />
                    </div>
                    <div className="mt-8 border-t border-slate-800 pt-4">
                        <SidebarItem to="/help" icon={<HelpCircle size={18} />} label="Help Center" onClick={closeSidebar} />
                        <button 
                            onClick={handleLogout}
                            className="w-full flex items-center px-4 py-3 mx-2 my-1 rounded-lg transition-all duration-200 text-slate-300 hover:bg-slate-800/40 hover:text-white text-left cursor-pointer"
                        >
                            <span className="mr-3"><LogOut size={18} /></span>
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

const Header: React.FC<{ toggleSidebar: () => void }> = ({ toggleSidebar }) => {
    const [eventName, setEventName] = useState<string>('');

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await api.get('/hackathon-events');
                const events = response.data.data;
                const activeEvent = events.find((e: any) => e.status === 'REGISTRATION' || e.status === 'IN_PROGRESS');
                if (activeEvent) {
                    setEventName(activeEvent.name);
                }
            } catch (err) {
                console.error("Failed to load active event", err);
            }
        };
        fetchEvent();
    }, []);

    return (
        <header className="flex items-center justify-between w-full h-16 px-4 md:px-8 bg-white border-b border-neutral-border sticky top-0 z-10 shadow-sm">
            <div className="flex items-center gap-4 flex-1">
                <button 
                    onClick={toggleSidebar} 
                    className="md:hidden p-2 text-brand-navy hover:bg-neutral-base rounded-lg transition-colors"
                >
                    <Menu size={20} />
                </button>
                <div className="hidden md:block w-full max-w-md">
                    {eventName && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-brand-navy font-semibold w-fit">
                            <Trophy size={18} className="text-brand-orange" />
                            {eventName}
                        </div>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-3 md:gap-4">
                <button className="p-2 text-slate-400 hover:text-brand-orange transition-colors">
                    <HelpCircle size={20} />
                </button>
                <NotificationBell />
                <NavLink to="/profile" className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-navy text-white text-sm font-semibold hover:ring-2 hover:ring-brand-orange hover:ring-offset-2 transition-all">
                    <UserIcon size={16} />
                </NavLink>
            </div>
        </header>
    );
};

const Layout: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />
            <div className="flex flex-col flex-grow md:ml-64 transition-all duration-300 w-full min-w-0">
                <Header toggleSidebar={() => setSidebarOpen(true)} />
                <main className="flex-grow p-4 md:p-8 overflow-x-hidden">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
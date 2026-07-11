import React, { useState, useEffect } from 'react';
import { 
    Users, FileText, Calendar, Trophy, CheckCircle, 
    UserPlus, Megaphone, ArrowRight, CalendarRange, Upload
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getUserRole, Role } from '../services/authUtils';
import { DashboardService, DashboardStats } from '../services/DashboardService';
import Skeleton from '../components/Skeleton';
import Button from '../components/ui/Button';

const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const role = getUserRole();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch stats from DashboardService
                const statsData = await DashboardService.getStats();
                setStats(statsData);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
                // Simple fallback in case of backend failure during development
                setStats({ activeTeams: 0, submissionsReceived: 0, pendingReviews: 0, daysRemaining: 0 });
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    // Mocked recent activity for visual enhancement matching the Stitch design
    const activities = [
        { id: 1, icon: <Upload size={14} className="text-primary" />, title: 'Alpha Logic submitted Round 2 deliverables.', time: '10 mins ago' },
        { id: 2, icon: <CheckCircle size={14} className="text-green-600" />, title: 'Mentor John Doe accepted a session request from CodeCrafters.', time: '1 hour ago' },
        { id: 3, icon: <UserPlus size={14} className="text-slate-600" />, title: 'New team registered: ByteMe.', time: '3 hours ago' },
        { id: 4, icon: <Megaphone size={14} className="text-orange-600" />, title: 'Admin published a new announcement regarding Judging Criteria.', time: 'Yesterday' },
        { id: 5, icon: <Upload size={14} className="text-primary" />, title: 'Nexus Team submitted Round 2 deliverables.', time: 'Yesterday' },
    ];

    return (
        <div className="space-y-8 max-w-[1440px] mx-auto">
            {/* Header & Quick Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-on-surface tracking-tight">Overview</h2>
                    <p className="text-sm md:text-base text-on-surface-variant mt-1">
                        Here's what's happening in the SEAL Hackathon. Logged in as <span className="font-semibold text-primary">{role}</span>.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {role === Role.PARTICIPANT && (
                        <Button 
                            variant="secondary" 
                            leftIcon={<CalendarRange size={16} />}
                            onClick={() => navigate('/mentors')}
                        >
                            Schedule Session
                        </Button>
                    )}
                    <Button 
                        variant="secondary" 
                        leftIcon={<Trophy size={16} />}
                        onClick={() => navigate('/events')}
                    >
                        View Leaderboard
                    </Button>

                </div>
            </div>

            {/* Stats Bento Grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} type="card" lines={2} className="h-32" />)}
                </div>
            ) : stats ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Stat Card 1: Active Teams */}
                    <div className="bg-white border border-outline-variant rounded-xl p-6 hover:border-primary-container/50 transition-colors flex flex-col justify-between shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-brand-orange/10 rounded-lg">
                                <Users className="text-brand-orange" size={24} />
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] text-on-surface-variant mb-1 uppercase tracking-widest font-bold">Active Teams</p>
                            <h3 className="text-4xl font-bold text-on-surface">{stats.activeTeams}</h3>
                        </div>
                    </div>

                    {/* Stat Card 2: Submissions Received */}
                    <div className="bg-white border border-outline-variant rounded-xl p-6 hover:border-primary-container/50 transition-colors flex flex-col justify-between shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <FileText className="text-blue-600" size={24} />
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] text-on-surface-variant mb-1 uppercase tracking-widest font-bold">Submissions Received</p>
                            <h3 className="text-4xl font-bold text-on-surface">{stats.submissionsReceived}</h3>
                        </div>
                    </div>

                    {/* Stat Card 3: Pending Reviews */}
                    <div className="bg-white border border-outline-variant rounded-xl p-6 hover:border-primary-container/50 transition-colors flex flex-col justify-between shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-purple-50 rounded-lg">
                                <CheckCircle className="text-purple-600" size={24} />
                            </div>
                            <span className="text-xs text-brand-orange font-semibold">Requires Attention</span>
                        </div>
                        <div>
                            <p className="text-[10px] text-on-surface-variant mb-1 uppercase tracking-widest font-bold">Pending Reviews</p>
                            <h3 className="text-4xl font-bold text-on-surface">{stats.pendingReviews}</h3>
                        </div>
                    </div>

                    {/* Stat Card 4: Days Remaining */}
                    <div className="bg-white border border-outline-variant rounded-xl p-6 hover:border-primary-container/50 transition-colors flex flex-col justify-between shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-red-50 rounded-lg">
                                <Calendar className="text-red-500" size={24} />
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] text-on-surface-variant mb-1 uppercase tracking-widest font-bold">Days Remaining</p>
                            <h3 className="text-4xl font-bold text-on-surface mb-2">{stats.daysRemaining}</h3>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-brand-orange rounded-full" style={{ width: '60%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}

            {/* Layout: Feed & Highlights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content Area (Spans 2 cols) */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Informational Card */}
                    <div className="bg-white border border-outline-variant rounded-xl p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center relative overflow-hidden shadow-sm">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-fixed to-transparent opacity-30 rounded-bl-full -z-0"></div>
                        <div className="flex-grow z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 mb-4">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                <span className="text-xs font-bold">Round 2 is Live</span>
                            </div>
                            <h3 className="text-xl font-bold text-on-surface mb-2">Prototype Submission Phase</h3>
                            <p className="text-sm text-on-surface-variant mb-6 max-w-lg">
                                Teams are currently working on their interactive prototypes. Ensure mentors are aligned for technical reviews starting this Friday.
                            </p>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="pl-0 text-primary hover:bg-transparent hover:underline"
                                rightIcon={<ArrowRight size={16} />}
                            >
                                View Round Details
                            </Button>
                        </div>
                        <div className="w-full md:w-48 aspect-[4/3] rounded-lg bg-surface-container border border-outline-variant flex items-center justify-center z-10 overflow-hidden relative">
                            <img 
                                alt="Modern workspace focus" 
                                className="w-full h-full object-cover opacity-80 mix-blend-multiply" 
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDj15bN8uH-v1ZI6lzc568FpuGGfeQIR5Qjxqk6oYZhe-UIa8VobHfzUuxhcJ0dgRqp2c_hkZF9ydPYM3DOHGEOv89O2RltzthuqsLM41cDRJLH4GqvWjwA2Ghrw7HirKdVsGvRIHK9BMwDzCx9J116VjXevCuPwI8o3fnqLc2jvJ_w3NTMQay0HFUmyQTMHUqotiKEbPcVODBHLlwdXjf34WLEPN_BzJhQq81R2FkEXALTN9mGLJ5hQX7bJ99Qupce80MEHpd6NJp8"
                            />
                        </div>
                    </div>

                    {/* Top Mentors list table */}
                    <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-on-surface">Top Mentors</h3>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {/* Row 1 */}
                            <div className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-primary font-bold text-sm">JD</div>
                                    <div>
                                        <p className="text-sm font-semibold text-on-surface">John Doe</p>
                                        <p className="text-xs text-on-surface-variant">AI &amp; Machine Learning</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-on-surface">12 Sessions</p>
                                    <p className="text-xs text-on-surface-variant">4.9/5 Rating</p>
                                </div>
                            </div>
                            {/* Row 2 */}
                            <div className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-primary font-bold text-sm">AS</div>
                                    <div>
                                        <p className="text-sm font-semibold text-on-surface">Alice Smith</p>
                                        <p className="text-xs text-on-surface-variant">UI/UX Design</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-on-surface">8 Sessions</p>
                                    <p className="text-xs text-on-surface-variant">5.0/5 Rating</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity Feed (Spans 1 col) */}
                <div className="bg-white border border-outline-variant rounded-xl flex flex-col h-full shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-100">
                        <h3 className="text-lg font-bold text-on-surface">Recent Activity</h3>
                    </div>
                    <div className="flex-grow p-6 flex flex-col gap-6 relative">
                        {/* Vertical line for timeline */}
                        <div className="absolute left-[39px] top-6 bottom-6 w-px bg-outline-variant"></div>
                        {
                            activities.map(act => (
                                <div key={act.id} className="relative z-10 flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-slate-50 border-2 border-white flex items-center justify-center shrink-0 mt-1 shadow-sm">
                                        {act.icon}
                                    </div>
                                    <div>
                                        <p className="text-sm text-on-surface">{act.title}</p>
                                        <p className="text-xs text-on-surface-variant mt-1">{act.time}</p>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                    <div className="p-4 border-t border-slate-100 text-center bg-slate-50 flex justify-center">
                        <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/5 w-full">
                            View All Activity
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
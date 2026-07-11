import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../../services/api';
import { Users, FileText, LayoutDashboard, Loader2, BarChart2 } from 'lucide-react';

interface AnalyticsData {
    totalTeams: number;
    totalParticipants: number;
    totalSubmissions: number;
    teamsPerTrack: Record<string, number>;
}

const AnalyticsTab: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/hackathon-events/${eventId}/analytics`);
                setAnalytics(response.data.data);
            } catch (err) {
                console.error("Failed to fetch analytics:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, [eventId]);

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="text-center py-10 text-gray-400">
                <p>No analytics data available for this event.</p>
            </div>
        );
    }

    const trackEntries = Object.entries(analytics.teamsPerTrack);
    const maxTeams = Math.max(...trackEntries.map(([_, count]) => count), 1);

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-2 mb-4">
                <LayoutDashboard size={20} className="text-gray-600" />
                <h2 className="text-xl font-semibold text-gray-800">Event Analytics</h2>
            </div>

            {/* Stats Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Teams Card */}
                <div className="p-6 rounded-xl border border-slate-100 bg-gradient-to-br from-blue-50/50 to-white shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Teams</p>
                        <h3 className="text-3xl font-extrabold text-slate-800 mt-1">{analytics.totalTeams}</h3>
                    </div>
                    <div className="p-3 bg-blue-100/50 text-blue-600 rounded-lg">
                        <Users size={24} />
                    </div>
                </div>

                {/* Total Participants Card */}
                <div className="p-6 rounded-xl border border-slate-100 bg-gradient-to-br from-green-50/50 to-white shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Participants</p>
                        <h3 className="text-3xl font-extrabold text-slate-800 mt-1">{analytics.totalParticipants}</h3>
                    </div>
                    <div className="p-3 bg-green-100/50 text-green-600 rounded-lg">
                        <Users size={24} />
                    </div>
                </div>

                {/* Total Submissions Card */}
                <div className="p-6 rounded-xl border border-slate-100 bg-gradient-to-br from-purple-50/50 to-white shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Submissions</p>
                        <h3 className="text-3xl font-extrabold text-slate-800 mt-1">{analytics.totalSubmissions}</h3>
                    </div>
                    <div className="p-3 bg-purple-100/50 text-purple-600 rounded-lg">
                        <FileText size={24} />
                    </div>
                </div>
            </div>

            {/* SVG Visual Chart Card */}
            <div className="p-6 rounded-xl border border-slate-100 bg-white shadow-sm space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <BarChart2 className="text-slate-600" size={18} />
                    <h3 className="font-bold text-slate-800 text-sm">Teams per Track distribution</h3>
                </div>

                {trackEntries.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs">
                        No tracks configured or no teams registered yet.
                    </div>
                ) : (
                    <div className="space-y-4 max-w-2xl">
                        {trackEntries.map(([trackName, count]) => {
                            const percent = (count / maxTeams) * 100;
                            return (
                                <div key={trackName} className="space-y-1">
                                    <div className="flex justify-between text-xs font-medium text-slate-700">
                                        <span>{trackName} Track</span>
                                        <span>{count} {count === 1 ? 'team' : 'teams'}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                                        <div 
                                            className="bg-blue-600 h-full rounded-full transition-all duration-500 ease-out"
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalyticsTab;

import React, { useEffect, useState } from 'react';
import type { Team } from '../services/TeamService';
import { Users, Loader2, Trash2, Ban, X, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { ExportService } from '../services/ExportService';
import Authorizable from '../components/Authorizable';
import { Role } from '../services/authUtils';
import api from '../services/api';
import { HackathonEventService } from '../services/HackathonEventService';

const TeamsPage: React.FC = () => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState<any[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<number | 'all'>('all');
    
    const [disqualifyTeamId, setDisqualifyTeamId] = useState<number | null>(null);
    const [disqualifyReason, setDisqualifyReason] = useState('');
    const [isDisqualifying, setIsDisqualifying] = useState(false);

    useEffect(() => {
        fetchEvents();
    }, []);

    useEffect(() => {
        fetchTeams();
    }, [selectedEventId]);

    const fetchEvents = async () => {
        try {
            const data = await HackathonEventService.getAllEventsForAdmin(0, 100);
            setEvents(data || []);
        } catch (err) {
            console.error('Failed to fetch events:', err);
        }
    };

    const fetchTeams = async () => {
        setLoading(true);
        try {
            let fetchedTeams: Team[] = [];
            if (selectedEventId === 'all') {
                const response = await api.get('/teams');
                fetchedTeams = response.data.data || [];
            } else {
                const response = await api.get(`/teams/event/${selectedEventId}`);
                fetchedTeams = response.data.data || [];
            }
            setTeams(fetchedTeams);
        } catch (err: any) {
            console.error('Failed to fetch teams:', err);
            toast.error(err.response?.data?.message || err.response?.data?.error?.message || 'Failed to fetch teams.');
        } finally {
            setLoading(false);
        }
    };

    const handleDisqualify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!disqualifyTeamId || !disqualifyReason.trim()) return;

        setIsDisqualifying(true);
        try {
            await api.post(`/teams/${disqualifyTeamId}/disqualify`, { reason: disqualifyReason });
            toast.success("Team disqualified successfully");
            setDisqualifyTeamId(null);
            setDisqualifyReason('');
            await fetchTeams();
        } catch (err: any) {
            toast.error(err.response?.data?.message || err.response?.data?.error?.message || 'Failed to disqualify team.');
        } finally {
            setIsDisqualifying(false);
        }
    };

    const handleDelete = async (teamId: number) => {
        if (!window.confirm("Are you sure you want to delete this team? This action cannot be undone.")) return;
        try {
            await api.delete(`/teams/${teamId}`);
            toast.success("Team deleted successfully");
            await fetchTeams();
        } catch (err: any) {
            toast.error(err.response?.data?.message || err.response?.data?.error?.message || 'Failed to delete team.');
        }
    };

    return (
        <div className="space-y-6 max-w-[1440px] mx-auto relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 border border-outline-variant rounded-xl shadow-sm">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-on-surface tracking-tight flex items-center gap-2">
                        <Users className="text-primary-container" />
                        Teams
                    </h1>
                    <p className="text-sm text-on-surface-variant mt-1">Manage competing teams and their members.</p>
                </div>
                
                <div className="flex gap-2">
                    <Authorizable allowedRoles={[Role.ADMIN, Role.ORGANIZER]}>
                        <button
                            onClick={() => ExportService.exportTeamsCsv()}
                            className="bg-white border border-outline-variant hover:bg-slate-50 text-on-surface font-semibold py-2 px-4 rounded-lg shadow-sm flex items-center gap-2 transition-colors cursor-pointer text-sm"
                        >
                            <Download size={16} />
                            Export CSV
                        </button>
                    </Authorizable>

                </div>
            </div>

            <div className="bg-white p-4 border border-outline-variant rounded-xl shadow-sm flex flex-wrap items-center gap-4">
                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Filter by Hackathon Event</label>
                    <select
                        value={selectedEventId}
                        onChange={e => setSelectedEventId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[280px]"
                    >
                        <option value="all">All Events</option>
                        {events.map(ev => (
                            <option key={ev.id} value={ev.id}>{ev.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="animate-spin text-primary-container" size={32} />
                </div>
            ) : teams.length === 0 ? (
                <div className="bg-white border border-outline-variant rounded-xl p-16 text-center max-w-2xl mx-auto shadow-sm">
                    <Users className="mx-auto h-16 w-16 text-slate-300 mb-4" />
                    <h3 className="text-lg font-bold text-on-surface mb-1">No Teams Registered</h3>
                    <p className="text-sm text-on-surface-variant">There are no teams registered yet for this track.</p>
                </div>
            ) : (
                <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Description</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-100">
                                {teams.map((team: any) => {
                                    const status = team.status || 'ACTIVE';
                                    const isFinalized = status === 'FINALIZED';
                                    const isDisqualified = status === 'DISQUALIFIED';
                                    const statusBadgeClass = isDisqualified
                                        ? "bg-red-50 text-red-700 border-red-200"
                                        : isFinalized
                                        ? "bg-blue-50 text-blue-700 border-blue-200"
                                        : "bg-green-50 text-green-700 border-green-200";

                                    return (
                                        <tr key={team.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-on-surface-variant">{team.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-on-surface">{team.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`text-xs font-semibold px-2.5 py-1 border rounded-full ${statusBadgeClass}`}>
                                                    {status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-on-surface-variant max-w-xs truncate">{team.description || team.projectName || 'No description provided'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <Authorizable 
                                                    allowedRoles={[Role.ADMIN, Role.ORGANIZER]} 
                                                    fallback={<span className="text-slate-400 text-xs italic">View Only</span>}
                                                >
                                                    <div className="flex space-x-3 items-center">

                                                        
                                                        {status !== 'DISQUALIFIED' && (
                                                            <button
                                                                onClick={() => setDisqualifyTeamId(team.id)}
                                                                className="text-orange-500 hover:text-orange-700 transition-colors cursor-pointer"
                                                                title="Disqualify"
                                                            >
                                                                <Ban size={16} />
                                                            </button>
                                                        )}

                                                        {isFinalized ? (
                                                            <div className="relative group flex">
                                                                <button
                                                                    disabled
                                                                    className="text-slate-300 cursor-not-allowed"
                                                                    title="Finalized teams must be disqualified instead."
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleDelete(team.id)}
                                                                className="text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                                                                title="Delete"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </Authorizable>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Disqualify Modal */}
            {disqualifyTeamId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white border border-outline-variant rounded-xl p-6 md:p-8 shadow-xl w-full max-w-md relative">
                        <button 
                            onClick={() => { setDisqualifyTeamId(null); setDisqualifyReason(''); }}
                            className="absolute top-4 right-4 text-slate-400 hover:text-on-surface transition-colors"
                        >
                            <X size={20} />
                        </button>
                        
                        <div className="flex items-center gap-2.5 mb-5">
                            <div className="p-2 bg-red-100 rounded-lg text-red-600">
                                <Ban size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-on-surface">Disqualify Team</h2>
                        </div>
                        
                        <form onSubmit={handleDisqualify} className="space-y-5">
                            <div>
                                <label htmlFor="reason" className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
                                    Reason for Disqualification <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="reason"
                                    value={disqualifyReason}
                                    onChange={(e) => setDisqualifyReason(e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-red-300 focus:ring-2 focus:ring-red-200 transition-all resize-none"
                                    placeholder="Enter reason..."
                                    rows={3}
                                    required
                                />
                            </div>
                            
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => { setDisqualifyTeamId(null); setDisqualifyReason(''); }}
                                    className="px-4 py-2 border border-outline-variant hover:bg-slate-50 rounded-lg text-sm font-semibold text-on-surface transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
                                    disabled={isDisqualifying || !disqualifyReason.trim()}
                                >
                                    {isDisqualifying ? 'Disqualifying...' : 'Disqualify Team'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamsPage;
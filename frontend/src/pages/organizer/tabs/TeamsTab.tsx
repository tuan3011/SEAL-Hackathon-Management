import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../../services/api';
import { Users, Crown, Search, ChevronLeft, ChevronRight, Ban, Trash2, X, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { ExportService } from '../../../services/ExportService';
import Skeleton from '../../../components/Skeleton';
import EmptyState from '../../../components/EmptyState';

interface TeamMemberInfo {
    userId: number;
    username: string;
    isLeader: boolean;
}

interface Team {
    id: number;
    name: string;
    projectName: string;
    trackName: string;
    status: string;
    members: TeamMemberInfo[];
    currentRoundName?: string;
    currentRoundOrder?: number;
}

interface Round {
    id: number;
    name: string;
    roundOrder: number;
}

interface Track {
    id: number;
    name: string;
}

const TeamsTab: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const [teams, setTeams] = useState<Team[]>([]);
    const [rounds, setRounds] = useState<Round[]>([]);
    const [tracks, setTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const size = 10;

    const [selectedRoundId, setSelectedRoundId] = useState<number | string>('ALL');
    const [selectedTrackId, setSelectedTrackId] = useState<number | string>('ALL');
    const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

    const [disqualifyTeamId, setDisqualifyTeamId] = useState<number | null>(null);
    const [disqualifyReason, setDisqualifyReason] = useState('');
    const [isDisqualifying, setIsDisqualifying] = useState(false);

    const fetchTeams = async () => {
        if (!eventId) return;
        setLoading(true);
        try {
            const response = await api.get(`/teams/event/${eventId}`);
            setTeams(response.data.data);
        } catch (err: any) {
            toast.error(err.response?.data?.message || err.response?.data?.error?.message || 'Failed to load teams for this event.');
        } finally {
            setLoading(false);
        }
    };

    const fetchFiltersData = async () => {
        if (!eventId) return;
        try {
            const [roundsRes, tracksRes] = await Promise.all([
                api.get(`/rounds/hackathon/${eventId}`),
                api.get(`/tracks/hackathon/${eventId}`)
            ]);
            setRounds(roundsRes.data.data);
            setTracks(tracksRes.data.data);
        } catch (err) {
            console.error('Failed to load filter data:', err);
        }
    };

    useEffect(() => {
        fetchTeams();
        fetchFiltersData();
    }, [eventId]);

    // Client-side filtering and pagination
    const filteredTeams = useMemo(() => {
        return teams.filter(t => {
            const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                (t.projectName && t.projectName.toLowerCase().includes(searchTerm.toLowerCase()));
            
            const matchesTrack = selectedTrackId === 'ALL' || t.trackName === tracks.find(tr => tr.id === Number(selectedTrackId))?.name;
            
            const matchesRound = selectedRoundId === 'ALL' || t.currentRoundName === rounds.find(r => r.id === Number(selectedRoundId))?.name;
            
            const matchesStatus = selectedStatus === 'ALL' || t.status === selectedStatus;
            
            return matchesSearch && matchesTrack && matchesRound && matchesStatus;
        });
    }, [teams, searchTerm, selectedTrackId, selectedRoundId, selectedStatus, tracks, rounds]);

    const totalPages = Math.ceil(filteredTeams.length / size) || 1;
    
    // Reset to page 0 when filters or search change
    useEffect(() => {
        setPage(0);
    }, [searchTerm, selectedTrackId, selectedRoundId, selectedStatus]);

    const paginatedTeams = useMemo(() => {
        const start = page * size;
        return filteredTeams.slice(start, start + size);
    }, [filteredTeams, page, size]);

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

    if (loading && teams.length === 0) return (
        <div className="py-6">
            <Skeleton type="card" lines={3} className="mb-4" />
            <Skeleton type="card" lines={3} />
        </div>
    );

    return (
        <div className="relative">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <Users size={20} className="text-gray-600" />
                    <h2 className="text-xl font-semibold text-gray-800">Registered Teams</h2>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{teams.length}</span>
                </div>

                <div className="flex flex-1 items-center gap-4 justify-end">
                    {/* Search Bar */}
                    <div className="relative w-full md:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={16} className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search teams or projects..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-full"
                        />
                    </div>
                    <button
                        onClick={() => ExportService.exportTeamsCsv()}
                        className="flex items-center shrink-0 gap-1.5 px-3 py-2 text-sm bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Download size={16} /> Export CSV
                    </button>
                </div>
            </div>

            {/* Filter Menu */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Filter By:
                </div>
                
                {/* Track Filter */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-500">Track</label>
                    <select
                        value={selectedTrackId}
                        onChange={(e) => setSelectedTrackId(e.target.value)}
                        className="bg-white border border-gray-200 text-gray-800 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                    >
                        <option value="ALL">All Tracks</option>
                        {tracks.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                </div>

                {/* Round Filter */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-500">Round</label>
                    <select
                        value={selectedRoundId}
                        onChange={(e) => setSelectedRoundId(e.target.value)}
                        className="bg-white border border-gray-200 text-gray-800 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                    >
                        <option value="ALL">All Rounds</option>
                        {rounds.map(r => (
                            <option key={r.id} value={r.id}>{r.name} (Round {r.roundOrder})</option>
                        ))}
                    </select>
                </div>

                {/* Status Filter */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-500">Status</label>
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="bg-white border border-gray-200 text-gray-800 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="ACTIVE">Active (In Registration)</option>
                        <option value="FINALIZED">Finalized</option>
                        <option value="DISQUALIFIED">Disqualified</option>
                    </select>
                </div>

                {/* Reset Filters button */}
                {(selectedTrackId !== 'ALL' || selectedRoundId !== 'ALL' || selectedStatus !== 'ALL') && (
                    <button
                        onClick={() => {
                            setSelectedTrackId('ALL');
                            setSelectedRoundId('ALL');
                            setSelectedStatus('ALL');
                        }}
                        className="self-end px-3 py-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer text-xs"
                    >
                        Clear Filters
                    </button>
                )}
            </div>

            {filteredTeams.length === 0 ? (
                <EmptyState 
                    icon={<Users size={40} className="text-gray-300" />}
                    title={searchTerm || selectedTrackId !== 'ALL' || selectedRoundId !== 'ALL' || selectedStatus !== 'ALL' ? "No matching teams" : "No teams yet"}
                    description={searchTerm || selectedTrackId !== 'ALL' || selectedRoundId !== 'ALL' || selectedStatus !== 'ALL' ? "No teams match your filter criteria." : "No teams have been created for this event yet."}
                />
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {paginatedTeams.map(team => {
                            const status = team.status || 'ACTIVE';
                            const isFinalized = status === 'FINALIZED';
                            const isDisqualified = status === 'DISQUALIFIED';
                            const statusBadgeClass = isDisqualified
                                ? "bg-red-50 text-red-700 border-red-200"
                                : isFinalized
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-green-50 text-green-700 border-green-200";

                            return (
                                <div key={team.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow bg-white flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-semibold text-gray-900">{team.name}</p>
                                                <p className="text-xs text-gray-500">{team.projectName || 'No project name'}</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-1.5">
                                                <span className={`text-xs px-2 py-0.5 border rounded-full font-medium ${statusBadgeClass}`}>
                                                    {status}
                                                </span>
                                                {team.trackName && (
                                                    <span className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full font-medium">
                                                        {team.trackName}
                                                    </span>
                                                )}
                                                {team.currentRoundName && (
                                                    <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full font-medium">
                                                        Round: {team.currentRoundName}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-1 mt-3">
                                            {team.members?.map(m => (
                                                <span
                                                    key={m.userId}
                                                    className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                                                        m.isLeader
                                                            ? 'bg-yellow-50 text-yellow-700 border border-yellow-200 font-medium'
                                                            : 'bg-gray-100 text-gray-600'
                                                    }`}
                                                >
                                                    {m.isLeader && <Crown size={12} />}
                                                    {m.username}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end items-center gap-3">
                                        {!isDisqualified && (
                                            <button
                                                onClick={() => setDisqualifyTeamId(team.id)}
                                                className="text-xs font-semibold text-orange-600 hover:text-orange-800 flex items-center gap-1 transition-colors"
                                                title="Disqualify"
                                            >
                                                <Ban size={14} /> Disqualify
                                            </button>
                                        )}
                                        {isFinalized ? (
                                            <div className="relative group flex text-xs font-semibold text-slate-400 cursor-not-allowed items-center gap-1" title="Finalized teams must be disqualified instead.">
                                                <Trash2 size={14} /> Delete
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleDelete(team.id)}
                                                className="text-xs font-semibold text-red-600 hover:text-red-800 flex items-center gap-1 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={14} /> Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                            <span className="text-sm text-gray-500">
                                Showing {page * size + 1} to {Math.min((page + 1) * size, filteredTeams.length)} of {filteredTeams.length} teams
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                    className="p-1.5 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                    disabled={page === totalPages - 1}
                                    className="p-1.5 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Disqualify Modal */}
            {disqualifyTeamId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xl w-full max-w-md relative">
                        <button 
                            onClick={() => { setDisqualifyTeamId(null); setDisqualifyReason(''); }}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={20} />
                        </button>
                        
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-red-100 rounded-lg text-red-600">
                                <Ban size={20} />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900">Disqualify Team</h2>
                        </div>
                        
                        <form onSubmit={handleDisqualify} className="space-y-4">
                            <div>
                                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                                    Reason for Disqualification <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="reason"
                                    value={disqualifyReason}
                                    onChange={(e) => setDisqualifyReason(e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all resize-none"
                                    placeholder="Enter reason..."
                                    rows={3}
                                    required
                                />
                            </div>
                            
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => { setDisqualifyTeamId(null); setDisqualifyReason(''); }}
                                    className="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium shadow-sm transition-colors disabled:opacity-50"
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

export default TeamsTab;

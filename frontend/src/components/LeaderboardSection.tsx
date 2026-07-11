import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Trophy, Medal, AlertCircle } from 'lucide-react';

interface LeaderboardSectionProps {
    rounds: any[];
    tracks: any[];
}

const LeaderboardSection: React.FC<LeaderboardSectionProps> = ({ rounds, tracks }) => {
    const [selectedRoundId, setSelectedRoundId] = useState<number | ''>('');
    const [selectedTrackId, setSelectedTrackId] = useState<number | 'all'>('all');
    const [rankings, setRankings] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const completedRounds = rounds.filter(r => r.gradingEnded);

    useEffect(() => {
        if (completedRounds.length > 0 && !selectedRoundId) {
            setSelectedRoundId(completedRounds[completedRounds.length - 1].id);
        }
    }, [completedRounds, selectedRoundId]);

    useEffect(() => {
        const fetchRankings = async () => {
            if (!selectedRoundId) return;
            setLoading(true);
            setError('');
            try {
                const res = await api.get(`/rankings/round/${selectedRoundId}`);
                setRankings(res.data.data || []);
            } catch (err) {
                setError('Failed to fetch leaderboard data.');
            } finally {
                setLoading(false);
            }
        };
        fetchRankings();
    }, [selectedRoundId]);

    if (completedRounds.length === 0) {
        return (
            <div className="p-6 bg-slate-50 border border-slate-100 rounded-xl text-center">
                <Trophy className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                <p className="text-slate-600 font-medium">No leaderboards available yet. Grading is still in progress for the rounds.</p>
            </div>
        );
    }

    const filteredRankings = selectedTrackId === 'all' 
        ? rankings 
        : rankings.filter(r => r.trackId === selectedTrackId);

    return (
        <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm mt-8">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Trophy size={24} className="text-primary-container" />
                    Public Leaderboard
                </h2>
                
                <div className="flex flex-col sm:flex-row gap-3">
                    <select
                        value={selectedRoundId}
                        onChange={(e) => setSelectedRoundId(Number(e.target.value))}
                        className="px-3 py-2 bg-white border border-outline-variant rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-container/20"
                    >
                        {completedRounds.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                    </select>

                    {tracks.length > 0 && (
                        <select
                            value={selectedTrackId}
                            onChange={(e) => setSelectedTrackId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                            className="px-3 py-2 bg-white border border-outline-variant rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-container/20"
                        >
                            <option value="all">All Tracks</option>
                            {tracks.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            <div className="p-0">
                {loading ? (
                    <div className="p-10 flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-container"></div>
                    </div>
                ) : error ? (
                    <div className="p-6 text-center text-red-500 flex items-center justify-center gap-2">
                        <AlertCircle size={20} />
                        {error}
                    </div>
                ) : filteredRankings.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">
                        No rankings found for the selected criteria.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                    <th className="py-4 px-6 text-center w-16">Rank</th>
                                    <th className="py-4 px-6">Team Details</th>
                                    <th className="py-4 px-6 text-right">Final Score</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredRankings.map((team, index) => {
                                    let rankColor = "text-gray-500";
                                    let bgRankColor = "bg-gray-100";
                                    
                                    if (team.rank === 1) { rankColor = "text-yellow-600"; bgRankColor = "bg-yellow-100"; }
                                    else if (team.rank === 2) { rankColor = "text-slate-600"; bgRankColor = "bg-slate-200"; }
                                    else if (team.rank === 3) { rankColor = "text-orange-700"; bgRankColor = "bg-orange-100"; }

                                    return (
                                        <tr key={team.teamId} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-4 px-6 text-center">
                                                <div className={`mx-auto w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${bgRankColor} ${rankColor}`}>
                                                    {team.rank <= 3 ? <Medal size={16} /> : team.rank}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <p className="font-bold text-gray-900 text-base">{team.teamName}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs font-semibold text-gray-500">{team.projectName}</span>
                                                    {team.trackName && (
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                            {team.trackName}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <span className="text-xl font-black text-gray-900">{team.finalScore.toFixed(2)}</span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeaderboardSection;

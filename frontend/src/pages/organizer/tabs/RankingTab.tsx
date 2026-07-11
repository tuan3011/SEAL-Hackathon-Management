import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../../services/api';
import { ListOrdered, Trophy, Loader2, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { ExportService } from '../../../services/ExportService';

interface Round {
    id: number;
    name: string;
}

interface TeamRanking {
    rank: number;
    teamId: number;
    teamName: string;
    projectName: string;
    trackId: number;
    trackName: string;
    finalScore: number;
}

const RankingTab: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const [rounds, setRounds] = useState<Round[]>([]);
    const [selectedRoundId, setSelectedRoundId] = useState<number | ''>('');
    const [rankings, setRankings] = useState<TeamRanking[]>([]);
    const [loadingRounds, setLoadingRounds] = useState(true);
    const [loadingRankings, setLoadingRankings] = useState(false);

    const [selectedTrackId, setSelectedTrackId] = useState<number | 'all'>('all');

    useEffect(() => {
        if (!eventId) return;
        const fetchRounds = async () => {
            try {
                const res = await api.get(`/rounds/hackathon/${eventId}`);
                const data = res.data.data ?? res.data;
                const list = Array.isArray(data) ? data : [];
                setRounds(list);
                // Auto-select first round
                if (list.length > 0) setSelectedRoundId(list[0].id);
            } catch {
                toast.error('Failed to load rounds.');
            } finally {
                setLoadingRounds(false);
            }
        };
        fetchRounds();
    }, [eventId]);

    useEffect(() => {
        if (!selectedRoundId) return;
        const fetchRankings = async () => {
            setLoadingRankings(true);
            try {
                const res = await api.get(`/rankings/round/${selectedRoundId}`);
                setRankings(res.data.data ?? []);
            } catch {
                toast.error('Failed to load rankings for this round.');
                setRankings([]);
            } finally {
                setLoadingRankings(false);
            }
        };
        fetchRankings();
    }, [selectedRoundId]);

    const handleExport = async () => {
        if (!selectedRoundId) return;
        const loadingToast = toast.loading('Exporting ranking to CSV...');
        try {
            const response = await api.get(`/export/ranking/round/${selectedRoundId}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `ranking-round-${selectedRoundId}.csv`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            toast.success('Export successful!', { id: loadingToast });
        } catch (err) {
            console.error('Failed to export:', err);
            toast.error('Failed to export ranking.', { id: loadingToast });
        }
    };

    // Compute unique tracks
    const uniqueTracks = useMemo(() => {
        const tracksMap = new Map<number, string>();
        rankings.forEach(r => {
            if (r.trackId && r.trackName) {
                tracksMap.set(r.trackId, r.trackName);
            }
        });
        return Array.from(tracksMap.entries()).map(([id, name]) => ({ id, name }));
    }, [rankings]);

    // Group rankings by track
    const rankingsByTrack = useMemo(() => {
        const groups = new Map<number, TeamRanking[]>();
        rankings.forEach(r => {
            const tId = r.trackId || 0; // fallback if no track
            if (!groups.has(tId)) {
                groups.set(tId, []);
            }
            groups.get(tId)!.push(r);
        });

        // Compute rank per track if the backend didn't already
        // (Assuming backend provides `r.rank`, but usually we sort by finalScore within track)
        groups.forEach(group => {
            group.sort((a, b) => b.finalScore - a.finalScore);
        });

        return groups;
    }, [rankings]);

    if (loadingRounds) return (
        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-500" size={28} /></div>
    );

    const rankIcons = ['🥇', '🥈', '🥉'];

    const renderRankingTable = (trackRankings: TeamRanking[], trackName?: string) => (
        <div key={trackName || 'unassigned'} className="mb-8">
            {trackName && (
                <h3 className="text-lg font-bold text-gray-800 mb-3 px-1 border-l-4 border-blue-500 pl-3">
                    {trackName} Track
                </h3>
            )}
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Team</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Final Score</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {trackRankings.map((r, idx) => (
                            <tr key={r.teamId} className={`${idx < 3 ? 'font-semibold' : ''} hover:bg-gray-50 transition-colors`}>
                                <td className="px-4 py-3 text-sm">
                                    {idx < 3
                                        ? <span className="text-lg">{rankIcons[idx]}</span>
                                        : <span className="text-gray-500">#{idx + 1}</span>
                                    }
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">{r.teamName}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">{r.projectName || '—'}</td>
                                <td className="px-4 py-3 text-sm text-right font-mono font-bold text-blue-700">
                                    {r.finalScore.toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <ListOrdered size={20} className="text-gray-600" />
                    <h2 className="text-xl font-semibold text-gray-800">Rankings</h2>
                </div>
                {selectedRoundId !== '' && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => ExportService.exportRoundScoring(Number(selectedRoundId))}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                        >
                            <Download size={14} /> Export Scoring
                        </button>
                        <button
                            onClick={() => ExportService.exportRoundRanking(Number(selectedRoundId))}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
                        >
                            <Download size={14} /> Export Ranking
                        </button>
                    </div>
                )}
            </div>

            {rounds.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                    <p className="text-sm">No rounds available. Create rounds first.</p>
                </div>
            ) : (
                <>
                    <div className="flex flex-wrap gap-4 mb-6">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Select Round</label>
                            <select
                                value={selectedRoundId}
                                onChange={e => setSelectedRoundId(Number(e.target.value))}
                                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[200px]"
                            >
                                {rounds.map(r => (
                                    <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                            </select>
                        </div>
                        
                        {uniqueTracks.length > 0 && (
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Filter by Track</label>
                                <select
                                    value={selectedTrackId}
                                    onChange={e => setSelectedTrackId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[200px]"
                                >
                                    <option value="all">All Tracks</option>
                                    {uniqueTracks.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {rankings.length > 0 && (
                            <div className="flex items-end">
                                <button
                                    onClick={handleExport}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
                                >
                                    <Download size={16} />
                                    Export CSV
                                </button>
                            </div>
                        )}
                    </div>

                    {loadingRankings ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="animate-spin text-blue-500" size={28} />
                        </div>
                    ) : rankings.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                            <Trophy className="mx-auto mb-2" size={36} />
                            <p className="text-sm">No scores submitted for this round yet.</p>
                        </div>
                    ) : (
                        <div>
                            {selectedTrackId === 'all' ? (
                                Array.from(rankingsByTrack.entries()).map(([tId, groupRanks]) => {
                                    const trackName = uniqueTracks.find(t => t.id === tId)?.name;
                                    return renderRankingTable(groupRanks, trackName);
                                })
                            ) : (
                                renderRankingTable(
                                    rankingsByTrack.get(selectedTrackId) || [], 
                                    uniqueTracks.find(t => t.id === selectedTrackId)?.name
                                )
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default RankingTab;

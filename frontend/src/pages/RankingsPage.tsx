import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { RankingService, Ranking } from '../services/RankingService';
import { RoundService, Round } from '../services/RoundService';
import { Trophy, Loader2, Medal, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

const RankingsPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [rankings, setRankings] = useState<Ranking[]>([]);
    const [rounds, setRounds] = useState<Round[]>([]);
    const [selectedRoundId, setSelectedRoundId] = useState<number | ''>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRounds = async () => {
            if (!slug) return;
            try {
                const eventRounds = await RoundService.getRoundsForEvent(slug);
                setRounds(eventRounds);
                if (eventRounds.length > 0) {
                    setSelectedRoundId(eventRounds[0].id);
                }
            } catch (err) {
                toast.error('Failed to fetch rounds for this event.');
            }
        };
        fetchRounds();
    }, [slug]);

    useEffect(() => {
        if (selectedRoundId) {
            fetchRankings(selectedRoundId);
        }
    }, [selectedRoundId]);

    const fetchRankings = async (roundId: number) => {
        setLoading(true);
        try {
            const allRankings = await RankingService.getRankingForRound(roundId);
            setRankings(allRankings);
        } catch (err: any) {
            console.error('Failed to fetch rankings:', err);
            setRankings([]);
            toast.error(err.response?.data?.message || 'No rankings found for this round.');
        } finally {
            setLoading(false);
        }
    };

    const handleRoundChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedRoundId(Number(e.target.value));
    };

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Trophy className="text-yellow-500" size={20} />;
        if (rank === 2) return <Medal className="text-gray-400" size={20} />;
        if (rank === 3) return <Medal className="text-orange-400" size={20} />;
        return <span className="text-gray-400 font-bold ml-1">{rank}</span>;
    };

    const selectedRound = rounds.find(r => r.id === selectedRoundId);
    const isGradingActive = selectedRound ? (() => {
        if (selectedRound.gradingEnded) return false;
        if (!selectedRound.gradingEndTime) return false;
        const now = new Date();
        const gradingEnd = new Date(selectedRound.gradingEndTime);
        const roundEnd = new Date(selectedRound.endTime);
        return now >= roundEnd && now < gradingEnd;
    })() : false;

    return (
        <div className="container mx-auto">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <TrendingUp className="text-blue-600" />
                        Leaderboard
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Real-time team standings based on judge scores.</p>
                </div>
                {rounds.length > 0 && (
                    <select
                        value={selectedRoundId}
                        onChange={handleRoundChange}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                        {rounds.map(round => (
                            <option key={round.id} value={round.id}>{round.name}</option>
                        ))}
                    </select>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                </div>
            ) : isGradingActive ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <Trophy className="mx-auto h-12 w-12 text-amber-500 animate-pulse mb-3" />
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Vòng thi đang trong thời gian chấm điểm</h3>
                    <p className="text-sm text-gray-500">Bảng xếp hạng của vòng {selectedRound?.name} sẽ tự động hiển thị sau khi thời gian chấm điểm kết thúc.</p>
                </div>
            ) : rankings.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <Trophy className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No rankings</h3>
                    <p className="mt-1 text-sm text-gray-500">Wait for judges to finish scoring to see the results.</p>
                </div>
            ) : (
                <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Rank</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Score</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {rankings.map((ranking) => (
                                    <tr key={ranking.teamId} className={`${ranking.rank <= 3 ? 'bg-blue-50/30' : ''} hover:bg-gray-50 transition-colors`}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm border border-gray-100">
                                                {getRankIcon(ranking.rank)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900">{ranking.teamName}</div>
                                            <div className="text-xs text-gray-400">Team ID: {ranking.teamId}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-lg font-bold text-blue-600">{ranking.totalScore.toFixed(2)}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="w-32 bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className={`h-2 rounded-full ${ranking.rank === 1 ? 'bg-yellow-400' : 'bg-blue-500'}`} 
                                                    style={{ width: `${Math.min(ranking.totalScore, 100)}%` }}
                                                ></div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RankingsPage;
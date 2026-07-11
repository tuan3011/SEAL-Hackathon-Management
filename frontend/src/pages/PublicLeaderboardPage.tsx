import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { Trophy } from 'lucide-react';

interface Ranking {
    rank: number;
    teamName: string;
    projectName: string;
    finalScore: number;
}

const PublicLeaderboardPage: React.FC = () => {
    const { eventId, roundId } = useParams<{ eventId: string, roundId: string }>(); // Assuming we might use eventId later
    const [rankings, setRankings] = useState<Ranking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!roundId) {
            setError("No round selected.");
            setLoading(false);
            return;
        }
        const fetchRankings = async () => {
            try {
                const response = await api.get(`/rankings/round/${roundId}`);
                setRankings(response.data.data);
            } catch (err) {
                setError('Failed to load leaderboard.');
            } finally {
                setLoading(false);
            }
        };
        fetchRankings();
    }, [roundId]);

    if (loading) return <div className="text-center p-8">Loading Leaderboard...</div>;
    if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Leaderboard</h1>
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-800 text-white">
                            <tr>
                                <th className="py-4 px-6 text-center font-semibold text-sm">Rank</th>
                                <th className="py-4 px-6 text-left font-semibold text-sm">Team</th>
                                <th className="py-4 px-6 text-left font-semibold text-sm">Project</th>
                                <th className="py-4 px-6 text-right font-semibold text-sm">Final Score</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {rankings.map((r, index) => (
                                <tr key={r.teamName} className={`hover:bg-gray-100 ${index < 3 ? 'font-bold' : ''}`}>
                                    <td className="py-4 px-6 text-center">
                                        <div className="flex items-center justify-center">
                                            {index < 3 ? (
                                                <Trophy size={24} className={
                                                    index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-400' : 'text-yellow-600'
                                                } />
                                            ) : (
                                                <span className="text-lg">{r.rank}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-gray-800">{r.teamName}</td>
                                    <td className="py-4 px-6 text-gray-600">{r.projectName}</td>
                                    <td className="py-4 px-6 text-right text-gray-800 text-lg">{r.finalScore.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PublicLeaderboardPage;

import React, { useEffect, useState } from 'react';
import { ScoreService, Score } from '../services/ScoreService';
import { Star, Loader2, Plus, UserCheck, ClipboardCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import Authorizable from '../components/Authorizable';
import { Role } from '../services/authUtils';

const ScoresPage: React.FC = () => {
    const [scores, setScores] = useState<Score[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchScores();
    }, []);

    const fetchScores = async () => {
        setLoading(true);
        try {
            // For now, fetching scores for submission 1.
            const allScores = await ScoreService.getScoresForSubmission(1);
            setScores(allScores);
        } catch (err) {
            console.error('Failed to fetch scores:', err);
            toast.error('Failed to fetch scores.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Star className="text-yellow-500 fill-yellow-500" />
                        Judging Scores
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Review project evaluations and judge feedback.</p>
                </div>
                
                <Authorizable allowedRoles={[Role.JUDGE, Role.GUEST_JUDGE]}>
                    <button
                        onClick={() => toast('Scoring functionality coming soon!', { icon: '🚧' })}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm flex items-center gap-2 transition-colors"
                    >
                        <Plus size={18} />
                        Add Scores
                    </button>
                </Authorizable>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                </div>
            ) : scores.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <Star className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No scores</h3>
                    <p className="mt-1 text-sm text-gray-500">This submission has not been scored yet.</p>
                </div>
            ) : (
                <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Criterion</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Judge</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {scores.map((score) => (
                                    <tr key={score.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center gap-2">
                                            <ClipboardCheck size={16} className="text-blue-400" />
                                            Criterion #{score.criterionId}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="text-lg font-bold text-gray-900 mr-1">{score.value}</div>
                                                <div className="text-xs text-gray-400">/ 100</div>
                                            </div>
                                            <div className="w-24 bg-gray-200 rounded-full h-1.5 mt-1">
                                                <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${score.value}%` }}></div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-gray-900">
                                                <UserCheck size={14} className="mr-2 text-gray-400" />
                                                Judge ID: {score.judgeId}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            Submission #{score.submissionId}
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

export default ScoresPage;
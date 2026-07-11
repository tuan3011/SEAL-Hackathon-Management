import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { ChevronLeft } from 'lucide-react';

interface Submission {
    id: number;
    teamId: number;
    teamName: string;
    roundId: number;
    roundName: string;
    trackId?: number;
    trackName?: string;
    repositoryUrl: string;
    demoUrl: string;
    submittedAt: string;
    scoreStatus?: string; // We'll compute this if possible
}

const AssignmentSubmissionsPage: React.FC = () => {
    const { assignmentId } = useParams<{ assignmentId: string }>();
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [assignment, setAssignment] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch the assignment details
                // The backend currently doesn't have GET /judge-assignments/{id} endpoint easily accessible,
                // so we fetch all my-assignments and find it.
                const assRes = await api.get('/judge-assignments/my-assignments');
                const assignments = assRes.data.data || [];
                const currentAss = assignments.find((a: any) => a.id === Number(assignmentId));
                
                if (!currentAss) {
                    setError('Assignment not found.');
                    setLoading(false);
                    return;
                }
                setAssignment(currentAss);

                // 2. Fetch submissions for the Round
                const subRes = await api.get(`/submissions/round/${currentAss.roundId}`);
                let subs = subRes.data.data || [];

                // 3. Filter by track if the assignment is restricted to a track
                if (currentAss.trackId) {
                    subs = subs.filter((s: any) => s.trackId === currentAss.trackId);
                }

                // 4. Fetch my scores for this round to see which submissions I have already scored
                let myScores = [];
                try {
                    const scoreRes = await api.get(`/scores/my-scores/round/${currentAss.roundId}`);
                    myScores = scoreRes.data.data || [];
                } catch (e) {
                    console.error('Failed to fetch my scores', e);
                }

                // Group scores by submissionId and calculate total
                const scoresBySub: Record<number, number> = {};
                myScores.forEach((score: any) => {
                    if (!scoresBySub[score.submissionId]) {
                        scoresBySub[score.submissionId] = 0;
                    }
                    scoresBySub[score.submissionId] += score.scoreValue;
                });

                // Attach scoreStatus to submissions
                const subsWithScores = subs.map((sub: any) => {
                    if (scoresBySub[sub.id] !== undefined) {
                        sub.scoreStatus = `Scored (${scoresBySub[sub.id]} pts)`;
                    } else {
                        sub.scoreStatus = 'Pending';
                    }
                    return sub;
                });

                setSubmissions(subsWithScores);
            } catch (err) {
                console.error(err);
                setError('Failed to fetch submissions for this assignment.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [assignmentId]);

    if (loading) return <div className="text-center p-8">Loading submissions...</div>;
    if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

    return (
        <div className="bg-white p-8 rounded-lg shadow-md max-w-5xl mx-auto">
            <div className="mb-6 flex items-center">
                <Link to="/judge/dashboard" className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-semibold">
                    <ChevronLeft size={16} className="mr-1" /> Back to Dashboard
                </Link>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Submissions for {assignment?.roundName}
            </h1>
            <p className="text-gray-600 mb-8">
                {assignment?.trackName ? `Track: ${assignment.trackName}` : 'All Tracks'}
            </p>

            {submissions.length === 0 ? (
                <div className="text-center p-8 bg-gray-50 rounded-lg text-gray-500">
                    No submissions found for this assignment yet.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="text-left py-3 px-4 font-semibold text-sm border-b">Team</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm border-b">Track</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm border-b">Submitted At</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm border-b">Status</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm border-b">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {submissions.map(sub => (
                                <tr key={sub.id} className="border-b hover:bg-gray-50">
                                    <td className="py-3 px-4">{sub.teamName}</td>
                                    <td className="py-3 px-4">{sub.trackName || 'N/A'}</td>
                                    <td className="py-3 px-4 text-sm text-gray-600">
                                        {new Date(sub.submittedAt).toLocaleString()}
                                    </td>
                                    <td className="py-3 px-4">
                                        {sub.scoreStatus && sub.scoreStatus.startsWith('Scored') ? (
                                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                                {sub.scoreStatus}
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                                                {sub.scoreStatus || 'Pending'}
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-3 px-4">
                                        <Link 
                                            to={`/judge/score/${sub.id}`}
                                            className={`px-4 py-2 text-white text-sm font-semibold rounded inline-block ${
                                                sub.scoreStatus && sub.scoreStatus.startsWith('Scored') 
                                                    ? 'bg-gray-600 hover:bg-gray-700' 
                                                    : 'bg-blue-600 hover:bg-blue-700'
                                            }`}
                                        >
                                            {sub.scoreStatus && sub.scoreStatus.startsWith('Scored') ? 'Edit Score' : 'Score Now'}
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AssignmentSubmissionsPage;

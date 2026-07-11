import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { JudgeAssignmentService, JudgeAssignment } from '../../services/JudgeAssignmentService';
import api from '../../services/api';
import { ChevronDown, ChevronUp, Download } from 'lucide-react';
import { ExportService } from '../../services/ExportService';

const JudgeDashboardPage: React.FC = () => {
    const [assignments, setAssignments] = useState<JudgeAssignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [currentRoundData, setCurrentRoundData] = useState<any>(null);
    const [loadingSubmissions, setLoadingSubmissions] = useState(false);

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const data = await JudgeAssignmentService.getMyAssignments();
                setAssignments(data);
            } catch (err) {
                setError('Failed to fetch your assignments.');
            } finally {
                setLoading(false);
            }
        };
        fetchAssignments();
    }, []);

    const toggleRound = async (roundId: number, trackId?: number) => {
        const rowId = `${roundId}-${trackId || 'all'}`;
        if (expandedRowId === rowId) {
            setExpandedRowId(null);
            return;
        }
        setExpandedRowId(rowId);
        setLoadingSubmissions(true);
        try {
            const [response, roundRes] = await Promise.all([
                api.get(`/submissions/round/${roundId}`),
                api.get(`/rounds/${roundId}`)
            ]);
            let allSubs = response.data.data || [];
            if (trackId) {
                allSubs = allSubs.filter((s: any) => s.trackId === trackId);
            }
            setSubmissions(allSubs);
            setCurrentRoundData(roundRes.data.data);
        } catch (err) {
            console.error("Failed to fetch submissions for round", err);
        } finally {
            setLoadingSubmissions(false);
        }
    };

    if (loading) return <div className="text-center p-8">Loading your assignments...</div>;
    if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

    return (
        <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Your Judging Assignments</h1>
                {assignments.length > 0 && (
                    <button
                        onClick={() => ExportService.exportMyScores()}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors shadow-sm"
                        title="Export All My Scores CSV"
                    >
                        <Download size={18} /> Export All My Scores
                    </button>
                )}
            </div>
            {assignments.length === 0 ? (
                <p className="text-gray-500">You have no pending assignments.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Round</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Assigned</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assignments.map(ass => (
                                <React.Fragment key={ass.id}>
                                    <tr className="border-b">
                                        <td className="py-3 px-4">
                                            {ass.roundName}
                                            {ass.trackName && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{ass.trackName}</span>}
                                        </td>
                                        <td className="py-3 px-4">{new Date(ass.assignedAt).toLocaleDateString()}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                ass.status === 'COMPLETED' ? 'bg-green-100 text-green-800 border border-green-200' : 
                                                ass.status === 'DRAFT' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                                                'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                            }`}>
                                                {ass.status || 'ASSIGNED'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex gap-3 items-center">
                                                <button
                                                    onClick={() => toggleRound(ass.roundId, ass.trackId)}
                                                    className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                                                >
                                                    {expandedRowId === `${ass.roundId}-${ass.trackId || 'all'}` ? (
                                                        <><ChevronUp size={16} /> Hide Submissions</>
                                                    ) : (
                                                        <><ChevronDown size={16} /> View Submissions</>
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    {expandedRowId === `${ass.roundId}-${ass.trackId || 'all'}` && (
                                        <tr className="bg-gray-50 border-b">
                                            <td colSpan={4} className="py-4 px-6">
                                                {loadingSubmissions ? (
                                                    <p className="text-gray-500">Loading submissions...</p>
                                                ) : submissions.length === 0 ? (
                                                    <p className="text-gray-500">No submissions found for this round.</p>
                                                ) : (
                                                    <div className="space-y-3">
                                                        <h4 className="font-semibold text-gray-700">Submissions to evaluate:</h4>
                                                        {currentRoundData && (() => {
                                                            const now = new Date();
                                                            const roundEnd = currentRoundData.endTime ? new Date(currentRoundData.endTime) : null;
                                                            const gradEnd = currentRoundData.gradingEndTime ? new Date(currentRoundData.gradingEndTime) : null;
                                                            
                                                            const isBeforeGrading = roundEnd && now < roundEnd;
                                                            const isAfterGrading = (gradEnd && now > gradEnd) || currentRoundData.gradingEnded;
                                                            
                                                            if (isBeforeGrading) {
                                                                return <div className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded border border-yellow-200">The round is still active. Grading will open after {roundEnd.toLocaleString()}.</div>;
                                                            } else if (isAfterGrading) {
                                                                return <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">The grading period has ended for this round.</div>;
                                                            }
                                                            return null;
                                                        })()}
                                                        <ul className="space-y-2">
                                                            {submissions.map(sub => {
                                                                const now = new Date();
                                                                const roundEnd = currentRoundData?.endTime ? new Date(currentRoundData.endTime) : null;
                                                                const gradEnd = currentRoundData?.gradingEndTime ? new Date(currentRoundData.gradingEndTime) : null;
                                                                const canScore = (!roundEnd || now >= roundEnd) && (!gradEnd || now <= gradEnd) && !currentRoundData?.gradingEnded;

                                                                return (
                                                                    <li key={sub.id} className="flex items-center justify-between bg-white p-3 rounded border border-gray-200">
                                                                        <span className="font-medium text-gray-800">{sub.teamName}</span>
                                                                        {canScore ? (
                                                                            <Link
                                                                                to={`/judge/score/${sub.id}`}
                                                                                className="px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                                                                            >
                                                                                Score Now
                                                                            </Link>
                                                                        ) : (
                                                                            <span
                                                                                className="px-3 py-1 bg-gray-300 text-gray-500 rounded text-sm font-medium cursor-not-allowed"
                                                                                title="Grading is not currently available"
                                                                            >
                                                                                Score Now
                                                                            </span>
                                                                        )}
                                                                    </li>
                                                                );
                                                            })}
                                                        </ul>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default JudgeDashboardPage;

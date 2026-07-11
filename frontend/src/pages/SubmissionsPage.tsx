import React, { useEffect, useState } from 'react';
import { SubmissionService, Submission } from '../services/SubmissionService';
import { FileText, Loader2, Plus, ExternalLink, Clock, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import Authorizable from '../components/Authorizable';
import { Role } from '../services/authUtils';

const SubmissionsPage: React.FC = () => {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            // For now, fetching submissions for round 1.
            const allSubmissions = await SubmissionService.getSubmissionsByRound(1);
            setSubmissions(allSubmissions);
        } catch (err) {
            console.error('Failed to fetch submissions:', err);
            toast.error('Failed to fetch submissions.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <FileText className="text-green-600" />
                        Project Submissions
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Review and manage team project submissions.</p>
                </div>
                
                <Authorizable allowedRoles={[Role.TEAM_MEMBER]}>
                    <button
                        onClick={() => toast('Submission functionality coming soon!', { icon: '🚧' })}
                        className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm flex items-center gap-2 transition-colors"
                    >
                        <Plus size={18} />
                        New Submission
                    </button>
                </Authorizable>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                </div>
            ) : submissions.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <FileText className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No submissions</h3>
                    <p className="mt-1 text-sm text-gray-500">No projects have been submitted for this round yet.</p>
                </div>
            ) : (
                <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submission</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted At</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {submissions.map((submission) => (
                                    <tr key={submission.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                                <FileText size={16} className="text-gray-400" />
                                                Submission #{submission.id}
                                            </div>
                                            <div className="text-sm text-gray-500 max-w-md truncate" title={submission.content}>
                                                {submission.content}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-gray-900">
                                                <Users size={14} className="mr-2 text-gray-400" />
                                                Team {submission.teamId}
                                            </div>
                                            <div className="text-xs text-gray-400">Round {submission.roundId}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-xs text-gray-900 flex items-center gap-1">
                                                <Clock size={12} className="text-gray-400" />
                                                {new Date(submission.submittedAt).toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button 
                                                onClick={() => toast('View details coming soon!', { icon: '🔍' })}
                                                className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                                            >
                                                <ExternalLink size={14} />
                                                View
                                            </button>
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

export default SubmissionsPage;
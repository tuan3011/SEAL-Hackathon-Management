import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MentorshipRequestService, MentorshipRequest } from '../../services/MentorshipRequestService';
import toast from 'react-hot-toast';
import Modal from '../../components/Modal';
import { RefreshCcw } from 'lucide-react';

const MentorDashboardPage: React.FC = () => {
    const [myRequests, setMyRequests] = useState<MentorshipRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedRequest, setSelectedRequest] = useState<MentorshipRequest | null>(null);
    const [answerText, setAnswerText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchMyRequests = async () => {
        try {
            setLoading(true);
            const response = await MentorshipRequestService.getMyRequests();
            setMyRequests(response);
        } catch (err) {
            setError('Failed to fetch your mentorship sessions.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyRequests();
    }, []);

    const handleSendAnswer = async () => {
        if (!selectedRequest) return;
        if (!answerText.trim()) {
            toast.error('Please enter your answer.');
            return;
        }

        try {
            setIsSubmitting(true);
            await MentorshipRequestService.resolveRequest(selectedRequest.id, { answer: answerText });
            toast.success('Answer sent successfully! Request resolved.');
            setSelectedRequest(null);
            setAnswerText('');
            fetchMyRequests();
        } catch (err: any) {
            toast.error(err.response?.data?.error?.message || 'Failed to send answer.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReleaseRequest = async () => {
        if (!selectedRequest) return;
        if (!window.confirm('Are you sure you want to release this request back to the pool?')) return;
        
        try {
            setIsSubmitting(true);
            await MentorshipRequestService.releaseRequest(selectedRequest.id);
            toast.success('Request released back to the pool.');
            setSelectedRequest(null);
            fetchMyRequests();
        } catch (err: any) {
            toast.error(err.response?.data?.error?.message || 'Failed to release the request.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="text-center p-8">Loading your mentorship sessions...</div>;
    if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

    return (
        <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Your Mentorship Sessions</h1>
                <Link to="/mentor/requests" className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                    View Open Requests
                </Link>
            </div>
            {myRequests.length === 0 ? (
                <p className="text-gray-500">You have no active mentorship sessions.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Team</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Request Title</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myRequests.map(req => (
                                <tr key={req.id} className="border-b">
                                    <td className="py-3 px-4">
                                        {req.team?.name || (req as any).teamName || 'Unknown'}
                                        {req.trackName && (
                                            <span className="ml-2 px-2 py-0.5 text-[10px] font-bold uppercase bg-blue-50 text-blue-600 border border-blue-200 rounded-full">
                                                {req.trackName}
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-3 px-4">{req.title}</td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                            req.status === 'RESOLVED' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                        }`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <button 
                                            className="text-blue-600 hover:text-blue-800 font-semibold"
                                            onClick={() => {
                                                setSelectedRequest(req);
                                                setAnswerText('');
                                            }}
                                        >
                                            {req.status === 'RESOLVED' ? 'View Details' : 'Reply'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal
                isOpen={!!selectedRequest}
                onClose={() => {
                    if (!isSubmitting) setSelectedRequest(null);
                }}
                title={selectedRequest?.status === 'RESOLVED' ? 'Session Details' : 'Reply to Mentorship Request'}
            >
                {selectedRequest && (
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-semibold text-gray-500 uppercase">Team Name</p>
                            <p className="text-gray-900 font-medium">
                                {selectedRequest.team?.name || (selectedRequest as any).teamName}
                                {selectedRequest.trackName && (
                                    <span className="ml-2 text-xs font-semibold uppercase tracking-wider text-blue-600 px-2 py-0.5 bg-blue-50 border border-blue-100 rounded-full">
                                        {selectedRequest.trackName}
                                    </span>
                                )}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-500 uppercase">Request Title</p>
                            <p className="text-gray-900 font-medium">{selectedRequest.title}</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-500 uppercase">Description</p>
                            <p className="text-gray-900">{selectedRequest.description}</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-500 uppercase">Status</p>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                selectedRequest.status === 'RESOLVED' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                                {selectedRequest.status}
                            </span>
                        </div>

                        {selectedRequest.status !== 'RESOLVED' && (
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Your Answer / Feedback
                                </label>
                                <textarea
                                    className="w-full border border-gray-300 rounded-lg p-3 min-h-[120px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                                    placeholder="Type your answer here..."
                                    value={answerText}
                                    onChange={(e) => setAnswerText(e.target.value)}
                                    disabled={isSubmitting}
                                />
                                <div className="flex justify-end gap-3 mt-4">
                                    <button
                                        type="button"
                                        className="px-4 py-2 text-sm font-medium text-amber-700 bg-amber-100 rounded-lg hover:bg-amber-200 transition-colors flex items-center gap-2"
                                        onClick={handleReleaseRequest}
                                        disabled={isSubmitting}
                                    >
                                        <RefreshCcw size={16} />
                                        Release Task
                                    </button>
                                    <button
                                        type="button"
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                        onClick={() => setSelectedRequest(null)}
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                                        onClick={handleSendAnswer}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Sending...' : 'Send Answer'}
                                    </button>
                                </div>
                            </div>
                        )}
                        {selectedRequest.status === 'RESOLVED' && (
                            <div className="flex justify-end mt-4">
                                <button
                                    type="button"
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                    onClick={() => setSelectedRequest(null)}
                                >
                                    Close
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default MentorDashboardPage;

import React, { useState, useEffect } from 'react';
import { MentorshipRequestService, MentorshipRequest } from '../../services/MentorshipRequestService';
import toast from 'react-hot-toast';
import { HelpCircle, Check, X } from 'lucide-react';
import Modal from '../../components/Modal';

const MentorRequestsPage: React.FC = () => {
    const [openRequests, setOpenRequests] = useState<MentorshipRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Decline Modal State
    const [declineRequestId, setDeclineRequestId] = useState<number | null>(null);
    const [declineReason, setDeclineReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchOpenRequests = async () => {
        try {
            setLoading(true);
            const response = await MentorshipRequestService.getOpenRequests();
            setOpenRequests(response);
        } catch (err) {
            setError('Failed to fetch open mentorship requests.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOpenRequests();
    }, []);

    const handleAccept = async (requestId: number) => {
        try {
            await MentorshipRequestService.acceptRequest(requestId);
            toast.success('Request accepted! It has been added to your dashboard.');
            fetchOpenRequests(); // Refresh the list
        } catch (err: any) {
            toast.error(err.response?.data?.error?.message || 'Failed to accept the request.');
        }
    };

    const handleDeclineSubmit = async () => {
        if (!declineRequestId) return;
        if (!declineReason.trim()) {
            toast.error('Please enter a reason for declining.');
            return;
        }

        try {
            setIsSubmitting(true);
            await MentorshipRequestService.rejectRequest(declineRequestId, { reason: declineReason });
            toast.success('Request declined.');
            setDeclineRequestId(null);
            setDeclineReason('');
            fetchOpenRequests();
        } catch (err: any) {
            toast.error(err.response?.data?.error?.message || 'Failed to decline the request.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="text-center p-8">Loading open requests...</div>;
    if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

    return (
        <div className="bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <HelpCircle className="mr-3 text-blue-500" />
                Open Mentorship Requests
            </h1>
            {openRequests.length === 0 ? (
                <p className="text-gray-500">There are no open requests for mentorship at the moment.</p>
            ) : (
                <ul className="space-y-4">
                    {openRequests.map(req => (
                        <li key={req.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                            <div>
                                <p className="font-semibold text-lg">{req.title}</p>
                                <p className="text-sm text-gray-600">
                                    {/* Handle both new nested team object or old teamName string gracefully */}
                                    From team <span className="font-bold">{req.team?.name || (req as any).teamName || 'Unknown Team'}</span>
                                </p>
                                <p className="mt-2 text-gray-700">{req.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => handleAccept(req.id)}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                                    title="Accept Request"
                                >
                                    <Check size={16} />
                                    Accept
                                </button>
                                <button 
                                    onClick={() => {
                                        setDeclineRequestId(req.id);
                                        setDeclineReason('');
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                                    title="Decline Request"
                                >
                                    <X size={16} />
                                    Decline
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {/* Decline Modal */}
            <Modal
                isOpen={declineRequestId !== null}
                onClose={() => {
                    if (!isSubmitting) {
                        setDeclineRequestId(null);
                        setDeclineReason('');
                    }
                }}
                title="Decline Mentorship Request"
            >
                <div className="space-y-4 mt-4">
                    <p className="text-sm text-gray-600">
                        Please provide a reason for declining this request. This will be sent to the team leader.
                    </p>
                    <textarea
                        className="w-full border border-gray-300 rounded-lg p-3 min-h-[120px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                        placeholder="Type your reason here..."
                        value={declineReason}
                        onChange={(e) => setDeclineReason(e.target.value)}
                        disabled={isSubmitting}
                    />
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            onClick={() => {
                                setDeclineRequestId(null);
                                setDeclineReason('');
                            }}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                            onClick={handleDeclineSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Declining...' : 'Confirm Decline'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default MentorRequestsPage;

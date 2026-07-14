import React, { useState, useEffect, useMemo } from 'react';
import { MentorshipRequestService, MentorshipRequest } from '../../services/MentorshipRequestService';
import Modal from '../../components/Modal';
import RequestMentorshipModal from '../../components/mentorship/RequestMentorshipModal';
import { HelpCircle, Plus, Info, Trash2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { HackathonEventService } from '../../services/HackathonEventService';
import api from '../../services/api';
import { Team } from '../../services/TeamService';
import axios from 'axios';
import toast from 'react-hot-toast';

const MyMentorshipRequestsPage: React.FC = () => {
    const [requests, setRequests] = useState<MentorshipRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedRequest, setSelectedRequest] = useState<MentorshipRequest | null>(null);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [myTeams, setMyTeams] = useState<Team[]>([]);

    const fetchMyRequests = async () => {
        try {
            setLoading(true);
            const response = await MentorshipRequestService.getMyRequests();
            setRequests(response);

            const events = await HackathonEventService.getHackathonEvents(0, 50);
            const teams = [];
            if (Array.isArray(events)) {
                for (const ev of events) {
                    try {
                        const res = await api.get(`/teams/my-team/event/${ev.id}`);
                        if (res.data?.data?.id) {
                            teams.push({ ...res.data.data, eventName: ev.name });
                        }
                    } catch { /* ignore fallback */ }
                }
            }
            setMyTeams(teams);
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.status === 404 && err.response?.data?.error?.message?.includes('not in any team')) {
                setError('not_in_team');
            } else {
                setError('Failed to fetch your mentorship requests.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyRequests();
    }, []);

    const handleCancelRequest = async (id: number) => {
        if (!window.confirm('Are you sure you want to cancel this mentorship request?')) return;
        
        setIsCancelling(true);
        try {
            await MentorshipRequestService.cancelRequest(id);
            toast.success('Mentorship request cancelled successfully.');
            setSelectedRequest(null);
            fetchMyRequests();
        } catch (err: any) {
            toast.error(err.response?.data?.error?.message || 'Failed to cancel the request.');
        } finally {
            setIsCancelling(false);
        }
    };

    const summary = useMemo(() => {
        return requests.reduce(
            (acc, req) => {
                acc[req.status] = (acc[req.status] || 0) + 1;
                return acc;
            },
            { OPEN: 0, IN_PROGRESS: 0, RESOLVED: 0, REJECTED: 0, CANCELLED: 0 } as Record<string, number>
        );
    }, [requests]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'RESOLVED': return 'bg-green-100 text-green-800 border-green-200';
            case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
            case 'CANCELLED': return 'bg-gray-100 text-gray-600 border-gray-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    if (loading) return <div className="text-center p-8 text-gray-500">Loading your mentorship requests...</div>;
    
    if (error === 'not_in_team') {
        return (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm max-w-2xl mx-auto mt-8">
                <Users className="mx-auto h-16 w-16 text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-gray-800 mb-2">You are not currently in a team</h3>
                <p className="text-gray-500 mb-6">Create or join a team before using this feature.</p>
                <Link 
                    to="/my-team"
                    className="inline-flex items-center justify-center px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                    Go to My Team
                </Link>
            </div>
        );
    }
    
    if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

    const hasFinalizedTeam = myTeams.some(t => t.status === 'FINALIZED');

    return (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            {/* Header & Info Card */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                    <HelpCircle className="mr-3 text-blue-500" />
                    Mentorship Sessions
                </h1>
                <div className="flex flex-col items-end gap-1">
                    <button 
                        onClick={() => setIsRequestModalOpen(true)}
                        disabled={myTeams.length > 0 && !hasFinalizedTeam}
                        className={`flex items-center gap-2 px-5 py-2.5 text-white font-semibold rounded-lg shadow-sm transition-colors ${
                            myTeams.length > 0 && !hasFinalizedTeam
                                ? 'bg-gray-400 cursor-not-allowed opacity-70'
                                : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        <Plus size={20} />
                        Request Mentorship
                    </button>
                    {myTeams.length > 0 && !hasFinalizedTeam && (
                        <p className="text-sm font-medium text-red-500 mt-1">Your team must be finalized before requesting mentorship.</p>
                    )}
                </div>
            </div>

            <div className="mb-8 p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-3">
                <Info className="text-blue-500 mt-0.5 shrink-0" size={20} />
                <p className="text-blue-900 text-sm leading-relaxed font-medium">
                    Need technical help? Submit a mentorship request. Your request will be sent to the mentor pool. The first available mentor in your track will assist you.
                </p>
            </div>

            {/* Status Summary */}
            {requests.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg text-center">
                        <p className="text-yellow-600 text-sm font-semibold uppercase">Open</p>
                        <p className="text-3xl font-bold text-yellow-700">{summary.OPEN}</p>
                    </div>
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg text-center">
                        <p className="text-blue-600 text-sm font-semibold uppercase">In Progress</p>
                        <p className="text-3xl font-bold text-blue-700">{summary.IN_PROGRESS}</p>
                    </div>
                    <div className="p-4 bg-green-50 border border-green-100 rounded-lg text-center">
                        <p className="text-green-600 text-sm font-semibold uppercase">Resolved</p>
                        <p className="text-3xl font-bold text-green-700">{summary.RESOLVED}</p>
                    </div>
                    <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-center">
                        <p className="text-red-600 text-sm font-semibold uppercase">Rejected</p>
                        <p className="text-3xl font-bold text-red-700">{summary.REJECTED}</p>
                    </div>
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                        <p className="text-gray-600 text-sm font-semibold uppercase">Cancelled</p>
                        <p className="text-3xl font-bold text-gray-700">{summary.CANCELLED}</p>
                    </div>
                </div>
            )}

            {requests.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <p className="text-gray-500 font-medium">Your team has not made any mentorship requests yet.</p>
                </div>
            ) : (
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="min-w-full bg-white text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="text-left py-3 px-4 font-semibold text-gray-700 uppercase tracking-wider text-xs">Title</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-700 uppercase tracking-wider text-xs">Mentor</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-700 uppercase tracking-wider text-xs">Status</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-700 uppercase tracking-wider text-xs">Created At</th>
                                <th className="text-right py-3 px-4 font-semibold text-gray-700 uppercase tracking-wider text-xs">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {requests.map(req => (
                                <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-4 px-4 font-medium text-gray-900 max-w-xs truncate">{req.title}</td>
                                    <td className="py-4 px-4 text-gray-600">{req.mentorName || <span className="italic text-gray-400">Unassigned</span>}</td>
                                    <td className="py-4 px-4">
                                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${getStatusColor(req.status)}`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-gray-600">{new Date(req.createdAt).toLocaleDateString()}</td>
                                    <td className="py-4 px-4 text-right">
                                        <button 
                                            className="text-blue-600 hover:text-blue-800 font-semibold text-sm hover:underline"
                                            onClick={() => setSelectedRequest(req)}
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Request Mentorship Modal */}
            <RequestMentorshipModal 
                isOpen={isRequestModalOpen}
                onClose={() => setIsRequestModalOpen(false)}
                onSuccess={() => {
                    setIsRequestModalOpen(false);
                    fetchMyRequests(); // Refresh list after successful submit
                }}
                myTeams={myTeams}
            />

            {/* View Details Modal */}
            <Modal
                isOpen={!!selectedRequest}
                onClose={() => { if (!isCancelling) setSelectedRequest(null); }}
                title="Mentorship Request Details"
            >
                {selectedRequest && (
                    <div className="space-y-5 mt-2">
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex justify-between items-center">
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Topic</p>
                                <p className="text-gray-900 font-semibold text-lg">{selectedRequest.title}</p>
                            </div>
                            {selectedRequest.trackName && (
                                <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full">
                                    {selectedRequest.trackName}
                                </span>
                            )}
                        </div>
                        
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Description</p>
                            <div className="bg-white p-4 rounded-lg border border-gray-200 text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">
                                {selectedRequest.description || <span className="text-gray-400 italic">No description provided.</span>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Status</p>
                                <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-full border ${getStatusColor(selectedRequest.status)}`}>
                                    {selectedRequest.status}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Assigned Mentor</p>
                                <p className="text-gray-900 font-medium">{selectedRequest.mentorName || 'None'}</p>
                            </div>
                        </div>

                        {selectedRequest.status === 'RESOLVED' && selectedRequest.answer && (
                            <div className="mt-4 p-5 bg-green-50 border border-green-200 rounded-lg shadow-inner">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    <p className="text-sm font-bold text-green-900 uppercase tracking-wider">Mentor's Answer</p>
                                </div>
                                <p className="text-gray-900 whitespace-pre-wrap text-sm leading-relaxed">{selectedRequest.answer}</p>
                            </div>
                        )}

                        {selectedRequest.status === 'REJECTED' && selectedRequest.rejectReason && (
                            <div className="mt-4 p-5 bg-red-50 border border-red-200 rounded-lg shadow-inner">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                    <p className="text-sm font-bold text-red-900 uppercase tracking-wider">Reason for Decline</p>
                                </div>
                                <p className="text-gray-900 whitespace-pre-wrap text-sm leading-relaxed">{selectedRequest.rejectReason}</p>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                            {selectedRequest.status === 'OPEN' && (
                                <button
                                    type="button"
                                    className="px-5 py-2 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
                                    onClick={() => handleCancelRequest(selectedRequest.id)}
                                    disabled={isCancelling}
                                >
                                    {isCancelling ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                    ) : (
                                        <Trash2 size={16} />
                                    )}
                                    {isCancelling ? 'Cancelling...' : 'Cancel Request'}
                                </button>
                            )}
                            <button
                                type="button"
                                className="px-5 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
                                onClick={() => setSelectedRequest(null)}
                                disabled={isCancelling}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default MyMentorshipRequestsPage;

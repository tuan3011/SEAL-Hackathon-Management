import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Mail, Check, X, Inbox } from 'lucide-react';
import Skeleton from '../../components/Skeleton';

interface Invitation {
    id: number;
    teamName: string;
    inviterName: string;
    createdAt: string;
}

const InvitationsPage: React.FC = () => {
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchInvitations = async () => {
        try {
            setLoading(true);
            const response = await api.get('/team-invitations/pending');
            setInvitations(response.data.data);
        } catch (err) {
            setError('Failed to fetch invitations.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvitations();
    }, []);

    const handleResponse = async (invitationId: number, response: 'ACCEPTED' | 'DECLINED') => {
        try {
            await api.post(`/team-invitations/${invitationId}/respond`, { response });
            toast.success(`Invitation ${response.toLowerCase()}!`);
            fetchInvitations(); // Refresh the list
        } catch (err: any) {
            toast.error(err.response?.data?.error?.message || 'Failed to respond to invitation.');
        }
    };

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto">
                <Skeleton type="card" lines={3} className="h-48" />
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="max-w-3xl mx-auto p-6 bg-red-50 border border-red-200 rounded-xl text-center text-sm text-red-600">
                {error}
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto bg-white p-6 md:p-8 border border-outline-variant rounded-xl shadow-sm space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-on-surface tracking-tight flex items-center gap-2">
                    <Mail className="text-primary-container" />
                    Your Invitations
                </h1>
                <p className="text-sm text-on-surface-variant mt-1">Review and respond to pending team join requests.</p>
            </div>

            {invitations.length === 0 ? (
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-10 text-center space-y-3">
                    <Inbox className="mx-auto h-12 w-12 text-slate-300" />
                    <p className="text-sm font-semibold text-on-surface">No Pending Invitations</p>
                    <p className="text-xs text-on-surface-variant">When other teams invite you, they will appear here.</p>
                </div>
            ) : (
                <ul className="space-y-3">
                    {invitations.map(inv => (
                        <li key={inv.id} className="flex items-center justify-between bg-slate-50 border border-slate-100 p-4 rounded-xl hover:bg-slate-100/50 transition-colors gap-4">
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-on-surface leading-normal">
                                    <span className="text-primary font-bold">{inv.inviterName}</span> has invited you to join <span className="text-primary font-bold">{inv.teamName}</span>.
                                </p>
                                <p className="text-xs text-on-surface-variant mt-1">
                                    Received on {new Date(inv.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <button 
                                    onClick={() => handleResponse(inv.id, 'ACCEPTED')}
                                    className="p-2 text-white bg-green-500 rounded-full hover:bg-green-600 transition-colors shadow-sm flex items-center justify-center cursor-pointer"
                                    title="Accept"
                                >
                                    <Check size={18} />
                                </button>
                                <button 
                                    onClick={() => handleResponse(inv.id, 'DECLINED')}
                                    className="p-2 text-white bg-red-500 rounded-full hover:bg-red-600 transition-colors shadow-sm flex items-center justify-center cursor-pointer"
                                    title="Decline"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default InvitationsPage;

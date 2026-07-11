import React, { useState, useEffect } from 'react';
import { SupportTicketService, SupportTicketResponse } from '../services/SupportTicketService';
import { Loader2, CheckCircle, Mail, User, Clock, AlertCircle } from 'lucide-react';

const SupportTicketsPage: React.FC = () => {
    const [tickets, setTickets] = useState<SupportTicketResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
    const [replyingId, setReplyingId] = useState<number | null>(null);
    const [replyMessage, setReplyMessage] = useState<string>('');

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const data = await SupportTicketService.getAllTickets(0, 50); // Fetch first 50 for now
            setTickets(data || []);
        } catch (error) {
            console.error("Failed to fetch tickets", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const handleResolve = async (id: number) => {
        try {
            setActionLoadingId(id);
            await SupportTicketService.resolveTicket(id);
            setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'RESOLVED' } : t));
        } catch (error) {
            console.error("Failed to resolve ticket", error);
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleReply = async (id: number) => {
        if (!replyMessage.trim()) return;
        try {
            setActionLoadingId(id);
            await SupportTicketService.replyTicket(id, replyMessage);
            setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'RESOLVED' } : t));
            setReplyingId(null);
            setReplyMessage('');
        } catch (error) {
            console.error("Failed to reply to ticket", error);
        } finally {
            setActionLoadingId(null);
        }
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
                <p className="text-gray-500 mt-1">Manage help requests submitted from the landing page.</p>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 size={40} className="animate-spin text-blue-500" />
                </div>
            ) : tickets.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">All caught up!</h3>
                    <p className="text-gray-500 mt-1">There are no support tickets right now.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {tickets.map(ticket => (
                        <div key={ticket.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 transition-all hover:shadow-md">
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-max ${
                                            ticket.status === 'PENDING' 
                                                ? 'bg-amber-100 text-amber-700' 
                                                : 'bg-green-100 text-green-700'
                                        }`}>
                                            {ticket.status === 'PENDING' ? <AlertCircle size={12} /> : <CheckCircle size={12} />}
                                            {ticket.status}
                                        </span>
                                        <span className="text-sm text-gray-500 flex items-center gap-1">
                                            <Clock size={14} />
                                            {new Date(ticket.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                    
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm mb-4 bg-gray-50 p-3 rounded-lg">
                                        <div className="flex items-center gap-2 font-medium text-gray-900">
                                            <User size={16} className="text-gray-400" />
                                            {ticket.fullName}
                                        </div>
                                        <div className="hidden sm:block text-gray-300">|</div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Mail size={16} className="text-gray-400" />
                                            <a href={`mailto:${ticket.email}`} className="text-blue-600 hover:underline">
                                                {ticket.email}
                                            </a>
                                        </div>
                                    </div>
                                    
                                    <div className="text-gray-800 text-sm bg-blue-50/50 p-4 rounded-lg border border-blue-100 whitespace-pre-wrap">
                                        <p className="font-semibold text-blue-900 mb-1 text-xs uppercase tracking-wide">Message:</p>
                                        {ticket.message}
                                    </div>
                                </div>

                                <div>
                                    {ticket.status === 'PENDING' && (
                                        <div className="flex flex-col gap-2 min-w-[200px]">
                                            {replyingId === ticket.id ? (
                                                <div className="flex flex-col gap-2">
                                                    <textarea 
                                                        className="w-full text-sm p-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none resize-none" 
                                                        rows={3} 
                                                        placeholder="Type your reply here..."
                                                        value={replyMessage}
                                                        onChange={(e) => setReplyMessage(e.target.value)}
                                                        disabled={actionLoadingId === ticket.id}
                                                    />
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleReply(ticket.id)}
                                                            disabled={actionLoadingId === ticket.id || !replyMessage.trim()}
                                                            className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-1 disabled:opacity-70 disabled:cursor-not-allowed"
                                                        >
                                                            {actionLoadingId === ticket.id ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
                                                            Send Reply
                                                        </button>
                                                        <button
                                                            onClick={() => { setReplyingId(null); setReplyMessage(''); }}
                                                            disabled={actionLoadingId === ticket.id}
                                                            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => { setReplyingId(ticket.id); setReplyMessage(''); }}
                                                        className="w-full px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <Mail size={16} />
                                                        Reply by Email
                                                    </button>
                                                    <button
                                                        onClick={() => handleResolve(ticket.id)}
                                                        disabled={actionLoadingId === ticket.id}
                                                        className="w-full px-4 py-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                                    >
                                                        {actionLoadingId === ticket.id ? (
                                                            <Loader2 size={16} className="animate-spin" />
                                                        ) : (
                                                            <CheckCircle size={16} />
                                                        )}
                                                        Mark Resolved (No Reply)
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SupportTicketsPage;

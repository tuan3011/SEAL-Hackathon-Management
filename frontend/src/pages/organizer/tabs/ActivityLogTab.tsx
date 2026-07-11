import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../../services/api';
import { History, Loader2, User } from 'lucide-react';

interface AuditLog {
    id: number;
    userId: number | null;
    username: string;
    action: string;
    details: string;
    createdAt: string;
}

const ActivityLogTab: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const fetchLogs = async (pageNum: number, append = false) => {
        if (pageNum === 0) setLoading(true);
        else setLoadingMore(true);
        try {
            const response = await api.get(`/audit-logs/event/${eventId}?page=${pageNum}&size=10`);
            const responseData = response.data;
            const content = responseData.data || [];
            const pagination = responseData.pagination;
            if (append) {
                setLogs(prev => [...prev, ...content]);
            } else {
                setLogs(content);
            }
            if (pagination) {
                setHasMore(pagination.page + 1 < pagination.totalPages);
            } else {
                setHasMore(false);
            }
            setPage(pageNum);
        } catch (err) {
            console.error("Failed to fetch event audit logs:", err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        if (!eventId) return;

        fetchLogs(0, false);

        const token = localStorage.getItem('accessToken');
        const eventSource = new EventSource(`http://localhost:8080/api/v1/audit-logs/event/${eventId}/stream?token=${token}`);

        eventSource.addEventListener('LOG_ADDED', (event: MessageEvent) => {
            try {
                const newLog = JSON.parse(event.data);
                setLogs(prev => {
                    if (prev.some(l => l.id === newLog.id)) return prev;
                    return [newLog, ...prev];
                });
            } catch (e) {
                console.error("Failed to parse realtime log:", e);
            }
        });

        eventSource.onerror = (e) => {
            console.error("SSE connection error:", e);
        };

        return () => {
            eventSource.close();
        };
    }, [eventId]);

    const handleLoadMore = () => {
        fetchLogs(page + 1, true);
    };

    const getActionBadgeColor = (action: string) => {
        const act = action.toUpperCase();
        if (act.includes('CREATE') || act.includes('CLONE') || act.includes('ADD') || act.includes('ASSIGN')) {
            return 'bg-green-100 text-green-800 border border-green-200';
        }
        if (act.includes('DELETE') || act.includes('REMOVE') || act.includes('DISQUALIFY') || act.includes('CANCEL')) {
            return 'bg-red-100 text-red-800 border border-red-200';
        }
        return 'bg-blue-100 text-blue-800 border border-blue-200';
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    const renderLogDetails = (log: AuditLog) => {
        if (!log.oldValue || !log.newValue) {
            return <span className="text-slate-700">{log.details}</span>;
        }

        try {
            const oldObj = JSON.parse(log.oldValue);
            const newObj = JSON.parse(log.newValue);

            // Find modified fields
            const diffs: { field: string; oldVal: any; newVal: any }[] = [];
            Object.keys(newObj).forEach(key => {
                const oldVal = oldObj[key];
                const newVal = newObj[key];
                if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
                    diffs.push({
                        field: key.charAt(0).toUpperCase() + key.slice(1),
                        oldVal: oldVal === null || oldVal === undefined ? 'None' : String(oldVal),
                        newVal: newVal === null || newVal === undefined ? 'None' : String(newVal)
                    });
                }
            });

            if (diffs.length === 0) {
                return <span className="text-slate-500 italic">No visible changes</span>;
            }

            return (
                <div className="mt-1 space-y-1 bg-slate-50 border border-slate-200 rounded-lg p-2 max-w-lg shadow-sm">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Configuration Changes</div>
                    <table className="min-w-full divide-y divide-slate-100 text-[11px]">
                        <thead>
                            <tr className="text-slate-400">
                                <th className="text-left font-medium pb-1 w-1/4">Field</th>
                                <th className="text-left font-medium pb-1 w-3/8 text-red-600 bg-red-50/50 px-1.5 rounded">Before</th>
                                <th className="text-left font-medium pb-1 w-3/8 text-green-600 bg-green-50/50 px-1.5 rounded">After</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-mono">
                            {diffs.map((d, index) => (
                                <tr key={index} className="hover:bg-slate-100/50">
                                    <td className="py-1 font-semibold text-slate-600 align-top">{d.field}</td>
                                    <td className="py-1 text-red-600 bg-red-50/30 px-1.5 rounded break-all align-top line-through">{d.oldVal}</td>
                                    <td className="py-1 text-green-600 bg-green-50/30 px-1.5 rounded break-all align-top font-semibold">{d.newVal}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        } catch (e) {
            return <span className="text-slate-700">{log.details}</span>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
                <History size={20} className="text-gray-600" />
                <h2 className="text-xl font-semibold text-gray-800">Event Activity Log</h2>
            </div>

            {logs.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                    <p className="text-sm">No activity recorded for this event yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm bg-white">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Performed By</th>
                                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {logs.map(log => (
                                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-xs font-medium">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${getActionBadgeColor(log.action)}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs">
                                            {renderLogDetails(log)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                                            <div className="flex items-center gap-1.5">
                                                <User size={12} className="text-slate-400" />
                                                <span className="font-medium text-slate-700">{log.username}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-right font-mono text-slate-400">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {hasMore && (
                        <div className="flex justify-center pt-2">
                            <button
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                                className="px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
                            >
                                {loadingMore ? <Loader2 size={12} className="animate-spin" /> : null}
                                Load More Logs
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ActivityLogTab;

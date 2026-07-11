import React, { useEffect, useState } from 'react';
import { AuditLogService, AuditLog } from '../services/AuditLogService';
import { Shield, Loader2, Clock, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

const AuditLogsPage: React.FC = () => {
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAuditLogs();
    }, []);

    const fetchAuditLogs = async () => {
        setLoading(true);
        try {
            const allAuditLogs = await AuditLogService.getAllAuditLogs();
            setAuditLogs(allAuditLogs);
        } catch (err) {
            console.error('Failed to fetch audit logs:', err);
            toast.error('Failed to fetch audit logs. Admin permissions required.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Shield className="text-blue-600" />
                    Audit Logs
                </h1>
                <p className="text-gray-500 text-sm mt-1">Track all system actions and security events.</p>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                </div>
            ) : auditLogs.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <Shield className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No logs found</h3>
                    <p className="mt-1 text-sm text-gray-500">The audit log is currently empty.</p>
                </div>
            ) : (
                <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {auditLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-gray-900">
                                                <Clock size={14} className="mr-2 text-gray-400" />
                                                {new Date(log.timestamp).toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-gray-900">
                                                <Mail size={14} className="mr-2 text-gray-400" />
                                                {log.userEmail}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 uppercase`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <div className="max-w-md truncate" title={log.details}>
                                                {log.details}
                                            </div>
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

export default AuditLogsPage;
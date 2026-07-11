import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../../services/api';
import { FileText, Search, Filter, ChevronLeft, ChevronRight, Link } from 'lucide-react';
import toast from 'react-hot-toast';
import Skeleton from '../../../components/Skeleton';
import EmptyState from '../../../components/EmptyState';

interface Submission {
    id: number;
    teamName: string;
    roundName: string;
    repositoryUrl: string;
    submittedAt: string;
    version: number;
}

const SubmissionsTab: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Filters and Pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRound, setSelectedRound] = useState<string>('');
    const [page, setPage] = useState(0);
    const size = 10;

    useEffect(() => {
        if (!eventId) return;
        const fetchSubmissions = async () => {
            try {
                const response = await api.get(`/submissions/event/${eventId}`);
                const data = response.data.data ?? response.data;
                setSubmissions(Array.isArray(data) ? data : []);
            } catch (err) {
                toast.error('Failed to fetch submissions for this event.');
            } finally {
                setLoading(false);
            }
        };
        fetchSubmissions();
    }, [eventId]);

    const rounds = useMemo(() => {
        const uniqueRounds = new Set(submissions.map(s => s.roundName).filter(Boolean));
        return Array.from(uniqueRounds);
    }, [submissions]);

    const filteredSubmissions = useMemo(() => {
        return submissions.filter(sub => {
            const matchesSearch = sub.teamName?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRound = selectedRound ? sub.roundName === selectedRound : true;
            return matchesSearch && matchesRound;
        });
    }, [submissions, searchTerm, selectedRound]);

    const totalPages = Math.ceil(filteredSubmissions.length / size) || 1;

    useEffect(() => {
        setPage(0);
    }, [searchTerm, selectedRound]);

    const paginatedSubmissions = useMemo(() => {
        const start = page * size;
        return filteredSubmissions.slice(start, start + size);
    }, [filteredSubmissions, page, size]);

    if (loading) return (
        <div className="py-6">
            <Skeleton type="table-row" lines={5} />
        </div>
    );

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <FileText size={20} className="text-gray-600" />
                    <h2 className="text-xl font-semibold text-gray-800">Submissions</h2>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{submissions.length}</span>
                </div>
                
                <div className="flex flex-col md:flex-row gap-3 md:ml-auto w-full md:w-auto">
                    {/* Round Filter */}
                    {rounds.length > 0 && (
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Filter size={16} className="text-gray-400" />
                            </div>
                            <select
                                value={selectedRound}
                                onChange={(e) => setSelectedRound(e.target.value)}
                                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-full md:w-48 appearance-none bg-white"
                            >
                                <option value="">All Rounds</option>
                                {rounds.map(round => (
                                    <option key={round} value={round}>{round}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Search Bar */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={16} className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by team..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-full md:w-64"
                        />
                    </div>
                </div>
            </div>

            {filteredSubmissions.length === 0 ? (
                <EmptyState 
                    icon={<FileText size={40} className="text-gray-300" />}
                    title={searchTerm || selectedRound ? "No matching submissions" : "No submissions yet"}
                    description={searchTerm || selectedRound ? "Try adjusting your search or filters." : "No teams have submitted their projects yet."}
                />
            ) : (
                <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden flex flex-col">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Round</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Version</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted At</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Repository</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedSubmissions.map(sub => (
                                    <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{sub.teamName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2.5 py-1 inline-flex text-xs font-medium rounded-full bg-indigo-50 text-indigo-700">
                                                {sub.roundName}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center w-24">v{sub.version}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(sub.submittedAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                            {sub.repositoryUrl ? (
                                                <a 
                                                    href={sub.repositoryUrl} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                                >
                                                    <Link size={16} />
                                                    Repo
                                                </a>
                                            ) : (
                                                <span className="text-gray-400 italic">No repo link</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                                Showing {page * size + 1} to {Math.min((page + 1) * size, filteredSubmissions.length)} of {filteredSubmissions.length} submissions
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                    className="p-1.5 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                    disabled={page === totalPages - 1}
                                    className="p-1.5 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SubmissionsTab;

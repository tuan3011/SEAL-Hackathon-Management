import React, { useEffect, useState } from 'react';
import { RoundService, Round } from '../services/RoundService';
import { Layers, Loader2, Plus, Calendar, Clock, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Authorizable from '../components/Authorizable';
import { Role } from '../services/authUtils';

const RoundsPage: React.FC = () => {
    const [rounds, setRounds] = useState<Round[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRounds();
    }, []);

    const fetchRounds = async () => {
        setLoading(true);
        try {
            // For now, fetching rounds for hackathon event 1.
            const allRounds = await RoundService.getRoundsByHackathonEvent(1);
            setRounds(allRounds);
        } catch (err) {
            console.error('Failed to fetch rounds:', err);
            toast.error('Failed to fetch rounds.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-[1440px] mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 border border-outline-variant rounded-xl shadow-sm">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-on-surface tracking-tight flex items-center gap-2">
                        <Layers className="text-primary-container" />
                        Event Rounds
                    </h1>
                    <p className="text-sm text-on-surface-variant mt-1">Manage competition rounds, submission timelines, and schedules.</p>
                </div>
                
                <Authorizable allowedRoles={[Role.ADMIN, Role.ORGANIZER]}>
                    <button
                        onClick={() => toast('Create functionality coming soon!', { icon: '🚧' })}
                        className="bg-primary-container hover:bg-[#d9611b] text-white font-semibold py-2 px-4 rounded-lg shadow-sm flex items-center gap-2 transition-colors cursor-pointer text-sm"
                    >
                        <Plus size={16} />
                        Add Round
                    </button>
                </Authorizable>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="animate-spin text-primary-container" size={32} />
                </div>
            ) : rounds.length === 0 ? (
                <div className="bg-white border border-outline-variant rounded-xl p-16 text-center max-w-2xl mx-auto shadow-sm">
                    <Layers className="mx-auto h-16 w-16 text-slate-300 mb-4" />
                    <h3 className="text-lg font-bold text-on-surface mb-1">No Rounds Scheduled</h3>
                    <p className="text-sm text-on-surface-variant">There are no rounds scheduled for this event yet.</p>
                </div>
            ) : (
                <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Round Name</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Schedule</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-100">
                                {rounds.map((round) => {
                                    const now = new Date();
                                    const start = new Date(round.startTime);
                                    const end = new Date(round.endTime);
                                    let status = "Upcoming";
                                    let statusClass = "bg-slate-100 text-slate-700 border-slate-200";
                                    
                                    if (now > end) {
                                        status = "Completed";
                                        statusClass = "bg-slate-50 text-slate-400 border-slate-100";
                                    } else if (now >= start && now <= end) {
                                        status = "Active";
                                        statusClass = "bg-green-50 text-green-700 border-green-200";
                                    }

                                    return (
                                        <tr key={round.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-semibold text-on-surface">{round.name}</div>
                                                <div className="text-xs text-on-surface-variant max-w-xs truncate mt-0.5">{round.description}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-xs text-on-surface font-medium flex flex-col gap-1.5 font-mono">
                                                    <span className="flex items-center gap-1.5 text-on-surface-variant">
                                                        <Calendar size={13} className="text-primary-container shrink-0" />
                                                        {start.toLocaleDateString()}
                                                    </span>
                                                    <span className="flex items-center gap-1.5 text-on-surface-variant">
                                                        <Clock size={13} className="text-primary-container shrink-0" />
                                                        {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${statusClass}`}>
                                                    {status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <Authorizable allowedRoles={[Role.ADMIN, Role.ORGANIZER]} fallback={<span className="text-slate-400 italic text-xs">View Only</span>}>
                                                    <button onClick={() => toast('Edit functionality coming soon!', { icon: '🚧' })} className="text-primary-container hover:text-primary transition-colors flex items-center gap-1 cursor-pointer">
                                                        <Edit2 size={14} />
                                                        Edit
                                                    </button>
                                                </Authorizable>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoundsPage;
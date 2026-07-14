import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { JudgeAssignmentService } from '../../../services/JudgeAssignmentService';
import { Trash2, Users, CheckCircle, AlertCircle, UserPlus, Filter, Hash } from 'lucide-react';
import ConfirmModal from '../../../components/ConfirmModal';

interface Round {
    id: number;
    name: string;
    description: string;
}

interface Judge {
    id: number;
    username: string;
}

interface Track {
    id: number;
    name: string;
}

const JudgesTab: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const [rounds, setRounds] = useState<Round[]>([]);
    const [judges, setJudges] = useState<Judge[]>([]);
    const [tracks, setTracks] = useState<Track[]>([]);
    const [selectedRound, setSelectedRound] = useState<number | null>(null);
    const [selectedTrack, setSelectedTrack] = useState<number | null>(null);
    const [selectedJudge, setSelectedJudge] = useState<number | ''>('');
    const [loading, setLoading] = useState(true);
    const [assignments, setAssignments] = useState<any[]>([]);

    // Confirm Modal State
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<() => void>(() => {});

    useEffect(() => {
        const fetchData = async () => {
            if (!eventId) return;
            try {
                const [roundRes, judgeRes, trackRes, assignmentRes] = await Promise.all([
                    api.get(`/rounds/hackathon/${eventId}`),
                    api.get(`/users/role/JUDGE`),
                    api.get(`/tracks/hackathon/${eventId}`),
                    api.get(`/judge-assignments/event/${eventId}`)
                ]);
                setRounds(roundRes.data.data);
                setJudges(judgeRes.data.data);
                setTracks(trackRes.data.data);
                setAssignments(assignmentRes.data.data);
            } catch (err) {
                toast.error("Failed to load data for judge assignment.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [eventId]);

    const handleUnassign = (assignmentId: number) => {
        setConfirmAction(() => async () => {
            try {
                await api.delete(`/judge-assignments/${assignmentId}`);
                toast.success("Judge unassigned successfully!");
                const res = await api.get(`/judge-assignments/event/${eventId}`);
                setAssignments(res.data.data);
            } catch (err: any) {
                toast.error(err.response?.data?.error?.message || "Failed to unassign judge.");
            }
            setConfirmOpen(false);
        });
        setConfirmOpen(true);
    };

    const handleAssignJudge = async () => {
        if (!selectedRound || !selectedJudge) {
            toast.error("Please select a round and a judge.");
            return;
        }
        try {
            await JudgeAssignmentService.assignJudge({
                roundId: selectedRound,
                judgeId: selectedJudge,
                trackId: selectedTrack || undefined
            });
            toast.success("Judge assigned successfully!");
            const res = await api.get(`/judge-assignments/event/${eventId}`);
            setAssignments(res.data.data);
        } catch (err: any) {
            toast.error(err.response?.data?.error?.message || "Failed to assign judge.");
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-container"></div>
        </div>
    );

    const completedAssignments = assignments.filter(a => a.status === 'COMPLETED').length;
    const incompleteAssignments = assignments.length - completedAssignments;

    return (
        <div className="space-y-6">
            {/* Statistics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-500">Total Assignments</p>
                        <p className="text-2xl font-black text-slate-800">{assignments.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-500">Completed Grading</p>
                        <p className="text-2xl font-black text-slate-800">{completedAssignments}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-500">Incomplete Grading</p>
                        <p className="text-2xl font-black text-slate-800">{incompleteAssignments}</p>
                    </div>
                </div>
            </div>

            {/* Assignment Form */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <UserPlus size={20} className="text-primary-container" />
                        Assign Judge to Round
                    </h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1">
                            <Hash size={14} className="text-slate-400" /> Select Round
                        </label>
                        <select
                            onChange={(e) => setSelectedRound(Number(e.target.value))}
                            className="w-full bg-white border border-slate-300 text-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container transition-colors shadow-sm"
                        >
                            <option value="">-- Choose Round --</option>
                            {rounds.map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1">
                            <Filter size={14} className="text-slate-400" /> Select Track
                        </label>
                        <select
                            onChange={(e) => setSelectedTrack(e.target.value ? Number(e.target.value) : null)}
                            className="w-full bg-white border border-slate-300 text-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container transition-colors shadow-sm"
                        >
                            <option value="">-- All Tracks --</option>
                            {tracks.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1">
                            <Users size={14} className="text-slate-400" /> Select Judge
                        </label>
                        <select
                            value={selectedJudge}
                            onChange={(e) => setSelectedJudge(Number(e.target.value))}
                            className="w-full bg-white border border-slate-300 text-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container transition-colors shadow-sm"
                        >
                            <option value="">-- Choose Judge --</option>
                            {judges.map(j => (
                                <option key={j.id} value={j.id}>{j.username}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <button onClick={handleAssignJudge} className="w-full py-2.5 bg-primary-container text-white font-bold rounded-lg hover:bg-[#d9611b] transition-colors shadow-sm flex items-center justify-center gap-2">
                            <UserPlus size={18} /> Assign Now
                        </button>
                    </div>
                </div>
            </div>

            {/* Assignments List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Users size={20} className="text-slate-500" />
                        Current Assignments
                    </h3>
                    <span className="bg-slate-200 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-full">
                        {assignments.length} Total
                    </span>
                </div>
                {assignments.length === 0 ? (
                    <div className="p-10 text-center text-slate-500">
                        No judges have been assigned to any rounds yet.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                                    <th className="py-4 px-6">Judge Name</th>
                                    <th className="py-4 px-6">Assigned Round</th>
                                    <th className="py-4 px-6">Track</th>
                                    <th className="py-4 px-6">Grading Status</th>
                                    <th className="py-4 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {assignments.map(a => (
                                    <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                                                    {a.judgeName.substring(0, 2).toUpperCase()}
                                                </div>
                                                <span className="font-semibold text-slate-800">{a.judgeName}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-sm font-medium text-slate-600">{a.roundName}</td>
                                        <td className="py-4 px-6">
                                            {a.trackName && a.trackName !== 'All Tracks' ? (
                                                <span className="px-2 py-1 rounded text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                    {a.trackName}
                                                </span>
                                            ) : (
                                                <span className="text-sm text-slate-400 font-medium">All Tracks</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`px-2.5 py-1 text-xs font-bold rounded border ${
                                                a.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-200' : 
                                                'bg-amber-50 text-amber-700 border-amber-200'
                                            }`}>
                                                {a.status === 'COMPLETED' ? 'COMPLETED' : 'INCOMPLETE'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <button
                                                onClick={() => handleUnassign(a.id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex"
                                                title="Unassign Judge"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={confirmOpen}
                title="Unassign Judge"
                message="Are you sure you want to unassign this judge? They will lose access to grade submissions for this round."
                isDanger={true}
                confirmText="Unassign"
                onConfirm={confirmAction}
                onCancel={() => setConfirmOpen(false)}
            />
        </div>
    );
};

export default JudgesTab;

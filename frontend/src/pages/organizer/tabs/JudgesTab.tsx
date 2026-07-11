import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { JudgeAssignmentService } from '../../../services/JudgeAssignmentService';
import { Trash2 } from 'lucide-react';
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

    if (loading) return <div>Loading judge assignment data...</div>;

    return (
        <>
            <div>
            <h2 className="text-2xl font-semibold mb-4">Assign Judges</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-4 rounded-lg">
                <div>
                    <label className="block text-sm font-medium text-gray-700">1. Select Round</label>
                    <select
                        onChange={(e) => setSelectedRound(Number(e.target.value))}
                        className="w-full mt-1 input-style"
                    >
                        <option value="">-- Select a round --</option>
                        {rounds.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">2. Select Track (Optional)</label>
                    <select
                        onChange={(e) => setSelectedTrack(e.target.value ? Number(e.target.value) : null)}
                        className="w-full mt-1 input-style"
                    >
                        <option value="">-- All Tracks --</option>
                        {tracks.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">3. Select Judge</label>
                    <select
                        value={selectedJudge}
                        onChange={(e) => setSelectedJudge(Number(e.target.value))}
                        className="w-full mt-1 input-style"
                    >
                        <option value="">-- Select a judge --</option>
                        {judges.map(j => (
                            <option key={j.id} value={j.id}>{j.username}</option>
                        ))}
                    </select>
                </div>
                <div className="self-end">
                    <button onClick={handleAssignJudge} className="w-full btn-primary">
                        Assign Judge
                    </button>
                </div>
            </div>
            <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Current Assignments</h3>
                {assignments.length === 0 ? (
                    <div className="text-sm text-gray-500">No judges assigned yet.</div>
                ) : (
                    <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Judge</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Round</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Track</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {assignments.map(a => (
                                    <tr key={a.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{a.judgeName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{a.roundName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{a.trackName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${a.status === 'COMPLETED' ? 'bg-green-100 text-green-800 border border-green-200' :
                                                    a.status === 'CANCELLED' ? 'bg-red-100 text-red-800 border border-red-200' :
                                                    a.status === 'DRAFT' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                                                        'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                                }`}>
                                                {a.status || 'ASSIGNED'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleUnassign(a.id)}
                                                className="text-red-600 hover:text-red-900"
                                                title="Unassign"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

            </div>
        </div>
        <ConfirmModal
            isOpen={confirmOpen}
            title="Unassign Judge"
            message="Are you sure you want to unassign this judge? They will lose access to grade submissions for this round."
            isDanger={false}
            confirmText="Unassign"
            onConfirm={confirmAction}
            onCancel={() => setConfirmOpen(false)}
        />
        </>
    );
};

export default JudgesTab;

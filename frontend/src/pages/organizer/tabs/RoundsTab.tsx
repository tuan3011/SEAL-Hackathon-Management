import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../../services/api';
import { Clock, Plus, Trash2, Loader2, CalendarDays, Edit2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../../components/Modal';
import ConfirmModal from '../../../components/ConfirmModal';

// trigger re-check

interface Round {
    id: number;
    name: string;
    description: string;
    startTime: string;
    endTime: string;
    advancementSlots?: number;
}

interface RoundForm {
    name: string;
    description: string;
    startTime: string;
    endTime: string;
    gradingEndTime: string;
    advancementSlots: number;
}

const emptyForm: RoundForm = { name: '', description: '', startTime: '', endTime: '', gradingEndTime: '', advancementSlots: 2 };

const RoundsTab: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const [rounds, setRounds] = useState<Round[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<RoundForm>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingRound, setEditingRound] = useState<Round | null>(null);
    const [eventDetails, setEventDetails] = useState<any>(null);

    // Confirm Modal State
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmTitle, setConfirmTitle] = useState('');
    const [confirmMessage, setConfirmMessage] = useState('');
    const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
    const [confirmText, setConfirmText] = useState('Delete');
    const [confirmIsDanger, setConfirmIsDanger] = useState(true);

    const [advancementPreview, setAdvancementPreview] = useState<{
        roundId: number;
        show: boolean;
        loading: boolean;
        proposedTeamsByTrack: { [trackName: string]: any[] };
        tiesByTrack: { [trackName: string]: string[] };
    }>({
        roundId: 0,
        show: false,
        loading: false,
        proposedTeamsByTrack: {},
        tiesByTrack: {},
    });

    const fetchRounds = async () => {
        if (!eventId) return;
        try {
            const res = await api.get(`/rounds/hackathon/${eventId}`);
            // Handle both array and wrapped responses
            const data = res.data.data ?? res.data;
            setRounds(Array.isArray(data) ? data : []);
        } catch (err: any) {
            toast.error(err.response?.data?.error?.message || 'Failed to load rounds.');
        } finally {
            setLoading(false);
        }
    };

    const fetchEventDetails = async () => {
        if (!eventId) return;
        try {
            const res = await api.get(`/hackathon-events/id/${eventId}`);
            setEventDetails(res.data.data ?? res.data);
        } catch (err) {
            console.error('Failed to fetch event details', err);
        }
    };

    useEffect(() => {
        fetchRounds();
        fetchEventDetails();
    }, [eventId]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) { toast.error('Round name cannot be empty.'); return; }
        if (!form.startTime || !form.endTime || !form.gradingEndTime) { toast.error('Start, submission end, and round end times are required.'); return; }
        if (form.startTime >= form.endTime) { toast.error('Submission end time must be after start time.'); return; }
        if (form.gradingEndTime <= form.endTime) { toast.error('Round end time (grading ends) must be after submission end time.'); return; }

        setSaving(true);
        try {
            await api.post('/rounds', { ...form, hackathonEventId: Number(eventId) });
            toast.success('Round created successfully!');
            setForm(emptyForm);
            setShowForm(false);
            fetchRounds();
        } catch (err: any) {
            toast.error(err.response?.data?.error?.message || 'Failed to create round.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = (id: number) => {
        setConfirmTitle('Delete Round');
        setConfirmMessage('Are you sure you want to delete this round? This will also delete all submissions and scores in this round.');
        setConfirmText('Delete');
        setConfirmIsDanger(true);
        setConfirmAction(() => async () => {
            try {
                await api.delete(`/rounds/${id}`);
                toast.success('Round deleted successfully.');
                setRounds(prev => prev.filter(r => r.id !== id));
            } catch (err: any) {
                toast.error(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to delete round.');
            }
            setConfirmOpen(false);
        });
        setConfirmOpen(true);
    };

    const openEditModal = (round: Round) => {
        setEditingRound({ ...round, advancementSlots: round.advancementSlots || 2 });
        setIsEditModalOpen(true);
    };

    const handleUpdateRound = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingRound || !editingRound.name.trim()) {
            toast.error('Round name is required.');
            return;
        }
        if (!editingRound.startTime || !editingRound.endTime || !editingRound.gradingEndTime) {
            toast.error('Start, submission end, and round end times are required.');
            return;
        }
        if (editingRound.startTime >= editingRound.endTime) {
            toast.error('Submission end time must be after start time.');
            return;
        }
        if (editingRound.gradingEndTime <= editingRound.endTime) {
            toast.error('Round end time (grading ends) must be after submission end time.');
            return;
        }
        const loadingToast = toast.loading('Updating round...');
        try {
            await api.put(`/rounds/${editingRound.id}`, {
                name: editingRound.name,
                description: editingRound.description,
                startTime: editingRound.startTime,
                endTime: editingRound.endTime,
                gradingEndTime: editingRound.gradingEndTime,
                hackathonEventId: Number(eventId),
                advancementSlots: Number(editingRound.advancementSlots || 2)
            });
            toast.success('Round updated successfully!', { id: loadingToast });
            setIsEditModalOpen(false);
            setEditingRound(null);
            fetchRounds();
        } catch (err: any) {
            toast.error(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to update round.', { id: loadingToast });
        }
    };

    const handleEndGradingEarly = (id: number) => {
        setConfirmTitle('Kết thúc sớm vòng thi');
        setConfirmMessage('Bạn có chắc chắn muốn kết thúc sớm thời gian nộp bài / chấm điểm cho vòng thi này? Bảng xếp hạng sẽ hiển thị ngay lập tức.');
        setConfirmText('End');
        setConfirmIsDanger(false);
        setConfirmAction(() => async () => {
            const loadingToast = toast.loading('Đang kết thúc sớm...');
            try {
                await api.post(`/rounds/${id}/end-grading`);
                toast.success('Đã kết thúc sớm thành công!', { id: loadingToast });
                fetchRounds();
            } catch (err: any) {
                toast.error(err.response?.data?.error?.message || 'Không thể kết thúc sớm.', { id: loadingToast });
            }
            setConfirmOpen(false);
        });
        setConfirmOpen(true);
    };

    const handleAdvanceTeams = async (roundId: number) => {
        const round = rounds.find(r => r.id === roundId);
        if (!round) return;

        setAdvancementPreview({
            roundId,
            show: true,
            loading: true,
            proposedTeamsByTrack: {},
            tiesByTrack: {},
        });

        try {
            const res = await api.get(`/rankings/round/${roundId}`);
            const rankings = res.data.data || [];
            
            // Group rankings by track
            const grouped: { [trackName: string]: any[] } = {};
            rankings.forEach((r: any) => {
                const track = r.trackName || 'General Track';
                if (!grouped[track]) grouped[track] = [];
                grouped[track].push(r);
            });

            const slots = round.advancementSlots || 2;
            const proposed: { [trackName: string]: any[] } = {};
            const ties: { [trackName: string]: string[] } = {};

            Object.entries(grouped).forEach(([trackName, list]) => {
                // Take top `slots` teams
                const topTeams = list.slice(0, slots);
                proposed[trackName] = topTeams;

                // Check if there is a tie at the boundary
                if (list.length > slots) {
                    const lastAdvanced = list[slots - 1];
                    const firstExcluded = list[slots];
                    if (lastAdvanced && firstExcluded && lastAdvanced.finalScore === firstExcluded.finalScore) {
                        ties[trackName] = [
                            `${lastAdvanced.teamName} (Hạng ${lastAdvanced.rank}, ${lastAdvanced.finalScore} điểm)`,
                            `${firstExcluded.teamName} (Hạng ${firstExcluded.rank}, ${firstExcluded.finalScore} điểm)`
                        ];
                    }
                }
            });

            setAdvancementPreview({
                roundId,
                show: true,
                loading: false,
                proposedTeamsByTrack: proposed,
                tiesByTrack: ties,
            });
        } catch (err: any) {
            toast.error('Không thể tải bản xem trước thăng hạng.');
            setAdvancementPreview(prev => ({ ...prev, show: false, loading: false }));
        }
    };

    if (loading) return (
        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-500" size={28} /></div>
    );

    return (
        <>
            <div>
            <div className="flex items-center gap-2 mb-4">
                <CalendarDays size={20} className="text-gray-600" />
                <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-800">Rounds</h2>
                    {eventDetails && (
                        <p className="text-xs text-gray-500 mt-0.5">
                            Event Duration: <span className="font-semibold text-blue-600">{new Date(eventDetails.startTime).toLocaleString()}</span> to <span className="font-semibold text-blue-600">{new Date(eventDetails.endTime).toLocaleString()}</span>
                        </p>
                    )}
                </div>
                <button
                    onClick={() => setShowForm(s => !s)}
                    className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={14} />
                    Add Round
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleCreate} className="mb-6 border border-blue-200 bg-blue-50 rounded-lg p-4 space-y-3">
                    <h3 className="text-sm font-semibold text-blue-800">New Round</h3>
                    {eventDetails && (
                        <div className="text-xs text-blue-700 bg-blue-100/50 p-2.5 rounded-lg border border-blue-200/50">
                            <strong>Event Duration:</strong> {new Date(eventDetails.startTime).toLocaleString()} to {new Date(eventDetails.endTime).toLocaleString()}
                            <p className="text-gray-500 mt-0.5">Please choose start and end times for the round within this timeframe.</p>
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Round Name *</label>
                            <input
                                value={form.name}
                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                placeholder="e.g. Qualification Round"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                            <input
                                value={form.description}
                                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                placeholder="Optional description"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Start Time *</label>
                            <input
                                type="datetime-local"
                                value={form.startTime}
                                onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Submission End Time *</label>
                            <input
                                type="datetime-local"
                                value={form.endTime}
                                onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Round End Time (Grading Ends) *</label>
                            <input
                                type="datetime-local"
                                value={form.gradingEndTime}
                                onChange={e => setForm(f => ({ ...f, gradingEndTime: e.target.value }))}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Advancement Slots (For non-final rounds) *</label>
                            <input
                                type="number"
                                min="1"
                                value={form.advancementSlots}
                                onChange={e => setForm(f => ({ ...f, advancementSlots: Number(e.target.value) }))}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                        <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1.5 text-xs text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                        <button type="submit" disabled={saving} className="px-3 py-1.5 text-xs text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                            {saving ? 'Saving...' : 'Create Round'}
                        </button>
                    </div>
                </form>
            )}

            {rounds.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                    <Clock className="mx-auto mb-2" size={36} />
                    <p className="text-sm">No rounds yet. Add the first round above.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {rounds.map((round, idx) => (
                        <div key={round.id} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                {idx + 1}
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-gray-900">{round.name}</p>
                                {round.description && <p className="text-xs text-gray-500 mt-0.5">{round.description}</p>}
                                <div className="flex flex-wrap items-center gap-3 mt-1.5">
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <Clock size={12} />
                                        {new Date(round.startTime).toLocaleString()} → {new Date(round.endTime).toLocaleString()}
                                    </div>
                                    {idx < rounds.length - 1 ? (
                                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
                                            Advancement: {round.advancementSlots || 2} teams (per Track)
                                        </span>
                                    ) : (
                                        <span className="px-2 py-0.5 text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 rounded-full">
                                            Final Round
                                        </span>
                                    )}
                                </div>
                                {round.gradingEndTime && (
                                    <div className="text-[11px] text-gray-500 font-medium mt-1">
                                        Grading Period: <span className="text-amber-700 font-semibold">{new Date(round.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(round.gradingEndTime).toLocaleString()}</span>
                                        {round.gradingEnded ? (
                                            <span className="ml-2 px-1.5 py-0.5 bg-gray-100 text-gray-600 border border-gray-200 rounded text-[9px] font-bold">Ended Early</span>
                                        ) : new Date() >= new Date(round.gradingEndTime) ? (
                                            <span className="ml-2 px-1.5 py-0.5 bg-green-100 text-green-700 border border-green-200 rounded text-[9px] font-bold">Finished</span>
                                        ) : new Date() >= new Date(round.endTime) ? (
                                            <span className="ml-2 px-1.5 py-0.5 bg-amber-100 text-amber-700 border border-amber-200 rounded text-[9px] font-bold animate-pulse">Grading...</span>
                                        ) : null}
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                {(round.gradingEnded || new Date() >= new Date(round.gradingEndTime)) && idx < rounds.length - 1 && (
                                     <button
                                         onClick={() => handleAdvanceTeams(round.id)}
                                         className="text-[10px] bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 px-2 py-1 rounded-md font-semibold transition-colors shrink-0 cursor-pointer"
                                         title="Advance top teams to the next round"
                                     >
                                         Advance Teams
                                     </button>
                                )}
                                {(round.gradingEnded || new Date() >= new Date(round.gradingEndTime)) && idx === rounds.length - 1 && (
                                     <button
                                         onClick={() => handleAdvanceTeams(round.id)}
                                         className="text-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-2 py-1 rounded-md font-semibold transition-colors shrink-0 cursor-pointer"
                                         title="Complete hackathon and generate final scores"
                                     >
                                         Complete Event
                                     </button>
                                )}
                                {round.gradingEndTime && !round.gradingEnded && new Date() < new Date(round.gradingEndTime) && (
                                     <button
                                         onClick={() => handleEndGradingEarly(round.id)}
                                         className="text-[10px] bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-2 py-1 rounded-md font-semibold transition-colors shrink-0 cursor-pointer"
                                         title="Kết thúc sớm vòng thi hoặc thời gian chấm điểm"
                                     >
                                         End Early
                                     </button>
                                )}
                                <button
                                    onClick={() => openEditModal(round)}
                                    className="text-blue-400 hover:text-blue-600 transition-colors p-1 cursor-pointer"
                                    title="Edit round"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(round.id)}
                                    className="text-red-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                                    title="Delete round"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isEditModalOpen && editingRound && (
                <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditingRound(null); }}>
                    <form onSubmit={handleUpdateRound} className="p-6 max-w-lg space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Clock size={20} className="text-blue-600" />
                            Edit Round
                        </h3>
                        {eventDetails && (
                            <div className="text-xs text-blue-700 bg-blue-100/50 p-2.5 rounded-lg border border-blue-200/50">
                                <strong>Event Duration:</strong> {new Date(eventDetails.startTime).toLocaleString()} to {new Date(eventDetails.endTime).toLocaleString()}
                                <p className="text-gray-500 mt-0.5">Please choose start and end times for the round within this timeframe.</p>
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Round Name *</label>
                            <input
                                type="text"
                                value={editingRound.name}
                                onChange={e => setEditingRound({ ...editingRound, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm bg-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                value={editingRound.description || ''}
                                onChange={e => setEditingRound({ ...editingRound, description: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm bg-white"
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
                                <input
                                    type="datetime-local"
                                    value={editingRound.startTime ? editingRound.startTime.slice(0, 16) : ''}
                                    onChange={e => setEditingRound({ ...editingRound, startTime: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm bg-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Submission End Time *</label>
                                <input
                                    type="datetime-local"
                                    value={editingRound.endTime ? editingRound.endTime.slice(0, 16) : ''}
                                    onChange={e => setEditingRound({ ...editingRound, endTime: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm bg-white"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Round End Time (Grading Ends) *</label>
                            <input
                                type="datetime-local"
                                value={editingRound.gradingEndTime ? editingRound.gradingEndTime.slice(0, 16) : ''}
                                onChange={e => setEditingRound({ ...editingRound, gradingEndTime: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm bg-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Advancement Slots (For non-final rounds) *</label>
                            <input
                                type="number"
                                min="1"
                                value={editingRound.advancementSlots || 2}
                                onChange={e => setEditingRound({ ...editingRound, advancementSlots: Number(e.target.value) })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm bg-white"
                                required
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => { setIsEditModalOpen(false); setEditingRound(null); }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
        {advancementPreview.show && (
            <Modal isOpen={advancementPreview.show} onClose={() => setAdvancementPreview(prev => ({ ...prev, show: false }))}>
                <div className="p-6 max-w-xl space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Clock size={20} className="text-blue-600" />
                        {rounds.findIndex(r => r.id === advancementPreview.roundId) === rounds.length - 1 
                            ? 'Xác nhận Hoàn thành Sự kiện (Complete Event)' 
                            : 'Xác nhận thăng hạng đội thi (Round Advancement)'}
                    </h3>
                    {advancementPreview.loading ? (
                        <div className="flex items-center justify-center py-6">
                            <Loader2 className="animate-spin text-blue-500 mr-2" size={20} />
                            <span className="text-sm text-gray-500">Đang tải danh sách xếp hạng...</span>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600">
                                {rounds.findIndex(r => r.id === advancementPreview.roundId) === rounds.length - 1
                                    ? 'Dưới đây là danh sách xếp hạng chung cuộc của các đội thi ở từng Track:'
                                    : 'Dưới đây là danh sách các đội có điểm số cao nhất của mỗi Track dự kiến sẽ được thăng hạng lên vòng tiếp theo:'}
                            </p>
                            
                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                                {Object.keys(advancementPreview.proposedTeamsByTrack).length === 0 ? (
                                    <p className="text-xs text-gray-400 italic text-center py-4">Chưa có bảng điểm xếp hạng nào được ghi nhận cho vòng thi này.</p>
                                ) : (
                                    Object.entries(advancementPreview.proposedTeamsByTrack).map(([trackName, teams]) => {
                                        const tieWarning = advancementPreview.tiesByTrack[trackName];
                                        return (
                                            <div key={trackName} className="border border-slate-100 bg-slate-50 p-3 rounded-lg space-y-2">
                                                <h4 className="font-bold text-sm text-blue-800">{trackName}</h4>
                                                <ul className="space-y-1 text-xs">
                                                    {teams.map((t, idx) => (
                                                        <li key={t.teamId} className="flex justify-between items-center text-gray-700 bg-white px-2.5 py-1.5 rounded border border-gray-100">
                                                            <span>Rank {t.rank}: <strong>{t.teamName}</strong></span>
                                                            <span className="font-semibold text-blue-600">{t.finalScore} điểm</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                                {tieWarning && (
                                                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-800 space-y-1">
                                                        <div className="flex items-center gap-1.5 font-bold">
                                                            <AlertCircle size={14} className="text-amber-600" />
                                                            Cảnh báo bằng điểm!
                                                        </div>
                                                        <p className="text-gray-600">Có hiện tượng bằng điểm tại ranh giới thăng hạng giữa:</p>
                                                        <ul className="list-disc pl-4 space-y-0.5 text-gray-500">
                                                            {tieWarning.map((info, idx) => (
                                                                <li key={idx}>{info}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-xs text-blue-800">
                                <strong>Lưu ý:</strong> Hành động này sẽ khóa điểm số của vòng thi hiện tại và thực hiện thăng hạng chính thức (hoặc chốt điểm chung cuộc). Hãy đảm bảo các Giám khảo đã hoàn thành tất cả các lượt chấm điểm.
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setAdvancementPreview(prev => ({ ...prev, show: false }))}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700 transition-colors"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="button"
                                    onClick={async () => {
                                        const roundId = advancementPreview.roundId;
                                        setAdvancementPreview(prev => ({ ...prev, show: false }));
                                        const loadingToast = toast.loading('Đang xử lý...');
                                        try {
                                            const res = await api.post(`/rounds/${roundId}/advance`);
                                            toast.success(res.data.message || 'Xử lý thành công!', { id: loadingToast });
                                            fetchRounds();
                                        } catch (err: any) {
                                            toast.error(err.response?.data?.error?.message || err.response?.data?.message || 'Xử lý thất bại.', { id: loadingToast });
                                        }
                                    }}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
                                >
                                    Xác nhận
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
        )}
        <ConfirmModal
            isOpen={confirmOpen}
            title={confirmTitle}
            message={confirmMessage}
            isDanger={confirmIsDanger}
            confirmText={confirmText}
            onConfirm={confirmAction}
            onCancel={() => setConfirmOpen(false)}
        />
        </>
    );
};

export default RoundsTab;

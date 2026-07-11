import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../../services/api';
import { Tag, Plus, Trash2, Loader2, Users, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../../components/Modal';
import ConfirmModal from '../../../components/ConfirmModal';

interface Track {
    id: number;
    name: string;
    description: string;
}

interface TrackForm {
    name: string;
    description: string;
}

const emptyForm: TrackForm = { name: '', description: '' };

const TracksTab: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const [tracks, setTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<TrackForm>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingTrack, setEditingTrack] = useState<Track | null>(null);

    // Mentor Management State
    const [mentorModalTrackId, setMentorModalTrackId] = useState<number | null>(null);
    const [trackMentors, setTrackMentors] = useState<any[]>([]);
    const [mentorUserIdInput, setMentorUserIdInput] = useState('');
    const [mentorLoading, setMentorLoading] = useState(false);
    const [availableMentors, setAvailableMentors] = useState<any[]>([]);

    // Confirmation Modal State
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmTitle, setConfirmTitle] = useState('');
    const [confirmMessage, setConfirmMessage] = useState('');
    const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
    const [confirmIsDanger, setConfirmIsDanger] = useState(false);

    const fetchTracks = async () => {
        if (!eventId) return;
        try {
            const res = await api.get(`/tracks/hackathon/${eventId}`);
            const data = res.data.data ?? res.data;
            setTracks(Array.isArray(data) ? data : []);
        } catch (err: any) {
            toast.error(err.response?.data?.error?.message || 'Failed to load tracks.');
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableMentors = async () => {
        try {
            const res = await api.get('/users/role/MENTOR');
            const data = res.data.data ?? res.data;
            setAvailableMentors(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error("Failed to load mentors", e);
        }
    };

    useEffect(() => { 
        fetchTracks(); 
        fetchAvailableMentors();
    }, [eventId]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) { toast.error('Track name is required.'); return; }

        setSaving(true);
        try {
            await api.post('/tracks', { ...form, hackathonEventId: Number(eventId) });
            toast.success('Track created!');
            setForm(emptyForm);
            setShowForm(false);
            fetchTracks();
        } catch (err: any) {
            toast.error(err.response?.data?.error?.message || 'Failed to create track.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = (id: number) => {
        setConfirmTitle('Delete Track');
        setConfirmMessage('Are you sure you want to delete this track? Teams in this track will become unassigned.');
        setConfirmIsDanger(true);
        setConfirmAction(() => async () => {
            try {
                await api.delete(`/tracks/${id}`);
                toast.success('Track deleted successfully.');
                setTracks(prev => prev.filter(t => t.id !== id));
            } catch (err: any) {
                toast.error(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to delete track.');
            }
            setConfirmOpen(false);
        });
        setConfirmOpen(true);
    };

    const openEditModal = (track: Track) => {
        setEditingTrack({ ...track });
        setIsEditModalOpen(true);
    };

    const handleUpdateTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTrack || !editingTrack.name.trim()) {
            toast.error('Track name is required.');
            return;
        }
        const loadingToast = toast.loading('Updating track...');
        try {
            await api.put(`/tracks/${editingTrack.id}`, {
                name: editingTrack.name,
                description: editingTrack.description,
                hackathonEventId: Number(eventId),
            });
            toast.success('Track updated successfully!', { id: loadingToast });
            setIsEditModalOpen(false);
            setEditingTrack(null);
            fetchTracks();
        } catch (err: any) {
            toast.error(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to update track.', { id: loadingToast });
        }
    };

    const openMentorModal = async (trackId: number) => {
        setMentorModalTrackId(trackId);
        setTrackMentors([]);
        fetchMentors(trackId);
    };

    const fetchMentors = async (trackId: number) => {
        setMentorLoading(true);
        try {
            const res = await api.get(`/tracks/${trackId}/mentors`);
            const data = res.data.data ?? res.data;
            setTrackMentors(Array.isArray(data) ? data : []);
        } catch (err) {
            toast.error('Failed to fetch mentors for track.');
        } finally {
            setMentorLoading(false);
        }
    };

    const handleAssignMentor = async () => {
        if (!mentorModalTrackId || !mentorUserIdInput) {
            toast.error('Please enter a user ID.');
            return;
        }
        setMentorLoading(true);
        try {
            await api.post(`/tracks/${mentorModalTrackId}/mentors/${mentorUserIdInput}`);
            toast.success('Mentor assigned successfully!');
            setMentorUserIdInput('');
            fetchMentors(mentorModalTrackId);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to assign mentor.');
        } finally {
            setMentorLoading(false);
        }
    };

    const handleRemoveMentor = (mentorId: number) => {
        if (!mentorModalTrackId) return;
        setConfirmTitle('Remove Mentor');
        setConfirmMessage('Are you sure you want to remove this mentor from the track?');
        setConfirmIsDanger(false);
        setConfirmAction(() => async () => {
            setMentorLoading(true);
            try {
                await api.delete(`/tracks/${mentorModalTrackId}/mentors/${mentorId}`);
                toast.success('Mentor removed.');
                fetchMentors(mentorModalTrackId);
            } catch (err: any) {
                toast.error(err.response?.data?.message || 'Failed to remove mentor.');
            } finally {
                setMentorLoading(false);
            }
            setConfirmOpen(false);
        });
        setConfirmOpen(true);
    };

    if (loading) return (
        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-500" size={28} /></div>
    );

    const tagColors = [
        'bg-purple-50 border-purple-200 text-purple-700',
        'bg-indigo-50 border-indigo-200 text-indigo-700',
        'bg-pink-50 border-pink-200 text-pink-700',
        'bg-teal-50 border-teal-200 text-teal-700',
        'bg-orange-50 border-orange-200 text-orange-700',
    ];

    return (
        <>
            <div>
            <div className="flex items-center gap-2 mb-4">
                <Tag size={20} className="text-gray-600" />
                <h2 className="text-xl font-semibold text-gray-800">Competition Tracks</h2>
                <button
                    onClick={() => setShowForm(s => !s)}
                    className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                    <Plus size={14} />
                    Add Track
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleCreate} className="mb-6 border border-blue-200 bg-blue-50 rounded-lg p-4 space-y-3">
                    <h3 className="text-sm font-semibold text-blue-800">New Track</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Track Name *</label>
                            <input
                                value={form.name}
                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                placeholder="e.g. AI & ML, FinTech, Social Impact"
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
                    </div>
                    <div className="flex gap-2 justify-end">
                        <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1.5 text-xs text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">Cancel</button>
                        <button type="submit" disabled={saving} className="px-3 py-1.5 text-xs text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer">
                            {saving ? 'Saving...' : 'Create Track'}
                        </button>
                    </div>
                </form>
            )}

            {tracks.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                    <Tag className="mx-auto mb-2" size={36} />
                    <p className="text-sm">No tracks yet. Tracks allow teams to compete in specific categories.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {tracks.map((track, idx) => (
                        <div
                            key={track.id}
                            className={`flex flex-col gap-2 p-4 border rounded-lg ${tagColors[idx % tagColors.length]}`}
                        >
                            <div className="flex items-start gap-3">
                                <Tag size={18} className="flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="font-semibold text-sm">{track.name}</p>
                                    {track.description && <p className="text-xs opacity-80 mt-0.5">{track.description}</p>}
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => openEditModal(track)}
                                        className="opacity-60 hover:opacity-100 transition-opacity p-1 cursor-pointer"
                                        title="Chỉnh sửa bảng đấu"
                                    >
                                        <Edit2 size={15} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(track.id)}
                                        className="opacity-60 hover:opacity-100 transition-opacity p-1 cursor-pointer"
                                        title="Xóa bảng đấu"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>
                            <div className="mt-2 border-t pt-2 border-current opacity-60">
                                <button
                                    onClick={() => openMentorModal(track.id)}
                                    className="inline-flex items-center gap-1 text-xs font-medium hover:opacity-100 cursor-pointer"
                                >
                                    <Users size={14} />
                                    Manage Mentors
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal isOpen={mentorModalTrackId !== null} onClose={() => setMentorModalTrackId(null)}>
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Users size={20} className="text-blue-600" />
                        Manage Track Mentors
                    </h3>
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <select
                                value={mentorUserIdInput}
                                onChange={(e) => setMentorUserIdInput(e.target.value)}
                                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">-- Select a Mentor --</option>
                                {availableMentors.map(m => (
                                    <option key={m.id} value={m.id}>
                                        {m.username} ({m.email})
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={handleAssignMentor}
                                disabled={mentorLoading || !mentorUserIdInput}
                                className="px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                            >
                                Assign Mentor
                            </button>
                        </div>

                        {mentorLoading && trackMentors.length === 0 ? (
                            <div className="flex justify-center py-4"><Loader2 className="animate-spin text-blue-500" size={20} /></div>
                        ) : trackMentors.length === 0 ? (
                            <p className="text-sm text-gray-500 py-4 text-center">No mentors assigned to this track yet.</p>
                        ) : (
                            <ul className="divide-y divide-gray-100 border border-gray-200 rounded-md overflow-hidden">
                                {trackMentors.map((tm: any) => (
                                    <li key={tm.mentorId} className="flex justify-between items-center p-3 text-sm hover:bg-gray-50">
                                        <div>
                                            <p className="font-medium text-gray-800">{tm.mentorFullName || tm.mentorUsername}</p>
                                            <p className="text-xs text-gray-500">ID: {tm.mentorId}</p>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveMentor(tm.mentorId)}
                                            disabled={mentorLoading}
                                            className="text-red-500 hover:text-red-700 disabled:opacity-50 cursor-pointer"
                                            title="Remove mentor"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={() => setMentorModalTrackId(null)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </Modal>

            {isEditModalOpen && editingTrack && (
                <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditingTrack(null); }}>
                    <form onSubmit={handleUpdateTrack} className="p-6 max-w-lg space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Tag size={20} className="text-blue-600" />
                            Edit Track
                        </h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Track Name *</label>
                            <input
                                type="text"
                                value={editingTrack.name}
                                onChange={e => setEditingTrack({ ...editingTrack, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm bg-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Track Description</label>
                            <textarea
                                value={editingTrack.description || ''}
                                onChange={e => setEditingTrack({ ...editingTrack, description: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm bg-white"
                                rows={3}
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => { setIsEditModalOpen(false); setEditingTrack(null); }}
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
        <ConfirmModal
            isOpen={confirmOpen}
            title={confirmTitle}
            message={confirmMessage}
            isDanger={confirmIsDanger}
            confirmText={confirmIsDanger ? 'Delete' : 'Confirm'}
            onConfirm={confirmAction}
            onCancel={() => setConfirmOpen(false)}
        />
        </>
    );
};

export default TracksTab;

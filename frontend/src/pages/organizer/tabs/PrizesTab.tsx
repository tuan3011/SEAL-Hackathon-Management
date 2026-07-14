import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../../services/api';
import { Trophy, Plus, Loader2, Gift, CheckCircle, Edit2, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '../../../components/ConfirmModal';

interface Prize {
    id: number;
    name: string;
    description: string;
    rank: number;
    winningTeamId?: number;
    winningTeamName?: string;
    trackId?: number;
    trackName?: string;
    cash?: number;
    cup?: string;
    certificate?: string;
    currency?: string;
}

interface Team {
    id: number;
    name: string;
    trackId?: number;
    trackName?: string;
}

interface Track {
    id: number;
    name: string;
}

interface PrizeForm {
    name: string;
    description: string;
    rank: number;
    trackId: number | '';
    cash: number | '';
    cup: string;
    certificate: string;
    currency: string;
}

const PrizesTab: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const [prizes, setPrizes] = useState<Prize[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [tracks, setTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true);

    // Form states
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [form, setForm] = useState<PrizeForm>({ name: '', description: '', rank: 1, trackId: '', cash: '', cup: '', certificate: '', currency: 'VND' });
    const [saving, setSaving] = useState(false);

    // Assign states
    const [assigningPrizeId, setAssigningPrizeId] = useState<number | null>(null);
    const [assignTeamId, setAssignTeamId] = useState<number | ''>('');

    const [autoAssigning, setAutoAssigning] = useState(false);

    // Confirm Modal State
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmTitle, setConfirmTitle] = useState('');
    const [confirmMessage, setConfirmMessage] = useState('');
    const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
    const [confirmIsDanger, setConfirmIsDanger] = useState(false);

    // Filter states
    const [selectedTrackId, setSelectedTrackId] = useState<number | ''>('');


    const fetchData = async () => {
        if (!eventId) return;
        setLoading(true);
        try {
            const [prizeRes, teamRes, trackRes] = await Promise.all([
                selectedTrackId ? api.get(`/prizes/event/${eventId}/track/${selectedTrackId}`) : api.get(`/prizes/event/${eventId}`),
                api.get(`/teams/event/${eventId}`),
                api.get(`/tracks/hackathon/${eventId}`)
            ]);

            const prizeData = prizeRes.data.data ?? prizeRes.data;
            const teamData = teamRes.data.data ?? teamRes.data;
            const trackData = trackRes.data.data ?? trackRes.data;

            setPrizes(Array.isArray(prizeData) ? prizeData : []);
            setTeams(Array.isArray(teamData) ? teamData : []);

            setTracks(Array.isArray(trackData) ? trackData : []);
        } catch (err: any) {
            console.error('Failed to load prize data', err);
            toast.error('Failed to load prize data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [eventId, selectedTrackId]);

    const handleCreateOrUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) { toast.error('Prize name is required.'); return; }

        setSaving(true);
        try {
            const payload = {
                name: form.name,
                description: form.description,
                rank: form.rank,
                trackId: form.trackId ? Number(form.trackId) : null,
                hackathonEventId: Number(eventId),
                cash: form.cash !== '' ? Number(form.cash) : null,
                cup: form.cup.trim() || null,
                certificate: form.certificate.trim() || null,
                currency: form.currency
            };

            if (isEditing) {
                if (!payload.trackId || !payload.rank) {
                    toast.error('Track and Rank are required for prizes.');
                    setSaving(false);
                    return;
                }
                await api.put(`/prizes/${isEditing}`, payload);
                toast.success('Prize updated successfully!');
            } else {
                await api.post('/prizes', { ...payload, hackathonEventId: Number(eventId) });
                toast.success('Prize created successfully!');
            }

            setForm({ name: '', description: '', rank: 1, trackId: '', cash: '', cup: '', certificate: '', currency: 'VND' });
            setShowForm(false);
            setIsEditing(null);
            fetchData();
        } catch (err: any) {
            toast.error(err.response?.data?.error?.message || `Failed to ${isEditing ? 'update' : 'create'} prize.`);
        } finally {
            setSaving(false);
        }
    };

    const handleEditClick = (prize: Prize) => {
        setForm({
            name: prize.name,
            description: prize.description || '',
            rank: prize.rank || 1,
            trackId: prize.trackId || '',
            cash: prize.cash !== undefined && prize.cash !== null ? prize.cash : '',
            cup: prize.cup || '',
            certificate: prize.certificate || '',
            currency: prize.currency || 'VND'
        });
        setIsEditing(prize.id);
        setShowForm(true);
    };

    const handleDelete = (prizeId: number) => {
        setConfirmTitle('Delete Prize');
        setConfirmMessage('Are you sure you want to delete this prize?');
        setConfirmIsDanger(true);
        setConfirmAction(() => async () => {
            try {
                await api.delete(`/prizes/${prizeId}`);
                toast.success('Prize deleted successfully!');
                fetchData();
            } catch (err: any) {
                toast.error(err.response?.data?.error?.message || 'Failed to delete prize.');
            }
            setConfirmOpen(false);
        });
        setConfirmOpen(true);
    };

    const handleAssign = async (prizeId: number) => {
        if (!assignTeamId) { toast.error('Please select a team.'); return; }
        try {
            await api.patch(`/prizes/${prizeId}/assign`, { teamId: assignTeamId });
            toast.success('Prize assigned successfully!');
            setAssigningPrizeId(null);
            setAssignTeamId('');
            fetchData();
        } catch (err: any) {
            toast.error(err.response?.data?.error?.message || 'Failed to assign prize.');
        }
    };

    const handleAutoAssign = () => {
        setConfirmTitle('Auto-Assign Prizes');
        setConfirmMessage('Auto-assign will evaluate all completed submissions and award prizes based on score rank. Continue?');
        setConfirmIsDanger(false);
        setConfirmAction(() => async () => {
            setAutoAssigning(true);
            setConfirmOpen(false);
            try {
                await api.post(`/prizes/event/${eventId}/auto-assign`);
                toast.success('Prizes auto-assigned successfully!');
                fetchData();
            } catch (err: any) {
                toast.error(err.response?.data?.error?.message || 'Failed to auto-assign prizes.');
            } finally {
                setAutoAssigning(false);
            }
        });
        setConfirmOpen(true);
    };

    return (
        <>
            <div>
            <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <Trophy size={20} className="text-yellow-500" />
                    <h2 className="text-xl font-semibold text-gray-800">Prizes & Winners</h2>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                    <select
                        value={selectedTrackId}
                        onChange={e => setSelectedTrackId(e.target.value ? Number(e.target.value) : '')}
                        className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                    >
                        <option value="">All Tracks</option>
                        {tracks.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>

                    {prizes.length > 0 && (
                        <button
                            onClick={handleAutoAssign}
                            disabled={autoAssigning}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                            <Trophy size={14} />
                            {autoAssigning ? 'Assigning...' : 'Auto Assign Prizes'}
                        </button>
                    )}
                    <button
                        onClick={() => {
                            setForm({ name: '', description: '', rank: 1, trackId: '', cash: '', cup: '', certificate: '', currency: 'VND' });
                            setIsEditing(null);
                            setShowForm(s => !s);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        {showForm && !isEditing ? <X size={14} /> : <Plus size={14} />}
                        {showForm && !isEditing ? 'Close Form' : 'Add Prize'}
                    </button>
                </div>
            </div>

            {showForm && (
                <form onSubmit={handleCreateOrUpdate} className="mb-6 border border-yellow-200 bg-yellow-50 rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-bold text-yellow-800 flex items-center gap-2">
                            {isEditing ? <Edit2 size={16} /> : <Plus size={16} />}
                            {isEditing ? 'Edit Prize' : 'Create New Prize'}
                        </h3>
                        {isEditing && (
                            <button type="button" onClick={() => { setShowForm(false); setIsEditing(null); }} className="text-gray-400 hover:text-gray-600">
                                <X size={18} />
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Prize Name <span className="text-red-500">*</span></label>
                            <input
                                value={form.name}
                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                placeholder="e.g. 1st Place Grand Prize"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Track <span className="text-red-500">*</span></label>
                            <select
                                value={form.trackId}
                                onChange={e => setForm(f => ({ ...f, trackId: e.target.value ? Number(e.target.value) : '' }))}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
                                required
                            >
                                <option value="" disabled>-- Select Track --</option>
                                {tracks.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Rank <span className="text-red-500">*</span></label>
                            <input
                                type="number" min="1"
                                value={form.rank || ''}
                                onChange={e => setForm(f => ({ ...f, rank: Number(e.target.value) }))}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
                            />
                        </div>
                        <div className="md:col-span-3">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                            <input
                                value={form.description}
                                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                placeholder="e.g. 1st Place Grand Prize + mentorship package"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
                            />
                        </div>
                        <div className="md:col-span-1">
                            <div className="grid grid-cols-3 gap-2">
                                <div className="col-span-2">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Cash Value</label>
                                    <input
                                        type="number" min="0" step="0.01"
                                        value={form.cash}
                                        onChange={e => setForm(f => ({ ...f, cash: e.target.value !== '' ? Number(e.target.value) : '' }))}
                                        placeholder="e.g. 5000000"
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Currency</label>
                                    <select
                                        value={form.currency}
                                        onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
                                    >
                                        <option value="VND">VNĐ</option>
                                        <option value="USD">USD ($)</option>
                                    </select>
                                </div>
                            </div>
                            {form.cash !== '' && (
                                <div className="text-[10px] text-emerald-700 font-semibold italic mt-1">
                                    Preview: {form.currency === 'USD' ? '$' : ''}{Number(form.cash).toLocaleString()} {form.currency === 'USD' ? 'USD' : 'VNĐ'}
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Cup (e.g. Gold Cup)</label>
                            <input
                                value={form.cup}
                                onChange={e => setForm(f => ({ ...f, cup: e.target.value }))}
                                placeholder="e.g. Gold Cup"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Certificate (e.g. Certificate of Excellence)</label>
                            <input
                                value={form.certificate}
                                onChange={e => setForm(f => ({ ...f, certificate: e.target.value }))}
                                placeholder="e.g. Certificate of Excellence"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2 justify-end pt-2">
                        <button type="button" onClick={() => { setShowForm(false); setIsEditing(null); }} className="px-4 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition-colors">Cancel</button>
                        <button type="submit" disabled={saving} className="px-4 py-2 text-xs font-medium text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 shadow-sm disabled:opacity-50 transition-colors flex items-center gap-1.5">
                            {saving ? <Loader2 size={14} className="animate-spin" /> : null}
                            {isEditing ? 'Save Changes' : 'Create Prize'}
                        </button>
                    </div>
                </form>
            )}

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-yellow-500" size={32} />
                </div>
            ) : prizes.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                    <Gift className="mx-auto mb-3 text-gray-400" size={48} />
                    <h3 className="text-gray-900 font-semibold mb-1">No Prizes Found</h3>
                    <p className="text-sm text-gray-500">Get started by creating a new prize for this event.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {prizes.map(prize => (
                        <div key={prize.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full relative group">

                            {(!prize.trackId || !prize.rank) && (
                                <div className="absolute top-0 left-0 right-0 bg-red-100 text-red-700 text-xs text-center py-1 font-bold rounded-t-xl">
                                    Warning: Missing Track or Rank! Please update or delete this prize.
                                </div>
                            )}

                            <div className="absolute top-4 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                <button
                                    onClick={() => handleEditClick(prize)}
                                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                    title="Edit prize"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(prize.id)}
                                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                    title="Delete prize"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className={`flex items-start gap-4 mb-4 ${(!prize.trackId || !prize.rank) ? 'mt-4' : ''}`}>
                                <div className={`p-3 rounded-full flex-shrink-0 ${prize.rank === 1 ? 'bg-yellow-100 text-yellow-600' :
                                    prize.rank === 2 ? 'bg-gray-100 text-gray-500' :
                                        prize.rank === 3 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                                    }`}>
                                    <Trophy size={24} />
                                </div>
                                <div className="pr-12">
                                    <h3 className="font-bold text-gray-900 line-clamp-2">{prize.name}</h3>
                                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                                            Rank #{prize.rank}
                                        </span>
                                        {prize.trackName && (
                                            <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                {prize.trackName}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {prize.description && (
                                <p className="text-sm text-gray-600 mb-3 line-clamp-3 flex-grow">{prize.description}</p>
                            )}

                            {/* Reward section */}
                            <div className="mt-2 mb-4 p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1.5">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Rewards</span>
                                <div className="flex flex-col gap-1.5">
                                    {prize.cash !== undefined && prize.cash !== null && (
                                        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                                            <span>💵</span>
                                            <span>
                                                {prize.currency === 'USD' ? '$' : ''}
                                                {prize.cash.toLocaleString()}
                                                {prize.currency === 'USD' ? ' USD' : ' VNĐ'}
                                            </span>
                                        </div>
                                    )}
                                    {prize.cup && (
                                        <div className="flex items-center gap-2 text-xs font-semibold text-yellow-700">
                                            <span>🏆</span>
                                            <span>{prize.cup}</span>
                                        </div>
                                    )}
                                    {prize.certificate && (
                                        <div className="flex items-center gap-2 text-xs font-semibold text-blue-700">
                                            <span>📜</span>
                                            <span>{prize.certificate}</span>
                                        </div>
                                    )}
                                    {!prize.cash && !prize.cup && !prize.certificate && (
                                        <span className="text-xs text-slate-400 italic">No specific rewards defined</span>
                                    )}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 mt-auto">
                                {prize.winningTeamId ? (
                                    <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg border border-green-100">
                                        <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                                        <span className="text-sm font-semibold text-green-800 line-clamp-1">
                                            Awarded: {prize.winningTeamName || `Team #${prize.winningTeamId}`}
                                        </span>
                                    </div>
                                ) : (
                                    <div>
                                        {assigningPrizeId === prize.id ? (
                                            <div className="flex flex-col gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                                <label className="text-xs font-medium text-gray-700">Select Winner</label>
                                                <select
                                                    value={assignTeamId}
                                                    onChange={e => setAssignTeamId(Number(e.target.value))}
                                                    className="w-full text-sm px-2.5 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:border-yellow-500"
                                                >
                                                    <option value="">-- Select team --</option>
                                                    {teams
                                                        .filter(t => !prize.trackId || t.trackId === prize.trackId)
                                                        .map(t => (
                                                            <option key={t.id} value={t.id}>
                                                                {t.name} {t.trackName ? `(${t.trackName})` : ''}
                                                            </option>
                                                        ))
                                                    }
                                                </select>
                                                <div className="flex justify-end gap-2 mt-1">
                                                    <button
                                                        onClick={() => { setAssigningPrizeId(null); setAssignTeamId(''); }}
                                                        className="text-xs px-3 py-1.5 text-gray-600 hover:bg-gray-200 rounded-md transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => handleAssign(prize.id)}
                                                        className="text-xs px-3 py-1.5 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors shadow-sm"
                                                    >
                                                        Confirm
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setAssigningPrizeId(prize.id)}
                                                className="w-full py-2 flex items-center justify-center gap-1.5 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100"
                                            >
                                                <Gift size={16} />
                                                Assign manually
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}


        </div>
        <ConfirmModal
            isOpen={confirmOpen}
            title={confirmTitle}
            message={confirmMessage}
            isDanger={confirmIsDanger}
            confirmText={confirmIsDanger ? 'Delete' : 'Continue'}
            onConfirm={confirmAction}
            onCancel={() => setConfirmOpen(false)}
        />
        </>
    );
};

export default PrizesTab;

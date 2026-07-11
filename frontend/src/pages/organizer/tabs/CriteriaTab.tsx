import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../../services/api';
import { Target, Plus, Trash2, Loader2, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../../components/Modal';
import ConfirmModal from '../../../components/ConfirmModal';

interface Criterion {
    id: number;
    name: string;
    description: string;
    weight: number;
    maxScore: number;
}

interface CriterionForm {
    name: string;
    description: string;
    weight: number;
    maxScore: number;
}

const emptyForm: CriterionForm = { name: '', description: '', weight: 20, maxScore: 10 };

const CriteriaTab: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const [criteria, setCriteria] = useState<Criterion[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<CriterionForm>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingCriterion, setEditingCriterion] = useState<Criterion | null>(null);

    // Confirm Modal State
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmTitle, setConfirmTitle] = useState('');
    const [confirmMessage, setConfirmMessage] = useState('');
    const [confirmAction, setConfirmAction] = useState<() => void>(() => {});

    const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);

    const fetchCriteria = async () => {
        if (!eventId) return;
        try {
            const res = await api.get(`/criteria/event/${eventId}`);
            const data = res.data.data ?? res.data;
            setCriteria(Array.isArray(data) ? data : []);
        } catch {
            toast.error('Failed to load criteria.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCriteria(); }, [eventId]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) { toast.error('Criterion name is required.'); return; }
        if (form.weight <= 0 || form.weight > 100) { toast.error('Weight must be between 1 and 100.'); return; }
        if (totalWeight + form.weight > 100) { toast.error(`Total weight would exceed 100%. Current total: ${totalWeight}%.`); return; }
        if (form.maxScore <= 0) { toast.error('Max score must be positive.'); return; }

        setSaving(true);
        try {
            await api.post('/criteria', { ...form, hackathonEventId: Number(eventId) });
            toast.success('Criterion created!');
            setForm(emptyForm);
            setShowForm(false);
            fetchCriteria();
        } catch (err: any) {
            toast.error(err.response?.data?.error?.message || 'Failed to create criterion.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = (id: number) => {
        setConfirmTitle('Delete Criterion');
        setConfirmMessage('Are you sure you want to delete this criterion? Existing scores for this criterion will be affected.');
        setConfirmAction(() => async () => {
            try {
                await api.delete(`/criteria/${id}?eventId=${eventId}`);
                toast.success('Criterion deleted successfully.');
                setCriteria(prev => prev.filter(c => c.id !== id));
            } catch (err: any) {
                toast.error(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to delete criterion.');
            }
            setConfirmOpen(false);
        });
        setConfirmOpen(true);
    };

    const handleApplyTemplate = async (templateType: 'standard' | 'tech' | 'business') => {
        let templateCriteria: Omit<Criterion, 'id'>[] = [];
        if (templateType === 'standard') {
            templateCriteria = [
                { name: 'Innovation', description: 'Evaluates the originality, creativity, and uniqueness of the idea.', weight: 30, maxScore: 10 },
                { name: 'Technical Execution', description: 'Evaluates code quality, software architecture, and technical complexity.', weight: 30, maxScore: 10 },
                { name: 'Feasibility', description: 'Evaluates the business model viability, implementation realism, and market fit.', weight: 30, maxScore: 10 },
                { name: 'Pitch & Presentation', description: 'Evaluates communication quality, demo flow, and slide layout.', weight: 10, maxScore: 10 }
            ];
        } else if (templateType === 'tech') {
            templateCriteria = [
                { name: 'Technical Execution', description: 'Evaluates code quality, technical complexity, completeness, and stack robustness.', weight: 50, maxScore: 10 },
                { name: 'Innovation', description: 'Evaluates originality, creativity, and problem-solving uniqueness.', weight: 30, maxScore: 10 },
                { name: 'Pitch & Q&A', description: 'Evaluates demo delivery, communication, and answering judges questions.', weight: 20, maxScore: 10 }
            ];
        } else if (templateType === 'business') {
            templateCriteria = [
                { name: 'Feasibility & Business', description: 'Evaluates business model viability, scalability, and market-fit analysis.', weight: 50, maxScore: 10 },
                { name: 'Innovation', description: 'Evaluates originality, creative approach, and competitive advantage.', weight: 30, maxScore: 10 },
                { name: 'Pitch & Presentation', description: 'Evaluates presentation design, storytelling, and delivery.', weight: 20, maxScore: 10 }
            ];
        }

        const loadingToast = toast.loading('Applying template criteria...');
        try {
            for (const c of templateCriteria) {
                await api.post('/criteria', {
                    ...c,
                    hackathonEventId: Number(eventId)
                });
            }
            toast.success('Template applied successfully!', { id: loadingToast });
            fetchCriteria();
        } catch (err: any) {
            console.error('Failed to apply template:', err);
            const errorMessage = err.response?.data?.error?.message || err.response?.data?.message || err.message;
            toast.error('Failed to apply template: ' + errorMessage, { id: loadingToast });
        }
    };

    const openEditModal = (criterion: Criterion) => {
        setEditingCriterion({ ...criterion });
        setIsEditModalOpen(true);
    };

    const handleUpdateCriterion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCriterion || !editingCriterion.name.trim()) {
            toast.error('Criterion name is required.');
            return;
        }
        const oldCriterion = criteria.find(c => c.id === editingCriterion.id);
        const oldWeight = oldCriterion ? oldCriterion.weight : 0;
        if (editingCriterion.weight <= 0 || editingCriterion.weight > 100) {
            toast.error('Weight must be between 1 and 100.');
            return;
        }
        if (totalWeight - oldWeight + editingCriterion.weight > 100) {
            toast.error(`Total weight would exceed 100%. Current total: ${totalWeight - oldWeight + editingCriterion.weight}%.`);
            return;
        }
        const loadingToast = toast.loading('Updating criterion...');
        try {
            await api.put(`/criteria/${editingCriterion.id}`, {
                name: editingCriterion.name,
                description: editingCriterion.description,
                weight: editingCriterion.weight,
                maxScore: editingCriterion.maxScore,
                hackathonEventId: Number(eventId),
            });
            toast.success('Criterion updated successfully!', { id: loadingToast });
            setIsEditModalOpen(false);
            setEditingCriterion(null);
            fetchCriteria();
        } catch (err: any) {
            toast.error(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to update criterion.', { id: loadingToast });
        }
    };

    if (loading) return (
        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-500" size={28} /></div>
    );

    return (
        <>
            <div>
            <div className="flex items-center gap-2 mb-4">
                <Target size={20} className="text-gray-600" />
                <h2 className="text-xl font-semibold text-gray-800">Scoring Criteria</h2>
                <div className="ml-auto flex items-center gap-3">
                    <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                        totalWeight === 100 ? 'bg-green-100 text-green-700' :
                        totalWeight > 100 ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                    }`}>
                        Total weight: {totalWeight}%
                    </div>
                    <button
                        onClick={() => setShowForm(s => !s)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={14} />
                        Add Criterion
                    </button>
                </div>
            </div>

            {/* Visual Weight Progress Bar */}
            <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-center mb-1 text-xs font-medium text-gray-700">
                    <span>Total Weight Allocation Progress</span>
                    <span className={totalWeight === 100 ? 'text-green-600 font-semibold' : 'text-yellow-600'}>
                        {totalWeight}% / 100%
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div
                        className={`h-2.5 rounded-full transition-all duration-300 ${
                            totalWeight === 100 ? 'bg-green-500' :
                            totalWeight > 100 ? 'bg-red-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(totalWeight, 100)}%` }}
                    />
                </div>
                {totalWeight !== 100 && (
                    <p className="text-[11px] text-gray-500 mt-1.5">
                        * Note: Total criteria weight must be exactly 100% to publish the event.
                    </p>
                )}

                {criteria.length === 0 && (
                    <div className="mt-4 pt-3 border-t border-gray-200">
                        <p className="text-xs font-semibold text-gray-700 mb-2">💡 Quick Setup Templates:</p>
                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={() => handleApplyTemplate('standard')}
                                className="text-left px-3 py-2 text-xs bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-blue-500 hover:text-blue-600 transition-colors shadow-xs cursor-pointer font-medium"
                            >
                                📋 Standard Hackathon
                                <span className="block text-[10px] text-gray-400 font-normal mt-0.5">Innovation (30%), Tech (30%), Feasibility (30%), Pitch (10%)</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleApplyTemplate('tech')}
                                className="text-left px-3 py-2 text-xs bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-blue-500 hover:text-blue-600 transition-colors shadow-xs cursor-pointer font-medium"
                            >
                                💻 Tech Heavy
                                <span className="block text-[10px] text-gray-400 font-normal mt-0.5">Tech Execution (50%), Innovation (30%), Pitch (20%)</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleApplyTemplate('business')}
                                className="text-left px-3 py-2 text-xs bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-blue-500 hover:text-blue-600 transition-colors shadow-xs cursor-pointer font-medium"
                            >
                                📊 Business Pitch
                                <span className="block text-[10px] text-gray-400 font-normal mt-0.5">Feasibility & Business (50%), Innovation (30%), Pitch (20%)</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {showForm && (
                <form onSubmit={handleCreate} className="mb-6 border border-blue-200 bg-blue-50 rounded-lg p-4 space-y-3">
                    <h3 className="text-sm font-semibold text-blue-800">New Criterion</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Name *</label>
                            <input
                                value={form.name}
                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                placeholder="e.g. Innovation"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                            <input
                                value={form.description}
                                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                placeholder="What this criterion evaluates"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Weight (%) *</label>
                            <input
                                type="number" min="1" max="100"
                                value={form.weight}
                                onChange={e => setForm(f => ({ ...f, weight: Number(e.target.value) }))}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            <p className="text-xs text-gray-400 mt-0.5">Remaining: {100 - totalWeight}%</p>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Max Score *</label>
                            <input
                                type="number" min="1" max="100"
                                value={form.maxScore}
                                onChange={e => setForm(f => ({ ...f, maxScore: Number(e.target.value) }))}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                        <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1.5 text-xs text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                        <button type="submit" disabled={saving} className="px-3 py-1.5 text-xs text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                            {saving ? 'Saving...' : 'Create'}
                        </button>
                    </div>
                </form>
            )}

            {criteria.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                    <Target className="mx-auto mb-2" size={36} />
                    <p className="text-sm">No scoring criteria yet. Add criteria to enable judging.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {criteria.map(c => (
                        <div key={c.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <p className="font-semibold text-gray-900 text-sm">{c.name}</p>
                                    <span className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded font-medium">{c.weight}%</span>
                                    <span className="text-xs text-gray-400">Max: {c.maxScore} pts</span>
                                </div>
                                {c.description && <p className="text-xs text-gray-500 mt-0.5">{c.description}</p>}
                            </div>
                            {/* Weight bar */}
                            <div className="hidden md:flex items-center gap-2 w-32">
                                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 rounded-full"
                                        style={{ width: `${c.weight}%` }}
                                    />
                                </div>
                                <span className="text-xs text-gray-400 w-8 text-right">{c.weight}%</span>
                            </div>
                            <div className="flex items-center gap-1">
                                 <button
                                    onClick={() => openEditModal(c)}
                                    className="text-blue-400 hover:text-blue-600 transition-colors p-1 cursor-pointer"
                                    title="Edit criterion"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(c.id)}
                                    className="text-red-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                                    title="Delete criterion"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isEditModalOpen && editingCriterion && (
                <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditingCriterion(null); }}>
                    <form onSubmit={handleUpdateCriterion} className="p-6 max-w-lg space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Target size={20} className="text-blue-600" />
                            Edit Scoring Criterion
                        </h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Criterion Name *</label>
                            <input
                                type="text"
                                value={editingCriterion.name}
                                onChange={e => setEditingCriterion({ ...editingCriterion, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm bg-white"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Weight % *</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={editingCriterion.weight}
                                    onChange={e => setEditingCriterion({ ...editingCriterion, weight: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm bg-white"
                                    required
                                />
                                <p className="text-xs text-gray-400 mt-1">Max remaining: {100 - totalWeight + (criteria.find(x => x.id === editingCriterion.id)?.weight || 0)}%</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Max Score *</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={editingCriterion.maxScore}
                                    onChange={e => setEditingCriterion({ ...editingCriterion, maxScore: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm bg-white"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                value={editingCriterion.description}
                                onChange={e => setEditingCriterion({ ...editingCriterion, description: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm bg-white"
                                rows={3}
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => { setIsEditModalOpen(false); setEditingCriterion(null); }}
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
            isDanger={true}
            confirmText="Delete"
            onConfirm={confirmAction}
            onCancel={() => setConfirmOpen(false)}
        />
        </>
    );
};

export default CriteriaTab;

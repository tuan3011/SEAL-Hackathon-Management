import React, { useEffect, useState } from 'react';
import { Criterion, CriterionService, CreateCriterionRequest, UpdateCriterionRequest } from '../services/CriterionService';
import Modal from '../components/Modal';
import { ClipboardList, Loader2, Plus, Edit2, Trash2, ShieldCheck, ListChecks } from 'lucide-react';
import toast from 'react-hot-toast';
import Authorizable from '../components/Authorizable';
import { Role } from '../services/authUtils';

const CriterionPage: React.FC = () => {
    const [criteria, setCriteria] = useState<Criterion[]>([]);
    const [defaultCriteria, setDefaultCriteria] = useState<Criterion[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [newCriterion, setNewCriterion] = useState<CreateCriterionRequest>({ name: '', description: '', weight: 0 });
    const [selectedCriterion, setSelectedCriterion] = useState<Criterion | null>(null);
    const [isDefault, setIsDefault] = useState(false);

    useEffect(() => {
        fetchCriteria();
    }, []);

    const fetchCriteria = async () => {
        setLoading(true);
        try {
            const eventCriteria = await CriterionService.getCriteriaForEvent(1);
            const defaultCrit = await CriterionService.getDefaultCriteria();
            setCriteria(eventCriteria);
            setDefaultCriteria(defaultCrit);
        } catch (error) {
            console.error('Failed to fetch criteria:', error);
            toast.error('Failed to load criteria.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCriterion = async () => {
        const loadingToast = toast.loading('Creating criterion...');
        try {
            const request: CreateCriterionRequest = {
                ...newCriterion,
                hackathonEventId: isDefault ? undefined : 1,
            };
            await CriterionService.createCriterion(request);
            toast.success('Criterion created successfully', { id: loadingToast });
            fetchCriteria();
            setIsCreateModalOpen(false);
            setNewCriterion({ name: '', description: '', weight: 0 });
        } catch (error: any) {
            console.error('Failed to create criterion:', error);
            toast.error('Failed to create criterion.', { id: loadingToast });
        }
    };

    const handleUpdateCriterion = async () => {
        if (!selectedCriterion) return;
        const loadingToast = toast.loading('Updating criterion...');
        try {
            const updateRequest: UpdateCriterionRequest = {
                name: selectedCriterion.name,
                description: selectedCriterion.description,
                weight: selectedCriterion.weight,
            };
            await CriterionService.updateCriterion(selectedCriterion.id, updateRequest);
            toast.success('Criterion updated successfully', { id: loadingToast });
            fetchCriteria();
            setIsEditModalOpen(false);
            setSelectedCriterion(null);
        } catch (error: any) {
            console.error('Failed to update criterion:', error);
            toast.error('Failed to update criterion.', { id: loadingToast });
        }
    };

    const handleDeleteCriterion = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this criterion?')) return;
        const loadingToast = toast.loading('Deleting criterion...');
        try {
            await CriterionService.deleteCriterion(id);
            toast.success('Criterion deleted successfully', { id: loadingToast });
            fetchCriteria();
        } catch (error: any) {
            console.error('Failed to delete criterion:', error);
            toast.error('Failed to delete criterion.', { id: loadingToast });
        }
    };

    const openEditModal = (criterion: Criterion) => {
        setSelectedCriterion(criterion);
        setIsEditModalOpen(true);
    };

    const CriterionTable = ({ data, title, icon: Icon }: { data: Criterion[], title: string, icon: any }) => (
        <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Icon size={20} className="text-blue-600" />
                {title}
            </h2>
            <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Criterion</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data.map((criterion) => (
                                <tr key={criterion.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{criterion.name}</div>
                                        <div className="text-sm text-gray-500 max-w-md truncate" title={criterion.description}>
                                            {criterion.description}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                                        {criterion.weight}%
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <Authorizable allowedRoles={[Role.ADMIN, Role.ORGANIZER]}>
                                            <div className="flex space-x-3">
                                                <button onClick={() => openEditModal(criterion)} className="text-blue-600 hover:text-blue-900 transition-colors" title="Edit">
                                                    <Edit2 size={18} />
                                                </button>
                                                <button onClick={() => handleDeleteCriterion(criterion.id)} className="text-red-600 hover:text-red-900 transition-colors" title="Delete">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </Authorizable>
                                    </td>
                                </tr>
                            ))}
                            {data.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-6 py-10 text-center text-gray-500 italic">
                                        No criteria found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <ClipboardList className="text-blue-600" />
                        Judging Criteria
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Define how projects will be scored by judges.</p>
                </div>
                
                <Authorizable allowedRoles={[Role.ADMIN, Role.ORGANIZER]}>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm flex items-center gap-2 transition-colors"
                    >
                        <Plus size={18} />
                        Create Criterion
                    </button>
                </Authorizable>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                </div>
            ) : (
                <>
                    <CriterionTable data={criteria} title="Event Specific Criteria" icon={ListChecks} />
                    <CriterionTable data={defaultCriteria} title="Default System Criteria" icon={ShieldCheck} />
                </>
            )}

            {/* Create Modal */}
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
                <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Criterion</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                placeholder="e.g. Innovation"
                                value={newCriterion.name}
                                onChange={(e) => setNewCriterion({ ...newCriterion, name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                placeholder="What should judges look for?"
                                value={newCriterion.description}
                                onChange={(e) => setNewCriterion({ ...newCriterion, description: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Weight (%)</label>
                            <input
                                type="number"
                                value={newCriterion.weight}
                                onChange={(e) => setNewCriterion({ ...newCriterion, weight: Number(e.target.value) })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isDefault"
                                checked={isDefault}
                                onChange={(e) => setIsDefault(e.target.checked)}
                                className="rounded text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor="isDefault" className="text-sm text-gray-700">Make this a default criterion for all events</label>
                        </div>
                    </div>
                    <div className="mt-6 flex gap-3">
                        <button
                            onClick={handleCreateCriterion}
                            className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            Create
                        </button>
                        <button
                            onClick={() => setIsCreateModalOpen(false)}
                            className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Edit Modal */}
            {selectedCriterion && (
                <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
                    <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Criterion</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={selectedCriterion.name}
                                    onChange={(e) => setSelectedCriterion({ ...selectedCriterion, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={selectedCriterion.description}
                                    onChange={(e) => setSelectedCriterion({ ...selectedCriterion, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg h-24"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Weight (%)</label>
                                <input
                                    type="number"
                                    value={selectedCriterion.weight}
                                    onChange={(e) => setSelectedCriterion({ ...selectedCriterion, weight: Number(e.target.value) })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={handleUpdateCriterion}
                                className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                            >
                                Update
                            </button>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default CriterionPage;

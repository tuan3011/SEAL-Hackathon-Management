import React, { useEffect, useState } from 'react';
import { TeamMember, TeamMemberService, AddTeamMemberRequest } from '../services/TeamMemberService';
import Modal from '../components/Modal';
import { Users, Loader2, Plus, Trash2, Shield, User } from 'lucide-react';
import toast from 'react-hot-toast';
import Authorizable from '../components/Authorizable';
import { Role } from '../services/authUtils';

const TeamMemberPage: React.FC = () => {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewTeamId, setViewTeamId] = useState<number>(1);
    const [newMember, setNewMember] = useState<AddTeamMemberRequest>({ userId: 0, teamId: 1, isLeader: false });

    useEffect(() => {
        fetchMembers();
    }, [viewTeamId]);

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const data = await TeamMemberService.getTeamMembers(viewTeamId);
            setMembers(data);
        } catch (error) {
            console.error('Failed to fetch team members:', error);
            toast.error('Failed to load team members.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddMember = async () => {
        const loadingToast = toast.loading('Adding team member...');
        try {
            await TeamMemberService.addTeamMember(newMember);
            toast.success('Member added successfully', { id: loadingToast });
            fetchMembers();
            setIsModalOpen(false);
            setNewMember({ userId: 0, teamId: viewTeamId, isLeader: false });
        } catch (error: any) {
            console.error('Failed to add team member:', error);
            toast.error('Failed to add member.', { id: loadingToast });
        }
    };

    const handleRemoveMember = async (id: number) => {
        if (!window.confirm('Are you sure you want to remove this member?')) return;
        const loadingToast = toast.loading('Removing member...');
        try {
            await TeamMemberService.removeTeamMember(id);
            toast.success('Member removed successfully', { id: loadingToast });
            fetchMembers();
        } catch (error: any) {
            console.error('Failed to remove team member:', error);
            toast.error('Failed to remove member.', { id: loadingToast });
        }
    };

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Users className="text-blue-600" />
                        Team Membership
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Manage users and roles within teams.</p>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-1 shadow-sm">
                        <span className="text-sm text-gray-500 mr-2">Team ID:</span>
                        <input
                            type="number"
                            value={viewTeamId}
                            onChange={(e) => setViewTeamId(Number(e.target.value))}
                            className="w-16 focus:outline-none font-medium text-blue-600"
                        />
                    </div>
                    
                    <Authorizable allowedRoles={[Role.ADMIN, Role.ORGANIZER]}>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm flex items-center gap-2 transition-colors"
                        >
                            <Plus size={18} />
                            Add Member
                        </button>
                    </Authorizable>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                </div>
            ) : members.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <Users className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No members</h3>
                    <p className="mt-1 text-sm text-gray-500">There are no members in this team.</p>
                </div>
            ) : (
                <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {members.map((member) => (
                                    <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                                                    <User size={20} />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">User ID: {member.userId}</div>
                                                    <div className="text-xs text-gray-400">ID: {member.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                                            {member.teamId}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {member.isLeader ? (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 flex items-center gap-1">
                                                    <Shield size={12} />
                                                    Team Leader
                                                </span>
                                            ) : (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-600">
                                                    Member
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <Authorizable 
                                                allowedRoles={[Role.ADMIN, Role.ORGANIZER]}
                                                fallback={<span className="text-gray-400 italic text-xs">View Only</span>}
                                            >
                                                <button
                                                    onClick={() => handleRemoveMember(member.id)}
                                                    className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-lg transition-colors"
                                                    title="Remove Member"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </Authorizable>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Add Team Member</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                            <input
                                type="number"
                                placeholder="Enter User ID"
                                value={newMember.userId || ''}
                                onChange={(e) => setNewMember({ ...newMember, userId: Number(e.target.value) })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Team ID</label>
                            <input
                                type="number"
                                value={newMember.teamId}
                                onChange={(e) => setNewMember({ ...newMember, teamId: Number(e.target.value) })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isLeader"
                                checked={newMember.isLeader}
                                onChange={(e) => setNewMember({ ...newMember, isLeader: e.target.checked })}
                                className="rounded text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor="isLeader" className="text-sm text-gray-700">Set as Team Leader</label>
                        </div>
                    </div>
                    <div className="mt-6 flex gap-3">
                        <button
                            onClick={handleAddMember}
                            className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            Add Member
                        </button>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default TeamMemberPage;

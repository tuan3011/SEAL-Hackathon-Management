import React, { useEffect, useState } from 'react';
import { UserService, User, PageResponse } from '../services/UserService';
import { Users, Loader2, CheckCircle, Search, ChevronLeft, ChevronRight, Plus, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import EmptyState from '../components/EmptyState';
import Skeleton from '../components/Skeleton';
import Modal from '../components/Modal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Role } from '../services/authUtils';
import { ExportService } from '../services/ExportService';

const UsersPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Pagination state
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [size] = useState(10);

    // Create User Modal state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createForm, setCreateForm] = useState({ username: '', email: '', password: '', role: Role.ORGANIZER });
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [page]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await UserService.getUsers(page, size);
            // Handle both Page object and raw array
            if (data && 'content' in data) {
                setUsers(data.content);
                setTotalPages(data.totalPages);
            } else if (Array.isArray(data)) {
                setUsers(data);
                setTotalPages(1);
            }
        } catch (err) {
            toast.error('Failed to fetch users. You may not have permissions.');
        } finally {
            setLoading(false);
        }
    };

    const handleApproveUser = async (id: number) => {
        const loadingToast = toast.loading('Approving user...');
        try {
            const updatedUser = await UserService.approveUser(id);
            setUsers(users.map(user => user.id === id ? updatedUser : user));
            toast.success('User approved successfully', { id: loadingToast });
        } catch (err) {
            toast.error('Failed to approve user.', { id: loadingToast });
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            await UserService.createUser(createForm);
            toast.success('Account created successfully');
            setIsCreateModalOpen(false);
            setCreateForm({ username: '', email: '', password: '', role: Role.ORGANIZER });
            fetchUsers(); // Refresh list
        } catch (err: any) {
            toast.error(err.response?.data?.error?.message || 'Failed to create user');
        } finally {
            setIsCreating(false);
        }
    };

    // Client-side filtering as a fallback since backend doesn't have a search param implemented yet
    const filteredUsers = users.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Users className="text-blue-600" />
                        Users Management
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Manage user roles, status and approvals.</p>
                </div>
                
                {/* Search Bar & Action */}
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={16} className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-full md:w-64"
                        />
                    </div>
                    <Button 
                        onClick={() => ExportService.exportParticipantsCsv()}
                        variant="secondary"
                        leftIcon={<Download size={16} />}
                        className="whitespace-nowrap bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                    >
                        Export CSV
                    </Button>
                    <Button 
                        onClick={() => setIsCreateModalOpen(true)}
                        leftIcon={<Plus size={16} />}
                        className="whitespace-nowrap"
                    >
                        Create Account
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <Skeleton type="table-row" lines={5} />
                </div>
            ) : filteredUsers.length === 0 ? (
                <EmptyState 
                    icon={<Users size={40} className="text-gray-300" />}
                    title={searchTerm ? "No matching users" : "No users found"}
                    description={searchTerm ? `No users match "${searchTerm}"` : "There are no users registered in the system."}
                />
            ) : (
                <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden flex flex-col">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 rounded-full flex items-center justify-center font-bold">
                                                    {user.username.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-semibold text-gray-900">{user.username}</div>
                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2.5 py-1 inline-flex text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 inline-flex text-xs font-medium rounded-full border ${
                                                user.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                                            }`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {user.status === 'PENDING' ? (
                                                <button
                                                    onClick={() => handleApproveUser(user.id)}
                                                    className="inline-flex items-center gap-1 text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg transition-colors font-medium text-xs shadow-sm cursor-pointer"
                                                >
                                                    <CheckCircle size={14} />
                                                    Approve
                                                </button>
                                            ) : (
                                                <span className="text-gray-400 italic text-xs">No actions</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                                Page <span className="font-semibold text-gray-900">{page + 1}</span> of <span className="font-semibold text-gray-900">{totalPages}</span>
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                    className="p-1.5 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors cursor-pointer"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                    disabled={page === totalPages - 1}
                                    className="p-1.5 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors cursor-pointer"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Create User Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Create Internal Account"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                        <Button variant="primary" onClick={handleCreateUser} isLoading={isCreating}>Create Account</Button>
                    </>
                }
            >
                <form className="space-y-4" onSubmit={handleCreateUser}>
                    <p className="text-sm text-on-surface-variant mb-4">
                        Create accounts for high-level roles such as Admins, Organizers, and Judges. Participants should register themselves.
                    </p>
                    <Input 
                        label="Username" 
                        value={createForm.username} 
                        onChange={(e) => setCreateForm({...createForm, username: e.target.value})} 
                        required 
                    />
                    <Input 
                        label="Email" 
                        type="email" 
                        value={createForm.email} 
                        onChange={(e) => setCreateForm({...createForm, email: e.target.value})} 
                        required 
                    />
                    <Input 
                        label="Temporary Password" 
                        type="password" 
                        value={createForm.password} 
                        onChange={(e) => setCreateForm({...createForm, password: e.target.value})} 
                        required 
                    />
                    <div>
                        <label className="block text-sm font-semibold text-on-surface mb-2">Role</label>
                        <select 
                            className="w-full px-4 py-2 bg-white rounded-lg border border-outline-variant text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange"
                            value={createForm.role}
                            onChange={(e) => setCreateForm({...createForm, role: e.target.value as Role})}
                            required
                        >
                            <option value={Role.ADMIN}>Admin</option>
                            <option value={Role.ORGANIZER}>Organizer</option>
                            <option value={Role.JUDGE}>Judge</option>
                            <option value={Role.MENTOR}>Mentor</option>
                        </select>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default UsersPage;
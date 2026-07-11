import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { UserCheck, Clock } from 'lucide-react';

interface PendingUser {
    id: number;
    username: string;
    email: string;
    role: string;
}

const AdminPendingApprovalsPage: React.FC = () => {
    const [users, setUsers] = useState<PendingUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchPendingUsers = useCallback(async () => {
        try {
            setLoading(true);
            // Assuming the API supports pagination, but for now fetching without params
            const response = await api.get('/users/pending');
            setUsers(response.data.data);
        } catch (err) {
            setError('Failed to fetch users awaiting approval.');
            toast.error('Failed to fetch users awaiting approval.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPendingUsers();
    }, [fetchPendingUsers]);

    const handleApprove = async (userId: number) => {
        try {
            await api.patch(`/users/${userId}/approve`);
            toast.success('User approved successfully!');
            // Refresh the list by removing the approved user from the state
            setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
        } catch (err) {
            toast.error('Failed to approve user.');
        }
    };

    if (loading) return <div className="text-center p-8">Loading pending approvals...</div>;
    if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

    return (
        <div className="bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Pending User Approvals</h1>
            {users.length === 0 ? (
                <p className="text-gray-500">No users are currently awaiting approval.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Username</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Email</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Role</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="border-b">
                                    <td className="py-3 px-4">{user.username}</td>
                                    <td className="py-3 px-4">{user.email}</td>
                                    <td className="py-3 px-4">
                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <button 
                                            onClick={() => handleApprove(user.id)}
                                            className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                                            title="Approve User"
                                        >
                                            <UserCheck size={16} />
                                            Approve
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminPendingApprovalsPage;

import React, { useEffect, useState } from 'react';
import { PrizeService, Prize } from '../services/PrizeService';
import { Trophy, Loader2, Plus, Edit2, Trash2, Gift } from 'lucide-react';
import toast from 'react-hot-toast';
import Authorizable from '../components/Authorizable';
import { Role } from '../services/authUtils';

const PrizesPage: React.FC = () => {
    const [prizes, setPrizes] = useState<Prize[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPrizes();
    }, []);

    const fetchPrizes = async () => {
        setLoading(true);
        try {
            // For now, fetching prizes for hackathon event 1.
            const allPrizes = await PrizeService.getPrizesByEvent(1);
            setPrizes(allPrizes);
        } catch (err) {
            console.error('Failed to fetch prizes:', err);
            toast.error('Failed to fetch prizes.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Trophy className="text-yellow-500" />
                        Prizes
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Manage event prizes and award them to winning teams.</p>
                </div>
                
                <Authorizable allowedRoles={[Role.ADMIN, Role.ORGANIZER]}>
                    <button
                        onClick={() => toast('Create functionality coming soon!', { icon: '🚧' })}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm flex items-center gap-2 transition-colors"
                    >
                        <Plus size={18} />
                        Add Prize
                    </button>
                </Authorizable>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                </div>
            ) : prizes.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <Gift className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No prizes</h3>
                    <p className="mt-1 text-sm text-gray-500">There are no prizes configured for this event.</p>
                </div>
            ) : (
                <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prize Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Winner</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {prizes.map((prize) => (
                                    <tr key={prize.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{prize.name}</div>
                                            <div className="text-sm text-gray-500 max-w-xs truncate">{prize.description}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {prize.quantity}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {prize.teamId ? (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                    Team ID: {prize.teamId}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 italic text-xs">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <Authorizable 
                                                allowedRoles={[Role.ADMIN, Role.ORGANIZER]} 
                                                fallback={<span className="text-gray-400 text-xs italic">View Only</span>}
                                            >
                                                <div className="flex space-x-3">
                                                    <button
                                                        onClick={() => toast('Assign functionality coming soon!', { icon: '🚧' })}
                                                        className="text-blue-600 hover:text-blue-900 transition-colors"
                                                        title="Assign to Team"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                </div>
                                            </Authorizable>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PrizesPage;
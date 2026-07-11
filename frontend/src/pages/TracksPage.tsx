import React, { useEffect, useState } from 'react';
import { TrackService, Track } from '../services/TrackService';
import { Target, Loader2, Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Authorizable from '../components/Authorizable';
import { Role } from '../services/authUtils';

const TracksPage: React.FC = () => {
    const [tracks, setTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTracks();
    }, []);

    const fetchTracks = async () => {
        setLoading(true);
        try {
            // For now, fetching tracks for hackathon event 1.
            const allTracks = await TrackService.getTracksByHackathonEvent(1);
            setTracks(allTracks);
        } catch (err) {
            console.error('Failed to fetch tracks:', err);
            toast.error('Failed to fetch tracks.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Target className="text-red-500" />
                        Tracks
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Manage competition tracks and focus areas.</p>
                </div>
                
                <Authorizable allowedRoles={[Role.ADMIN, Role.ORGANIZER]}>
                    <button
                        onClick={() => toast('Create functionality coming soon!', { icon: '🚧' })}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm flex items-center gap-2 transition-colors"
                    >
                        <Plus size={18} />
                        Add Track
                    </button>
                </Authorizable>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                </div>
            ) : tracks.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <Target className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No tracks</h3>
                    <p className="mt-1 text-sm text-gray-500">There are no tracks defined for this event.</p>
                </div>
            ) : (
                <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Track Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {tracks.map((track) => (
                                    <tr key={track.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{track.name}</div>
                                            <div className="text-xs text-gray-400">ID: {track.id}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <div className="max-w-md truncate" title={track.description}>
                                                {track.description}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <Authorizable 
                                                allowedRoles={[Role.ADMIN, Role.ORGANIZER]} 
                                                fallback={<span className="text-gray-400 text-xs italic">View Only</span>}
                                            >
                                                <div className="flex space-x-3">
                                                    <button
                                                        onClick={() => toast('Edit functionality coming soon!', { icon: '🚧' })}
                                                        className="text-blue-600 hover:text-blue-900 transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => toast('Delete functionality coming soon!', { icon: '🚧' })}
                                                        className="text-red-600 hover:text-red-900 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={18} />
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

export default TracksPage;
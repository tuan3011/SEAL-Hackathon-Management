import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Users, AlertCircle } from 'lucide-react';

interface Track {
    id: number;
    name: string;
}

const CreateTeamPage: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();

    const [teamName, setTeamName] = useState('');
    const [trackId, setTrackId] = useState<number | ''>('');
    const [tracks, setTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTracks = async () => {
            if (!eventId) return;
            try {
                const response = await api.get(`/tracks/hackathon/${eventId}`);
                const data = response.data.data ?? response.data;
                setTracks(Array.isArray(data) ? data : []); 
            } catch (err) {
                setError('Failed to load tracks for this event.');
            }
        };
        fetchTracks();
    }, [eventId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!trackId) {
            setError('Please select a track.');
            return;
        }
        setError('');
        setLoading(true);

        try {
            await api.post('/teams', {
                name: teamName,
                eventId: Number(eventId),
                trackId: trackId,
            });
            toast.success('Team created successfully!');
            navigate('/my-team');
        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'Failed to create team.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors mb-2">
                <ArrowLeft size={16} />
                Back to Dashboard
            </Link>

            <div className="bg-white border border-outline-variant rounded-xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-primary-container/10 rounded-lg text-primary-container">
                        <Users size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-on-surface tracking-tight">Create a New Team</h1>
                        <p className="text-sm text-on-surface-variant mt-1">Form a team to compete in this hackathon track.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="teamName" className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
                            Team Name
                        </label>
                        <input
                            id="teamName"
                            type="text"
                            required
                            placeholder="Enter team name"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface placeholder-slate-400 focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all"
                        />
                    </div>

                    <div>
                        <label htmlFor="track" className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
                            Select Track
                        </label>
                        <div className="relative">
                            <select
                                id="track"
                                required
                                value={trackId}
                                onChange={(e) => setTrackId(Number(e.target.value))}
                                className="w-full px-3 py-2.5 bg-white border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all appearance-none"
                            >
                                <option value="" disabled>-- Select a track --</option>
                                {tracks.map(track => (
                                    <option key={track.id} value={track.id}>{track.name}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                                </svg>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-600">
                            <AlertCircle size={16} className="shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2.5 px-4 rounded-lg font-semibold text-sm text-white bg-primary-container hover:bg-[#d9611b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-container transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            {loading ? 'Creating Team...' : 'Create Team'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTeamPage;


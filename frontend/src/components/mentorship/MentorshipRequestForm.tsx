import React, { useState, useEffect } from 'react';
import { MentorshipRequestService } from '../../services/MentorshipRequestService';
import api from '../../services/api';
import { HackathonEventService } from '../../services/HackathonEventService';
import { Team } from '../../services/TeamService';
import toast from 'react-hot-toast';

interface MentorshipRequestFormProps {
    onSuccess: () => void;
    onCancel: () => void;
    myTeamsProp?: Team[];
}

const MentorshipRequestForm: React.FC<MentorshipRequestFormProps> = ({ onSuccess, onCancel, myTeamsProp }) => {
    const [myTeams, setMyTeams] = useState<any[]>([]);
    const [teamId, setTeamId] = useState<number | ''>('');
    const [topic, setTopic] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const initData = async () => {
            try {
                let teams = [];
                if (myTeamsProp && myTeamsProp.length > 0) {
                    teams = myTeamsProp;
                } else {
                    const events = await HackathonEventService.getHackathonEvents(0, 50);
                    if (Array.isArray(events)) {
                        for (const ev of events) {
                            try {
                                const res = await api.get(`/teams/my-team/event/${ev.id}`);
                                if (res.data?.data?.id) {
                                    teams.push({ ...res.data.data, eventName: ev.name });
                                }
                            } catch { /* ignore fallback */ }
                        }
                    }
                }
                
                // Only allow finalized teams
                const finalizedTeams = teams.filter((t: Team) => t.status === 'FINALIZED');
                setMyTeams(finalizedTeams);
                
                if (finalizedTeams.length > 0) {
                    setTeamId(finalizedTeams[0].id);
                }
            } catch (error) {
                console.error('Failed to init teams:', error);
                setErrorMsg('Failed to load your teams. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        initData();
    }, [myTeamsProp]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!teamId) {
            setErrorMsg('You must select a team to request mentorship.');
            return;
        }
        if (!topic.trim()) {
            setErrorMsg('Topic cannot be empty.');
            return;
        }

        setSubmitting(true);
        setErrorMsg('');

        try {
            await MentorshipRequestService.createRequest({
                teamId: teamId as number,
                title: topic.trim(),
                description: description.trim() || undefined
            });
            toast.success('Mentorship request submitted successfully!');
            // Clear form data is handled by unmounting or the parent component
            onSuccess();
        } catch (error: any) {
            setErrorMsg(error.response?.data?.error?.message || error.message || 'Failed to submit request.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="text-center py-4 text-sm text-gray-500">Loading your teams...</div>;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && <div className="text-red-500 text-sm font-semibold p-3 bg-red-50 border border-red-100 rounded-lg">{errorMsg}</div>}

            <div>
                <label className="block text-sm font-semibold text-gray-700">Select Team</label>
                {myTeams.length > 0 ? (
                    <select
                        value={teamId}
                        onChange={(e) => setTeamId(Number(e.target.value))}
                        disabled={submitting}
                        className="mt-2 block w-full rounded-md border-gray-300 py-2 px-3 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-gray-50"
                    >
                        {myTeams.map(t => (
                            <option key={t.id} value={t.id}>
                                {t.name || 'Unnamed Team'} ({t.eventName})
                            </option>
                        ))}
                    </select>
                ) : (
                    <div className="mt-2 text-sm text-red-500 font-semibold p-3 bg-red-50 border border-red-100 rounded-lg">
                        You do not have any finalized teams to request mentorship for.
                    </div>
                )}
            </div>
            
            <div>
                <label className="block text-sm font-semibold text-gray-700">Topic / Title</label>
                <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    disabled={submitting || myTeams.length === 0}
                    className="mt-2 block w-full rounded-md border-gray-300 py-2 px-3 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-gray-50 disabled:opacity-50"
                    placeholder="E.g., Need help with React Router"
                />
            </div>
            
            <div>
                <label className="block text-sm font-semibold text-gray-700">Description (Optional)</label>
                <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={submitting || myTeams.length === 0}
                    className="mt-2 block w-full rounded-md border-gray-300 py-2 px-3 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-gray-50 disabled:opacity-50 resize-none"
                    placeholder="Describe what you need help with in more detail..."
                />
            </div>
            
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={submitting}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                    Cancel
                </button>
                <button 
                    type="submit"
                    disabled={submitting || myTeams.length === 0}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[120px]"
                >
                    {submitting ? (
                        <span className="flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Submitting...
                        </span>
                    ) : 'Submit Request'}
                </button>
            </div>
        </form>
    );
};

export default MentorshipRequestForm;

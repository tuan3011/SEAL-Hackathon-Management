import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Calendar, Clock, Info, Trophy, ChevronLeft, CalendarRange, Tag, Target } from 'lucide-react';
import toast from 'react-hot-toast';
import StatusBadge from '../components/StatusBadge';
import Skeleton from '../components/Skeleton';
import LeaderboardSection from '../components/LeaderboardSection';

interface EventDetails {
    id: number;
    name: string;
    slug: string;
    description: string;
    startTime: string;
    endTime: string;
    registrationStart: string;
    registrationEnd: string;
    status: string;
    rules: string;
    imageUrl: string;
}

const EventDetailPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [event, setEvent] = useState<EventDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isRegistered, setIsRegistered] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [tracks, setTracks] = useState<any[]>([]);
    const [rounds, setRounds] = useState<any[]>([]);
    const [criteria, setCriteria] = useState<any[]>([]);
    const [prizes, setPrizes] = useState<any[]>([]);

    const getRoundStatusBadge = (r: any) => {
        const now = new Date();
        const start = new Date(r.startTime);
        const end = new Date(r.endTime);
        const gradingEnd = r.gradingEndTime ? new Date(r.gradingEndTime) : null;

        if (r.gradingEnded || (gradingEnd && now >= gradingEnd) || now > end) {
            if (r.gradingEnded || (gradingEnd && now >= gradingEnd)) {
                return <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 border border-gray-200 rounded text-[9px] font-bold">Ended</span>;
            }
            return <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[9px] font-bold">Grading</span>;
        }
        if (now < start) {
            return <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[9px] font-bold">Upcoming</span>;
        }
        return <span className="px-1.5 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded text-[9px] font-bold">In Progress</span>;
    };

    useEffect(() => {
        const fetchEvent = async () => {
            if (!slug) return;
            try {
                const response = await api.get(`/hackathon-events/${slug}`);
                const eventData = response.data.data;
                setEvent(eventData);
                checkRegistrationStatus(eventData.id);

                try {
                    const [tracksRes, roundsRes, criteriaRes, prizesRes] = await Promise.all([
                        api.get(`/tracks/hackathon/${eventData.id}`),
                        api.get(`/rounds/hackathon/${eventData.id}`),
                        api.get(`/criteria/event/${eventData.id}`),
                        api.get(`/prizes/event/${eventData.id}`)
                    ]);
                    setTracks(tracksRes.data.data || []);
                    setRounds(roundsRes.data.data || []);
                    setCriteria(criteriaRes.data.data || []);
                    setPrizes(prizesRes.data || []);
                } catch (fetchErr) {
                    console.error("Failed to fetch detailed event information:", fetchErr);
                }
            } catch (err) {
                setError('Failed to fetch event details.');
            } finally {
                setLoading(false);
            }
        };

        const fetchRounds = async (eventId: number) => {
            try {
                const response = await api.get(`/rounds/hackathon/${eventId}`);
                setRounds(response.data.data || []);
            } catch (err) {
                console.error("Failed to fetch rounds", err);
            }
        };

        const checkRegistrationStatus = async (eventId: number) => {
            try {
                const response = await api.get(`/event-registrations/my-registration/event/${eventId}`);
                setIsRegistered(response.data.data);
            } catch (err) {
                // Ignore error, maybe the user is not logged in
            }
        };

        fetchEvent();
    }, [slug]);

    const handleRegister = async () => {
        if (!event) return;
        setIsRegistering(true);
        try {
            await api.post('/event-registrations', null, { params: { eventId: event.id } });
            setIsRegistered(true);
            toast.success('Successfully registered for the event!');
        } catch (err: any) {
            const errorMessage = err.response?.data?.error?.message || err.response?.data?.message || 'Failed to register for the event.';
            toast.error(errorMessage);
        } finally {
            setIsRegistering(false);
        }
    };

    const getRegistrationStatus = () => {
        if (!event) return { label: 'Closed', color: 'bg-red-50 text-red-700 border-red-200', canRegister: false };
        const now = new Date();
        const start = new Date(event.registrationStart);
        const end = new Date(event.registrationEnd);

        if (event.status !== 'PUBLISHED') {
            return { label: 'Closed', color: 'bg-red-50 text-red-700 border-red-200', canRegister: false };
        }
        if (now < start) {
            return { label: 'Not Started', color: 'bg-amber-50 text-amber-700 border-amber-200', canRegister: false };
        }
        if (now > end) {
            return { label: 'Closed', color: 'bg-red-50 text-red-700 border-red-200', canRegister: false };
        }
        return { label: 'Open', color: 'bg-green-50 text-green-700 border-green-200', canRegister: true };
    };

    const regStatus = getRegistrationStatus();

    const getEventStatusBadge = () => {
        if (!event) return null;
        const now = new Date();
        const start = new Date(event.startTime);
        const end = new Date(event.endTime);

        if (event.status === 'COMPLETED' || now > end) {
            return <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 border border-gray-200 rounded text-[9px] font-bold">Ended</span>;
        }
        if (event.status === 'CANCELLED') {
            return <span className="px-1.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded text-[9px] font-bold">Cancelled</span>;
        }
        if (event.status === 'IN_PROGRESS' || (now >= start && now <= end)) {
            return <span className="px-1.5 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded text-[9px] font-bold">Ongoing</span>;
        }
        return <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[9px] font-bold">Upcoming</span>;
    };

    if (loading) {
        return (
            <div className="max-w-[1440px] mx-auto space-y-6">
                <Skeleton type="card" lines={4} className="h-96" />
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="max-w-xl mx-auto p-6 bg-red-50 border border-red-200 rounded-xl text-center text-sm text-red-600">
                {error || 'Event not found.'}
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-[1440px] mx-auto">
            <Link to="/events" className="inline-flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors mb-2">
                <ChevronLeft size={16} />
                Back to All Hackathons
            </Link>

            <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
                {/* Cover Image */}
                <div className="h-80 w-full relative bg-slate-100">
                    <img
                        className="w-full h-full object-cover"
                        src={event.imageUrl || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1200'}
                        alt={event.name}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-6 left-6 md:left-8 flex flex-col md:flex-row md:items-end justify-between right-6 gap-4">
                        <div className="space-y-2 text-white">
                            <StatusBadge status={event.status} />
                            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">{event.name}</h1>
                        </div>
                    </div>
                </div>

                <div className="p-6 md:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Event Details Description (Spans 2 cols) */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="space-y-4">
                                <h2 className="text-lg font-bold text-on-surface flex items-center gap-2 border-b border-slate-100 pb-2">
                                    <Info size={20} className="text-primary-container" />
                                    About the Hackathon
                                </h2>
                                <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-line">
                                    {event.description}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-lg font-bold text-on-surface flex items-center gap-2 border-b border-slate-100 pb-2">
                                    <Trophy size={20} className="text-primary-container" />
                                    Rules & Regulations
                                </h2>
                                <div
                                    className="text-sm text-on-surface-variant leading-relaxed prose max-w-none"
                                    dangerouslySetInnerHTML={{ __html: event.rules || '<p>No specific rules defined for this event.</p>' }}
                                />
                            </div>

                            {tracks.length > 0 && (
                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <h2 className="text-lg font-bold text-on-surface flex items-center gap-2 border-b border-slate-100 pb-2">
                                        <Tag size={20} className="text-primary-container" />
                                        Competition Tracks
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {tracks.map(t => (
                                            <div key={t.id} className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                                                <h3 className="font-bold text-blue-700 text-sm">{t.name}</h3>
                                                <p className="text-xs text-on-surface-variant mt-1.5">{t.description || 'No description provided.'}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {rounds.length > 0 && (
                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <h2 className="text-lg font-bold text-on-surface flex items-center gap-2 border-b border-slate-100 pb-2">
                                        <Clock size={20} className="text-primary-container" />
                                        Rounds & Timeline
                                    </h2>
                                    <div className="relative border-l border-blue-200 ml-3 pl-6 space-y-6">
                                        {rounds.map((r, index) => (
                                            <div key={r.id} className="relative">
                                                <div className="absolute -left-[31px] top-0.5 bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">
                                                    {index + 1}
                                                </div>
                                                <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                                                    {r.name}
                                                    {getRoundStatusBadge(r)}
                                                </h3>
                                                {tracks.length > 0 && (
                                                    <div className="flex flex-wrap items-center gap-1 mt-1">
                                                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Tracks:</span>
                                                        {tracks.map(t => (
                                                            <span key={t.id} className="inline-flex px-1.5 py-0.5 rounded text-[9px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                                {t.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                                <p className="text-xs text-gray-500 mt-1.5">
                                                    Submission Period: {new Date(r.startTime).toLocaleString()} - {new Date(r.endTime).toLocaleString()}
                                                </p>
                                                {r.gradingEndTime && (
                                                    <p className="text-[11px] text-gray-500 mt-0.5">
                                                        Grading Period: <span className="text-amber-700 font-medium">{new Date(r.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(r.gradingEndTime).toLocaleString()}</span>
                                                    </p>
                                                )}
                                                {index < rounds.length - 1 ? (
                                                    <p className="text-xs text-blue-700 font-semibold mt-1">
                                                        Advancement Slots: {r.advancementSlots ? `${r.advancementSlots} teams` : 'Unlimited'} (per Track)
                                                    </p>
                                                ) : (
                                                    <p className="text-xs text-green-700 font-bold mt-1">
                                                        Final Round
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {criteria.length > 0 && (
                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <h2 className="text-lg font-bold text-on-surface flex items-center gap-2 border-b border-slate-100 pb-2">
                                        <Target size={20} className="text-primary-container" />
                                        Evaluation Criteria
                                    </h2>
                                    <div className="space-y-3">
                                        {criteria.map(c => (
                                            <div key={c.id} className="flex justify-between items-center p-3 rounded-lg bg-slate-50 border border-slate-100">
                                                <div>
                                                    <h3 className="font-semibold text-sm text-gray-900">{c.name}</h3>
                                                    <p className="text-xs text-gray-500 mt-0.5">{c.description || 'No description.'}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
                                                        Weight: {c.weight}%
                                                    </span>
                                                    <p className="text-[10px] text-gray-400 mt-1">Max Score: {c.maxScore}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {prizes.length > 0 && (
                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <h2 className="text-lg font-bold text-on-surface flex items-center gap-2 border-b border-slate-100 pb-2">
                                        <Trophy size={20} className="text-primary-container" />
                                        Prizes
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {prizes.map(p => (
                                            <div key={p.id} className="p-4 rounded-xl border border-yellow-200 bg-amber-50/30 shadow-sm flex items-start gap-3">
                                                <Trophy className="text-yellow-600 shrink-0 mt-0.5" size={20} />
                                                <div>
                                                    <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2 flex-wrap">
                                                        {p.name}
                                                        {p.trackName && (
                                                            <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                                {p.trackName}
                                                            </span>
                                                        )}
                                                    </h3>
                                                    <p className="text-xs text-gray-500 mt-1.5">{p.description || 'Awarded to top performers.'}</p>
                                                    <div className="mt-2 p-2.5 rounded-lg bg-amber-50/50 border border-amber-200/50 space-y-1">
                                                        <span className="text-[9px] uppercase font-bold tracking-wider text-amber-800 block opacity-60">Rewards</span>
                                                        <div className="flex flex-col gap-1">
                                                            {p.cash !== undefined && p.cash !== null && (
                                                                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                                                                    <span>💵</span>
                                                                    <span>
                                                                        {p.currency === 'USD' ? '$' : ''}
                                                                        {p.cash.toLocaleString()}
                                                                        {p.currency === 'USD' ? ' USD' : ' VNĐ'}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {p.cup && (
                                                                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                                                                    <span>🏆</span>
                                                                    <span>{p.cup}</span>
                                                                </div>
                                                            )}
                                                            {p.certificate && (
                                                                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                                                                    <span>📜</span>
                                                                    <span>{p.certificate}</span>
                                                                </div>
                                                            )}
                                                            {!p.cash && !p.cup && !p.certificate && (
                                                                <span className="text-[10px] text-gray-500 italic">Special Prize</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Timeline & Actions sidebar */}
                        <div className="space-y-6">
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 space-y-5">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface flex items-center gap-2">
                                    <CalendarRange size={16} className="text-primary-container" />
                                    Event Timeline
                                </h3>

                                <div className="space-y-4 divide-y divide-slate-100">
                                    {/* Reg Dates */}
                                    <div className="pt-0 flex items-start gap-3">
                                        <Clock size={16} className="text-on-surface-variant shrink-0 mt-0.5" />
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs font-semibold text-on-surface">Registration Period</p>
                                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold border ${regStatus.color}`}>
                                                    {regStatus.label}
                                                </span>
                                            </div>
                                            <p className="text-xs text-on-surface-variant mt-0.5">
                                                {new Date(event.registrationStart).toLocaleString()} - {new Date(event.registrationEnd).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Event Dates */}
                                    <div className="pt-4 flex items-start gap-3">
                                        <Calendar size={16} className="text-on-surface-variant shrink-0 mt-0.5" />
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs font-semibold text-on-surface">Hackathon Dates</p>
                                                {getEventStatusBadge()}
                                            </div>
                                            <p className="text-xs text-on-surface-variant mt-0.5">
                                                {new Date(event.startTime).toLocaleString()} - {new Date(event.endTime).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {event.status === 'PUBLISHED' && (
                                    <div className="pt-2">
                                        <button
                                            className="w-full py-2.5 text-sm font-bold text-white bg-primary-container hover:bg-[#d9611b] rounded-lg shadow-sm transition-colors disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
                                            onClick={handleRegister}
                                            disabled={isRegistered || isRegistering || !regStatus.canRegister}
                                        >
                                            {isRegistered ? 'Successfully Registered' :
                                                isRegistering ? 'Registering...' :
                                                    !regStatus.canRegister ? (new Date() < new Date(event.registrationStart) ? 'Registration Not Started' : 'Registration Closed') :
                                                        'Register Now'}
                                        </button>
                                    </div>
                                )}

                                {rounds.length > 0 && rounds.some(r => r.gradingEnded) && (
                                    <div className="pt-4 border-t border-slate-100 mt-4">
                                        <h4 className="text-sm font-bold uppercase tracking-wider text-on-surface flex items-center gap-2 mb-3">
                                            <Trophy size={16} className="text-primary-container" />
                                            Leaderboards
                                        </h4>
                                        <p className="text-xs text-on-surface-variant">View the rankings for the completed rounds in the main section.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {rounds.length > 0 && rounds.some(r => r.gradingEnded) && (
                        <LeaderboardSection rounds={rounds} tracks={tracks} prizes={prizes} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventDetailPage;
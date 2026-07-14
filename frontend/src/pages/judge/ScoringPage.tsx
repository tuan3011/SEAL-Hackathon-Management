import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { CheckCircle2, ChevronLeft, Code, Link as LinkIcon, AlertCircle } from 'lucide-react';
import Skeleton from '../../components/Skeleton';

interface SubmissionDetails {
    id: number;
    teamId: number;
    teamName: string;
    roundId: number;
    roundName: string;
    repositoryUrl: string;
    demoUrl: string;
    reportUrl: string;
    eventSlug?: string;
}

interface Criterion {
    id: number;
    name: string;
    description: string;
    weight: number;
    maxScore: number;
}

interface ScoreInput {
    criterionId: number;
    scoreValue: number;
    comment: string;
}

const ScoringPage: React.FC = () => {
    const { submissionId } = useParams<{ submissionId: string }>();
    const navigate = useNavigate();

    const [submission, setSubmission] = useState<SubmissionDetails | null>(null);
    const [criteria, setCriteria] = useState<Criterion[]>([]);
    const [scores, setScores] = useState<ScoreInput[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [canScore, setCanScore] = useState(true);
    const [gradingMessage, setGradingMessage] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            if (!submissionId) return;
            try {
                const subRes = await api.get(`/submissions/${submissionId}`);
                const submissionData = subRes.data.data;
                setSubmission(submissionData);

                // Fetch criteria: assuming hackathon event ID 1 for now
                let critData = [];
                try {
                    const critRes = await api.get(`/criteria/event/1`);
                    critData = critRes.data.data ?? [];
                    
                    if (critData.length === 0) {
                        const defaultRes = await api.get(`/criteria/default`);
                        critData = defaultRes.data.data ?? [];
                    }
                } catch (critErr) {
                    console.error("Failed to load criteria", critErr);
                    // Fallback to an empty list or mock if default fails
                    critData = [];
                }
                
                setCriteria(critData);
                
                // Fetch round to check deadlines
                try {
                    const roundRes = await api.get(`/rounds/${submissionData.roundId}`);
                    const roundData = roundRes.data.data;
                    const now = new Date();
                    const roundEnd = roundData.endTime ? new Date(roundData.endTime) : null;
                    const gradEnd = roundData.gradingEndTime ? new Date(roundData.gradingEndTime) : null;
                    
                    if (roundEnd && now < roundEnd) {
                        setCanScore(false);
                        setGradingMessage(`Grading has not started. The round ends at ${roundEnd.toLocaleString()}.`);
                    } else if ((gradEnd && now > gradEnd) || roundData.gradingEnded) {
                        setCanScore(false);
                        setGradingMessage('The grading period has ended for this round.');
                    }
                } catch (e) {
                    console.error("Failed to fetch round data", e);
                }
                
                // Fetch existing scores
                let existingScores: any[] = [];
                try {
                    const existingRes = await api.get(`/scores/my-scores/submission/${submissionId}`);
                    existingScores = existingRes.data.data || [];
                } catch (e) {
                    console.error("Failed to load existing scores", e);
                }

                const initialScores = critData.map((c: Criterion) => {
                    const existing = existingScores.find((s: any) => s.criterionId === c.id);
                    return {
                        criterionId: c.id,
                        scoreValue: existing ? existing.scoreValue : 0,
                        comment: existing && existing.comment ? existing.comment : ''
                    };
                });
                setScores(initialScores);
                
            } catch (err) {
                setError('Failed to load submission data.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [submissionId]);

    const handleScoreChange = (criterionId: number, value: number) => {
        const maxScore = criteria.find(c => c.id === criterionId)?.maxScore || 10;
        const newScore = Math.max(0, Math.min(value, maxScore)); // Strict range validation
        setScores(prev => prev.map(s => s.criterionId === criterionId ? { ...s, scoreValue: newScore } : s));
    };

    const handleCommentChange = (criterionId: number, comment: string) => {
        setScores(prev => prev.map(s => s.criterionId === criterionId ? { ...s, comment } : s));
    };

    const handleSubmit = async (e: React.FormEvent, isFinalized: boolean) => {
        e.preventDefault();
        
        // Basic validation
        const missingScores = scores.some(s => s.scoreValue === undefined || s.scoreValue < 0);
        if (missingScores) {
            toast.error("Please provide a valid score for all criteria.");
            return;
        }

        setSubmitting(true);
        try {
            await api.post('/scores', {
                submissionId: Number(submissionId),
                scores: scores,
                isFinalized: isFinalized,
                finalized: isFinalized
            });
            toast.success(isFinalized ? 'Scores submitted successfully!' : 'Draft saved successfully!');
            navigate('/judge/dashboard');
        } catch (err: any) {
            toast.error(err.response?.data?.error?.message || 'Failed to submit scores.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="max-w-4xl mx-auto space-y-6 py-8">
            <Skeleton type="title" />
            <Skeleton type="card" lines={3} />
            <Skeleton type="card" lines={3} />
        </div>
    );
    
    if (error) return (
        <div className="max-w-4xl mx-auto mt-10 p-6 bg-red-50 border border-red-200 rounded-xl text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
            <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Scoring Sheet</h3>
            <p className="text-red-600 mb-6">{error}</p>
            <Link to="/judge/dashboard" className="inline-flex items-center text-red-700 font-medium hover:underline">
                <ChevronLeft size={16} className="mr-1" /> Back to Dashboard
            </Link>
        </div>
    );
    
    if (!submission) return <div className="text-center p-8">Submission not found.</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <Link to="/judge/dashboard" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-4 transition-colors">
                    <ChevronLeft size={16} className="mr-1" />
                    Back to Assignments
                </Link>
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-100 p-2.5 rounded-xl">
                        <CheckCircle2 size={24} className="text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Evaluate Project</h1>
                        <p className="text-gray-500 mt-1">Review the submission and provide constructive feedback.</p>
                    </div>
                </div>
            </div>

            {/* Submission Details Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Team & Round</h3>
                    <p className="text-xl font-bold text-gray-900">{submission.teamName || `Team #${submission.teamId}`}</p>
                    <p className="text-indigo-600 font-medium text-sm mt-0.5">{submission.roundName || `Round #${submission.roundId}`}</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                    {submission.repositoryUrl && (
                        <a 
                            href={submission.repositoryUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
                        >
                            <Code size={16} /> View Code
                        </a>
                    )}
                    {submission.demoUrl && (
                        <a 
                            href={submission.demoUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors border border-blue-100 shadow-sm"
                        >
                            <LinkIcon size={16} /> Live Demo
                        </a>
                    )}
                </div>
            </div>

            {criteria.length === 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
                    <p className="text-amber-800 font-medium">No evaluation criteria found for this event.</p>
                </div>
            ) : (
                <form onSubmit={(e) => e.preventDefault()}>
                    <div className="space-y-6 mb-8">
                        {criteria.map((c, index) => {
                            const currentScore = scores.find(s => s.criterionId === c.id)?.scoreValue ?? 0;
                            const percentage = (currentScore / c.maxScore) * 100;
                            
                            // Color code based on score
                            let scoreColor = 'text-gray-900';
                            let barColor = 'bg-gray-200';
                            if (currentScore > 0) {
                                if (percentage >= 80) { scoreColor = 'text-green-600'; barColor = 'bg-green-500'; }
                                else if (percentage >= 50) { scoreColor = 'text-yellow-600'; barColor = 'bg-yellow-500'; }
                                else { scoreColor = 'text-orange-600'; barColor = 'bg-orange-500'; }
                            }

                            return (
                                <div key={c.id} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs font-bold">
                                                    {index + 1}
                                                </span>
                                                <h3 className="text-lg font-bold text-gray-900">{c.name}</h3>
                                                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
                                                    Weight: {c.weight}%
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 leading-relaxed pl-9">{c.description}</p>
                                        </div>
                                        
                                        <div className="flex flex-col items-end shrink-0 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Score</label>
                                            <div className="flex items-baseline gap-2">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max={c.maxScore}
                                                    required
                                                    disabled={!canScore}
                                                    value={currentScore}
                                                    onChange={(e) => handleScoreChange(c.id, parseInt(e.target.value) || 0)}
                                                    className={`w-20 text-center text-2xl font-bold bg-transparent border-b-2 focus:outline-none focus:border-blue-500 transition-colors ${scoreColor} ${!canScore ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                />
                                                <span className="text-gray-400 font-medium text-lg">/ {c.maxScore}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Visual Range Slider */}
                                    <div className="mb-6 px-1">
                                        <input
                                            type="range"
                                            min="0"
                                            max={c.maxScore}
                                            value={currentScore}
                                            disabled={!canScore}
                                            onChange={(e) => handleScoreChange(c.id, parseInt(e.target.value) || 0)}
                                            className={`w-full h-2 bg-gray-200 rounded-lg appearance-none accent-blue-600 ${!canScore ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                                            style={{
                                                background: `linear-gradient(to right, ${percentage >= 80 ? '#22c55e' : percentage >= 50 ? '#eab308' : '#f97316'} ${percentage}%, #e5e7eb ${percentage}%)`
                                            }}
                                        />
                                        <div className="flex justify-between text-xs font-medium text-gray-400 mt-2">
                                            <span>0</span>
                                            <span>{c.maxScore / 2}</span>
                                            <span>{c.maxScore}</span>
                                        </div>
                                    </div>

                                    {/* Comment field */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-2 pl-1">Feedback / Comments (Optional)</label>
                                        <textarea
                                            placeholder={`What did the team do well regarding ${c.name}? Where can they improve?`}
                                            value={scores.find(s => s.criterionId === c.id)?.comment ?? ''}
                                            onChange={(e) => handleCommentChange(c.id, e.target.value)}
                                            disabled={!canScore}
                                            className={`w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none bg-gray-50 transition-colors ${!canScore ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white'}`}
                                            rows={2}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {!canScore && (
                        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-xl mb-6 font-medium text-center shadow-sm">
                            <AlertCircle size={20} className="inline mr-2 mb-1" />
                            {gradingMessage}
                        </div>
                    )}
                    
                    <div className="sticky bottom-6 z-10 bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-gray-200 flex justify-end gap-3">
                        <button 
                            type="button" 
                            disabled={submitting || !canScore} 
                            onClick={(e) => handleSubmit(e, false)}
                            className="flex items-center justify-center py-3 px-6 text-gray-700 bg-white border border-gray-300 rounded-xl font-bold shadow-sm hover:bg-gray-50 hover:shadow disabled:opacity-50 transition-all w-full md:w-auto"
                        >
                            {submitting ? 'Saving...' : 'Save Draft'}
                        </button>
                        <button 
                            type="button" 
                            disabled={submitting || !canScore}
                            onClick={(e) => handleSubmit(e, true)}
                            className="flex items-center justify-center py-3 px-8 text-white bg-blue-600 rounded-xl font-bold shadow-sm hover:bg-blue-700 hover:shadow disabled:opacity-50 transition-all w-full md:w-auto"
                        >
                            {submitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Saving Scores...
                                </>
                            ) : (
                                'Submit Final Evaluation'
                            )}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default ScoringPage;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Trophy, Rocket, ArrowRight, Brain, Gavel, 
    ChevronDown, Eye, Maximize, Calendar, 
    Mail, Phone, MapPin, ExternalLink,
    CheckCircle2, Clock, Award, ShieldAlert, BookOpen
} from 'lucide-react';
import { isAuthenticated } from '../services/authUtils';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { SupportTicketService } from '../services/SupportTicketService';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const loggedIn = isAuthenticated();

    const [isParticipantModalOpen, setIsParticipantModalOpen] = useState(false);
    const [isJudgeModalOpen, setIsJudgeModalOpen] = useState(false);
    const [isMentorModalOpen, setIsMentorModalOpen] = useState(false);

    // Support Ticket Form State
    const [supportName, setSupportName] = useState('');
    const [supportEmail, setSupportEmail] = useState('');
    const [supportMessage, setSupportMessage] = useState('');
    const [supportLoading, setSupportLoading] = useState(false);
    const [supportSuccess, setSupportSuccess] = useState(false);
    const [supportError, setSupportError] = useState('');

    const handleSupportSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSupportLoading(true);
        setSupportError('');
        setSupportSuccess(false);

        try {
            await SupportTicketService.createTicket({
                fullName: supportName,
                email: supportEmail,
                message: supportMessage
            });
            setSupportSuccess(true);
            setSupportName('');
            setSupportEmail('');
            setSupportMessage('');
            
            // Auto hide success message after 5 seconds
            setTimeout(() => setSupportSuccess(false), 5000);
        } catch (err: any) {
            setSupportError(err.response?.data?.error?.message || 'Failed to send message. Please try again.');
        } finally {
            setSupportLoading(false);
        }
    };

    // Mentor mock form state
    const [mentorForm, setMentorForm] = useState({ name: '', email: '', specialty: 'Web Development', availability: '2 hours/day' });
    const [mentorApplied, setMentorApplied] = useState(false);

    const handleMentorSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!mentorForm.name || !mentorForm.email) {
            toast.error('Please fill in name and email.');
            return;
        }
        setMentorApplied(true);
        toast.success('Application submitted successfully!');
    };

    const handleGetStarted = () => {
        if (loggedIn) {
            navigate('/dashboard');
        } else {
            navigate('/register');
        }
    };

    return (
        <div className="text-on-surface bg-background min-h-screen">
            {/* Hero Section */}
            <section className="max-w-[1440px] mx-auto px-margin-desktop py-12 pt-32">
                <div className="flex flex-col lg:flex-row items-center gap-12">
                    <div className="flex-1 text-center lg:text-left space-y-6">
                        <span className="inline-block px-4 py-1.5 bg-primary-container/10 text-primary-container rounded-full font-label-md text-label-md uppercase tracking-wider">
                            Academic Excellence 2024
                        </span>
                        <h1 className="font-display-lg text-display-lg text-on-surface leading-tight">
                            Unleash Your Innovation at <span className="text-primary-container">SEAL Hackathon</span>
                        </h1>
                        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl mx-auto lg:mx-0 leading-relaxed">
                            The premier academic technology competition for FPT University students. Build, compete, and lead the next generation of digital creators.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                            <button 
                                onClick={handleGetStarted}
                                className="bg-primary-container text-on-primary px-8 py-4 rounded-lg font-headline-sm text-headline-sm hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-soft shadow-lg shadow-primary/25 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                Register Team
                                <Rocket size={20} />
                            </button>
                            <button 
                                onClick={() => navigate('/events')}
                                className="border border-outline-variant bg-surface px-8 py-4 rounded-lg font-headline-sm text-headline-sm text-on-surface-variant hover:bg-surface-container hover:scale-[1.02] transition-soft flex items-center justify-center gap-2 cursor-pointer"
                            >
                                Browse Hackathons
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 w-full max-w-2xl relative group">
                        <div className="absolute -inset-4 bg-primary-container/5 rounded-3xl blur-2xl group-hover:bg-primary-container/10 transition-soft"></div>
                        <img 
                            alt="Hero Illustration" 
                            className="relative z-10 w-full h-auto drop-shadow-2xl rounded-2xl transform transition-soft group-hover:scale-[1.01]" 
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC9wFbBoWgx4Xu7C4sEaruvzbIpycqTHCSmgCsVY2fsW9M49CIc78HQEXNew-YEar0v7wwf7bLhg3lFGEfYGqpG7OJKLQ73pchaLzKrVexuyUyPW82YRLARyThjU19IJq9MuCmhRZ713ZjU5i-GsoRQ2vE-KR44Mp38kdm3ppFIKmyu7ZX8NWPDmmrBksmR2NQ5aQI1PEMhhhz3_1FKMFZS5yEOsIFhgnd4y5nmCPI-MmzCSJSa2lOZNbC975K90BKqwLOCcFHnEs-O"
                        />
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="bg-surface-container-low py-12 border-y border-outline-variant/30">
                <div className="max-w-[1440px] mx-auto px-margin-desktop">
                    <div className="text-center mb-12 space-y-2">
                        <h2 className="font-headline-lg text-headline-lg text-on-surface">Empowering Performance</h2>
                        <p className="font-body-md text-body-md text-on-surface-variant">Advanced tools and systems designed for competitive excellence.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Real-time Ranking */}
                        <div className="glass-card p-8 rounded-xl transition-soft hover:-translate-y-2 hover:border-primary-container hover:shadow-floating">
                            <div className="w-12 h-12 bg-primary-container/10 rounded-lg flex items-center justify-center mb-6">
                                <Trophy className="text-primary-container" size={24} />
                            </div>
                            <h3 className="font-headline-sm text-headline-sm mb-3 text-brand-navy">Real-time Ranking</h3>
                            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                                Live updates on scoreboards that keep the competitive fire alive every second of the event.
                            </p>
                        </div>
                        {/* Professional Mentorship */}
                        <div className="glass-card p-8 rounded-xl transition-soft hover:-translate-y-2 hover:border-primary-container hover:shadow-floating">
                            <div className="w-12 h-12 bg-tertiary-container/10 rounded-lg flex items-center justify-center mb-6">
                                <Brain className="text-tertiary" size={24} />
                            </div>
                            <h3 className="font-headline-sm text-headline-sm mb-3 text-brand-navy">Professional Mentorship</h3>
                            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                                Direct access to industry veterans from FPT and global tech giants for project guidance.
                            </p>
                        </div>
                        {/* Fair Judging System */}
                        <div className="glass-card p-8 rounded-xl transition-soft hover:-translate-y-2 hover:border-primary-container hover:shadow-floating">
                            <div className="w-12 h-12 bg-surface-container-highest rounded-lg flex items-center justify-center mb-6">
                                <Gavel className="text-on-surface-variant" size={24} />
                            </div>
                            <h3 className="font-headline-sm text-headline-sm mb-3 text-brand-navy">Fair Judging System</h3>
                            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                                Transparent criteria and a multi-stage review process ensuring every innovation gets its due.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Choose Your Path Section */}
            <section className="py-12 max-w-[1440px] mx-auto px-margin-desktop">
                <div className="mb-12 space-y-2 text-center lg:text-left">
                    <h2 className="font-headline-lg text-headline-lg text-on-surface">Choose Your Path</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant">Whether you are building, guiding, or judging, there is a place for you.</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Participants */}
                    <div className="relative overflow-hidden rounded-2xl group border border-outline-variant hover:border-primary-container transition-soft shadow-sm bg-white">
                        <img 
                            className="w-full h-64 object-cover transition-soft group-hover:scale-105" 
                            alt="Participants collaborating"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC9qYPqNHn7Ig-mKGQWJHWlO9rZTe42u2aJeD9owVt8hw0vNole6Hz6dcMmvglfIOvpVSaTbHdhc2XQthVzTUUAR77jyXQRV2URhDnEOhf59cHuNkzQNpcV-GP-5izaKJ_FAzGQiHTqbeEzajogVPgU7LI5cS-cnms4MTDgNAnPTDABMZ8UPgcbFzWloLKs0v_FpXcsswsGtAYB4NpUsljehjmICdZd9QLMaahFlAlnGxyNceQ6GvZhoNmp8uFE5BttwA6HnFlV8Zk7" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-6 w-full space-y-2">
                            <h4 className="font-headline-md text-headline-md text-brand-navy">Participants</h4>
                            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">Battle for the top spot, win scholarships, and build your dream portfolio.</p>
                            <button 
                                onClick={() => setIsParticipantModalOpen(true)}
                                className="inline-flex items-center text-primary-container font-label-lg text-label-lg group-hover:translate-x-1 transition-all gap-1 cursor-pointer"
                            >
                                View Roadmap <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                    {/* Judges */}
                    <div className="relative overflow-hidden rounded-2xl group border border-outline-variant hover:border-primary-container transition-soft shadow-sm bg-white">
                        <img 
                            className="w-full h-64 object-cover transition-soft group-hover:scale-105" 
                            alt="Judges evaluating"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCczrB77_J97Bwipbu6KdYGxjJsmNVne03dvpWTEStQxsH1hblpsDrFr87WBewHDxO5FCcIy7_2kvRUWee6ALuT3k-T1CvxZrL0EA9Jth585Hk4qPH3daxgx_t0wSQMWdlQsLBGM95qh6VzPua30CZc3Ea1N3QuYtd6H9mUETyNnTh450k1634W4fiRNophEFVe3GQgn3fGSJwFqI8z2FkjR-5sjbqXsrYzR3TkVqcv75cFD75utc_1Hp8pvKdgzZeVo2w8p1cFTSsa" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-6 w-full space-y-2">
                            <h4 className="font-headline-md text-headline-md text-brand-navy">Judges</h4>
                            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">Evaluate world-changing ideas and provide expert feedback to top talent.</p>
                            <button 
                                onClick={() => setIsJudgeModalOpen(true)}
                                className="inline-flex items-center text-primary-container font-label-lg text-label-lg group-hover:translate-x-1 transition-all gap-1 cursor-pointer"
                            >
                                Criteria <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                    {/* Mentors */}
                    <div className="relative overflow-hidden rounded-2xl group border border-outline-variant hover:border-primary-container transition-soft shadow-sm bg-white">
                        <img 
                            className="w-full h-64 object-cover transition-soft group-hover:scale-105" 
                            alt="Mentors guiding"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDT288b-ZovEUZ8rYuZiPHZPoQv5gWf9Dcbd1PoHzp-BPSO3NGZ-FGPoyU8jg4OxA77998JKheoPfjthWRqqwPhP8NgXYFg2mcSvqcRpatTkDye_cOZXU5oHXJlazASxBUdxz9ctMEX_EZOnO2oeDXFriQRNDYh6IwR2uDGvU7AuwRk6TfxR8OGqUIP70_BInkj_Qbho40NI9Tar290qlKK8_eDBnbQmZsvF6kFcAQOFoneFpC5aNlMfpGkJ_HB6jOna3afE4OnGuTU" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-6 w-full space-y-2">
                            <h4 className="font-headline-md text-headline-md text-brand-navy">Mentors</h4>
                            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">Guide students through technical hurdles and share industry wisdom.</p>
                            <button 
                                onClick={() => setIsMentorModalOpen(true)}
                                className="inline-flex items-center text-primary-container font-label-lg text-label-lg group-hover:translate-x-1 transition-all gap-1 cursor-pointer"
                            >
                                Join Panel <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Leaderboard Preview */}
            <section className="bg-surface-container-low py-12 border-y border-outline-variant/30">
                <div className="max-w-[1440px] mx-auto px-margin-desktop">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                        <div>
                            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Live Rankings</h2>
                            <p className="font-body-md text-body-md text-on-surface-variant">The current standings in the race to the finish line.</p>
                        </div>
                        <button 
                            onClick={() => navigate('/events')}
                            className="px-5 py-2.5 bg-white border border-outline-variant rounded-lg font-label-lg text-label-lg text-on-surface-variant hover:border-primary-container hover:text-primary transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                        >
                            Full Leaderboard <Maximize size={16} className="text-brand-orange" />
                        </button>
                    </div>
                    <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-floating">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-surface-container-low border-b border-outline-variant/30">
                                    <th className="text-left px-6 py-4 font-label-lg text-label-lg text-on-surface-variant">Rank</th>
                                    <th className="text-left px-6 py-4 font-label-lg text-label-lg text-on-surface-variant">Team Name</th>
                                    <th className="text-left px-6 py-4 font-label-lg text-label-lg text-on-surface-variant">Score</th>
                                    <th className="text-left px-6 py-4 font-label-lg text-label-lg text-on-surface-variant">Status</th>
                                    <th className="text-right px-6 py-4 font-label-lg text-label-lg text-on-surface-variant">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/20">
                                <tr className="hover:bg-neutral-base transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="w-8 h-8 rounded-full bg-[#FFD700]/20 flex items-center justify-center font-bold text-[#b8860b]">1</div>
                                    </td>
                                    <td className="px-6 py-5 font-headline-sm text-headline-sm text-brand-navy">Code Ninjas</td>
                                    <td className="px-6 py-5 font-body-md text-body-md font-bold text-primary-container">12,450 pts</td>
                                    <td className="px-6 py-5">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[12px] font-bold">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></span> ACTIVE
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button className="text-on-surface-variant hover:text-primary-container p-1 rounded hover:bg-neutral-divider transition-colors">
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                                <tr className="hover:bg-neutral-base transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="w-8 h-8 rounded-full bg-[#C0C0C0]/20 flex items-center justify-center font-bold text-secondary">2</div>
                                    </td>
                                    <td className="px-6 py-5 font-headline-sm text-headline-sm text-brand-navy">AI Mavericks</td>
                                    <td className="px-6 py-5 font-body-md text-body-md font-bold text-primary-container">11,820 pts</td>
                                    <td className="px-6 py-5">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[12px] font-bold">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span> ACTIVE
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button className="text-on-surface-variant hover:text-primary-container p-1 rounded hover:bg-neutral-divider transition-colors">
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                                <tr className="hover:bg-neutral-base transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="w-8 h-8 rounded-full bg-[#CD7F32]/20 flex items-center justify-center font-bold text-[#8b4513]">3</div>
                                    </td>
                                    <td className="px-6 py-5 font-headline-sm text-headline-sm text-brand-navy">Cyber Guardians</td>
                                    <td className="px-6 py-5 font-body-md text-body-md font-bold text-primary-container">11,400 pts</td>
                                    <td className="px-6 py-5">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[12px] font-bold">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span> ACTIVE
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button className="text-on-surface-variant hover:text-primary-container p-1 rounded hover:bg-neutral-divider transition-colors">
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* FAQ & Support Contact */}
            <section className="py-12 max-w-[1440px] mx-auto px-margin-desktop">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Frequently Asked Questions</h2>
                        <div className="space-y-4">
                            <details className="group bg-white border border-outline-variant rounded-xl p-5 cursor-pointer transition-all shadow-sm">
                                <summary className="list-none flex justify-between items-center font-headline-sm text-headline-sm text-brand-navy">
                                    Who can participate in SEAL Hackathon?
                                    <ChevronDown size={20} className="group-open:rotate-180 transition-transform text-brand-orange" />
                                </summary>
                                <p className="font-body-sm text-body-sm text-on-surface-variant mt-4 leading-relaxed">
                                    All currently enrolled students at FPT University across all campuses are eligible to register as individuals or teams of 3-5 members.
                                </p>
                            </details>
                            <details className="group bg-white border border-outline-variant rounded-xl p-5 cursor-pointer transition-all shadow-sm">
                                <summary className="list-none flex justify-between items-center font-headline-sm text-headline-sm text-brand-navy">
                                    What technologies can we use?
                                    <ChevronDown size={20} className="group-open:rotate-180 transition-transform text-brand-orange" />
                                </summary>
                                <p className="font-body-sm text-body-sm text-on-surface-variant mt-4 leading-relaxed">
                                    Participants are encouraged to use any open-source or licensed tools. We have special tracks for AI, Blockchain, and IoT using FPT's internal platform APIs.
                                </p>
                            </details>
                            <details className="group bg-white border border-outline-variant rounded-xl p-5 cursor-pointer transition-all shadow-sm">
                                <summary className="list-none flex justify-between items-center font-headline-sm text-headline-sm text-brand-navy">
                                    How are the winners selected?
                                    <ChevronDown size={20} className="group-open:rotate-180 transition-transform text-brand-orange" />
                                </summary>
                                <p className="font-body-sm text-body-sm text-on-surface-variant mt-4 leading-relaxed">
                                    Judging is based on Impact (40%), Technical Execution (30%), Innovation (20%), and Presentation (10%).
                                </p>
                            </details>
                        </div>
                    </div>
                    <div className="bg-primary-container/5 rounded-2xl p-8 md:p-12 border border-primary-container/20 shadow-sm flex flex-col justify-between">
                        <div>
                            <h3 className="font-headline-lg text-headline-lg text-brand-navy mb-2">Need Help?</h3>
                            <p className="font-body-md text-body-md text-on-surface-variant mb-8 leading-relaxed">
                                Our support team is available 24/7 during the event to assist with registration, technical issues, or general inquiries.
                            </p>
                        </div>
                        <form className="space-y-4" onSubmit={handleSupportSubmit}>
                            {supportSuccess && (
                                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-medium flex items-center gap-2">
                                    <span>✅</span> Thank you! Your message has been sent. We will get back to you soon.
                                </div>
                            )}
                            {supportError && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium">
                                    {supportError}
                                </div>
                            )}
                            <div>
                                <label className="block font-label-lg text-label-lg text-brand-navy mb-1.5">Full Name</label>
                                <input 
                                    className="w-full bg-white border border-outline-variant rounded-lg p-3 focus:ring-4 focus:ring-primary-container/10 focus:border-primary-container outline-none transition-all text-body-sm" 
                                    placeholder="Enter your name" 
                                    type="text" 
                                    required
                                    value={supportName}
                                    onChange={(e) => setSupportName(e.target.value)}
                                    disabled={supportLoading}
                                />
                            </div>
                            <div>
                                <label className="block font-label-lg text-label-lg text-brand-navy mb-1.5">Email Address</label>
                                <input 
                                    className="w-full bg-white border border-outline-variant rounded-lg p-3 focus:ring-4 focus:ring-primary-container/10 focus:border-primary-container outline-none transition-all text-body-sm" 
                                    placeholder="student@fpt.edu.vn" 
                                    type="email" 
                                    required
                                    value={supportEmail}
                                    onChange={(e) => setSupportEmail(e.target.value)}
                                    disabled={supportLoading}
                                />
                            </div>
                            <div>
                                <label className="block font-label-lg text-label-lg text-brand-navy mb-1.5">Message</label>
                                <textarea 
                                    className="w-full bg-white border border-outline-variant rounded-lg p-3 focus:ring-4 focus:ring-primary-container/10 focus:border-primary-container outline-none transition-all text-body-sm" 
                                    placeholder="How can we help you?" 
                                    rows={4}
                                    required
                                    value={supportMessage}
                                    onChange={(e) => setSupportMessage(e.target.value)}
                                    disabled={supportLoading}
                                ></textarea>
                            </div>
                            <button 
                                type="submit" 
                                disabled={supportLoading}
                                className={`w-full bg-primary-container text-on-primary py-3.5 rounded-lg font-headline-sm text-headline-sm hover:opacity-90 transition-all shadow-md shadow-primary/20 font-semibold flex items-center justify-center gap-2 ${supportLoading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                                {supportLoading ? 'Sending...' : (
                                    <>
                                        Send Message <span className="text-xl leading-none">✈️</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="w-full py-12 px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-6 bg-surface-container-lowest border-t border-outline-variant mt-12">
                <div className="flex flex-col items-center md:items-start gap-1">
                    <span className="font-headline-sm text-headline-sm font-bold text-brand-navy">SEAL Hackathon</span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">© 2024 SEAL Hackathon Management System. FPT University.</p>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center">
                    <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-brand-orange transition-colors" href="#">Privacy Policy</a>
                    <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-brand-orange transition-colors" href="#">Terms of Service</a>
                    <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-brand-orange transition-colors" href="#">Contact Support</a>
                    <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-brand-orange transition-colors" href="#">University Site</a>
                </div>
            </footer>

            {/* 1. Participant Journey Modal */}
            {isParticipantModalOpen && (
                <Modal isOpen={isParticipantModalOpen} onClose={() => setIsParticipantModalOpen(false)}>
                    <div className="p-6 max-w-2xl space-y-6 max-h-[85vh] overflow-y-auto">
                        <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
                            <Rocket size={24} className="text-blue-600" />
                            <h3 className="text-xl font-bold text-gray-900">Your Hackathon Journey</h3>
                        </div>

                        {/* Roadmap Section */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-blue-700 uppercase tracking-wider">Competition Roadmap</h4>
                            <div className="relative border-l border-blue-200 ml-3.5 pl-6 space-y-4">
                                <div className="relative">
                                    <span className="absolute -left-[31px] top-0.5 bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">1</span>
                                    <h5 className="font-semibold text-sm text-gray-800">Register & Join</h5>
                                    <p className="text-xs text-gray-500 mt-0.5">Create your account, explore the active event details, and click register.</p>
                                </div>
                                <div className="relative">
                                    <span className="absolute -left-[31px] top-0.5 bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">2</span>
                                    <h5 className="font-semibold text-sm text-gray-800">Form a Team</h5>
                                    <p className="text-xs text-gray-500 mt-0.5">Build a team with your friends or join existing open teams. Team sizes must comply with minimum rules.</p>
                                </div>
                                <div className="relative">
                                    <span className="absolute -left-[31px] top-0.5 bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">3</span>
                                    <h5 className="font-semibold text-sm text-gray-800">Coding & Submission</h5>
                                    <p className="text-xs text-gray-500 mt-0.5">Collaborate to build your product, then submit your work before each round's deadline.</p>
                                </div>
                                <div className="relative">
                                    <span className="absolute -left-[31px] top-0.5 bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">4</span>
                                    <h5 className="font-semibold text-sm text-gray-800">Pitch & Win</h5>
                                    <p className="text-xs text-gray-500 mt-0.5">Present your solution to our elite panel of judges, receive feedback, and secure top prizes.</p>
                                </div>
                            </div>
                        </div>

                        {/* Rules & Guidelines */}
                        <div className="space-y-2.5 bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                                <BookOpen size={16} className="text-blue-600" />
                                Rules & Guidelines
                            </h4>
                            <ul className="list-disc pl-5 text-xs text-gray-600 space-y-1">
                                <li>All source code must be written during the hacking period. Pre-existing templates are permitted.</li>
                                <li>Plagiarism, copy-pasting, or using unlicensed materials is strictly prohibited and leads to disqualification.</li>
                                <li>Team members must satisfy the minimum size defined by the event organizer.</li>
                            </ul>
                        </div>

                        {/* Prizes Section */}
                        <div className="space-y-2.5">
                            <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                                <Trophy size={16} className="text-yellow-600" />
                                Prize Pool & Privileges
                            </h4>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="border border-yellow-100 bg-yellow-50/50 p-3 rounded-lg text-center">
                                    <span className="block font-bold text-lg text-yellow-700">1st Place</span>
                                    <span className="text-[10px] text-gray-500">Scholarship & swags</span>
                                </div>
                                <div className="border border-gray-100 bg-gray-50/50 p-3 rounded-lg text-center">
                                    <span className="block font-bold text-lg text-gray-600">2nd Place</span>
                                    <span className="text-[10px] text-gray-500">Mentorship access</span>
                                </div>
                                <div className="border border-amber-100 bg-amber-50/50 p-3 rounded-lg text-center">
                                    <span className="block font-bold text-lg text-amber-700">3rd Place</span>
                                    <span className="text-[10px] text-gray-500">Dream portfolio</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                onClick={() => { setIsParticipantModalOpen(false); navigate(loggedIn ? '/dashboard' : '/register'); }}
                                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-colors text-center cursor-pointer"
                            >
                                {loggedIn ? "Go to Dashboard" : "Register Now"}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* 2. Judge Criteria Modal */}
            {isJudgeModalOpen && (
                <Modal isOpen={isJudgeModalOpen} onClose={() => setIsJudgeModalOpen(false)}>
                    <div className="p-6 max-w-2xl space-y-6 max-h-[85vh] overflow-y-auto">
                        <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
                            <Gavel size={24} className="text-blue-600" />
                            <h3 className="text-xl font-bold text-gray-900">Judging Rules & Evaluation Rubric</h3>
                        </div>

                        {/* Rubrics Grid */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-blue-700 uppercase tracking-wider">Evaluation Rubric</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 border border-gray-100 rounded-xl space-y-1.5">
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-sm text-gray-800">Innovation</span>
                                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full">25%</span>
                                    </div>
                                    <p className="text-xs text-gray-500 leading-relaxed">Originality of the concept, creative problem-solving, and novelty of the proposed solution.</p>
                                </div>
                                <div className="p-4 border border-gray-100 rounded-xl space-y-1.5">
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-sm text-gray-800">Technical Complexity</span>
                                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full">25%</span>
                                    </div>
                                    <p className="text-xs text-gray-500 leading-relaxed">Technical implementation depth, completeness of working demo, code architecture, and database layout.</p>
                                </div>
                                <div className="p-4 border border-gray-100 rounded-xl space-y-1.5">
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-sm text-gray-800">UX/UI & Design</span>
                                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full">20%</span>
                                    </div>
                                    <p className="text-xs text-gray-500 leading-relaxed">Aesthetic appeal of the interface, ease of navigation, user experience consistency, and responsiveness.</p>
                                </div>
                                <div className="p-4 border border-gray-100 rounded-xl space-y-1.5">
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-sm text-gray-800">Business Value</span>
                                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full">30%</span>
                                    </div>
                                    <p className="text-xs text-gray-500 leading-relaxed">Practicability of the project, commercial potential, presentation quality, and response to questions.</p>
                                </div>
                            </div>
                        </div>

                        {/* Grading and Advancement */}
                        <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                                <Award size={16} className="text-blue-600" />
                                Grading & Advancement Process
                            </h4>
                            <ul className="list-disc pl-5 text-xs text-gray-600 space-y-1">
                                <li>Judges grade each assigned team on a 1-10 scale for each criterion.</li>
                                <li>The system computes the weighted average based on the predefined criteria weights.</li>
                                <li>The top N teams of each Track Category automatically advance to the next round.</li>
                            </ul>
                        </div>

                        <div className="pt-2">
                            <button
                                onClick={() => { setIsJudgeModalOpen(false); navigate('/login'); }}
                                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-colors text-center cursor-pointer"
                            >
                                Login to Judge Portal
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* 3. Mentor Panel Modal */}
            {isMentorModalOpen && (
                <Modal isOpen={isMentorModalOpen} onClose={() => { setIsMentorModalOpen(false); setMentorApplied(false); }}>
                    <div className="p-6 max-w-2xl space-y-6 max-h-[85vh] overflow-y-auto">
                        <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
                            <Brain size={24} className="text-blue-600" />
                            <h3 className="text-xl font-bold text-gray-900">Mentor Panel & Guidelines</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Responsibilities */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-blue-700 uppercase tracking-wider">Responsibilities</h4>
                                <ul className="list-disc pl-5 text-xs text-gray-600 space-y-1.5 leading-relaxed">
                                    <li>Provide technical guidance and answer questions for student teams.</li>
                                    <li>Mentor teams in your assigned Track Category (e.g. Web Dev, AI).</li>
                                    <li>Assist during pitching preparation to polish their slides and demos.</li>
                                    <li><strong>Special Rule:</strong> A teacher can act as a mentor for one track and a judge for another!</li>
                                </ul>

                                <h4 className="text-sm font-semibold text-blue-700 uppercase tracking-wider pt-2">Benefits</h4>
                                <ul className="list-disc pl-5 text-xs text-gray-600 space-y-1.5 leading-relaxed">
                                    <li>Certificate of Appreciation from the University.</li>
                                    <li>Networking with industry giants and sponsors.</li>
                                    <li>Help shape the next generation of top talent.</li>
                                </ul>
                            </div>

                            {/* Application Form */}
                            <div className="p-5 border border-gray-100 bg-gray-50/50 rounded-xl space-y-4">
                                <h4 className="text-sm font-semibold text-gray-800">Apply as a Mentor</h4>
                                {mentorApplied ? (
                                    <div className="text-center py-8 space-y-2">
                                        <CheckCircle2 size={40} className="text-green-500 mx-auto" />
                                        <h5 className="font-semibold text-sm text-green-700">Thank you!</h5>
                                        <p className="text-xs text-gray-500">Your application has been submitted successfully. We will review it shortly.</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleMentorSubmit} className="space-y-3.5">
                                        <div>
                                            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Full Name</label>
                                            <input
                                                type="text" required
                                                value={mentorForm.name}
                                                onChange={e => setMentorForm({ ...mentorForm, name: e.target.value })}
                                                placeholder="e.g. John Doe"
                                                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Email Address</label>
                                            <input
                                                type="email" required
                                                value={mentorForm.email}
                                                onChange={e => setMentorForm({ ...mentorForm, email: e.target.value })}
                                                placeholder="e.g. johndoe@company.com"
                                                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Specialty</label>
                                            <select
                                                value={mentorForm.specialty}
                                                onChange={e => setMentorForm({ ...mentorForm, specialty: e.target.value })}
                                                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                            >
                                                <option value="Web Development">Web Development</option>
                                                <option value="Mobile Development">Mobile Development</option>
                                                <option value="Artificial Intelligence">Artificial Intelligence</option>
                                                <option value="Blockchain & Web3">Blockchain & Web3</option>
                                                <option value="Design & UX/UI">Design & UX/UI</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Availability</label>
                                            <select
                                                value={mentorForm.availability}
                                                onChange={e => setMentorForm({ ...mentorForm, availability: e.target.value })}
                                                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                            >
                                                <option value="1 hour/day">1 hour/day</option>
                                                <option value="2 hours/day">2 hours/day</option>
                                                <option value="Flexible / Weekends">Flexible / Weekends</option>
                                            </select>
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs transition-colors cursor-pointer shadow-sm"
                                        >
                                            Submit Application
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default LandingPage;

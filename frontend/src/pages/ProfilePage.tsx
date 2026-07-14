import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { User, Link, BookOpen, School, Hash, Loader2, Save, Phone } from 'lucide-react';
import Skeleton from '../components/Skeleton';

interface ProfileData {
    username: string;
    email: string;
    fullName: string;
    phone: string;
    fptStudentId: string;
    schoolName: string;
    githubUrl: string;
    skills: string;
    role: string;
}

interface FormState {
    fullName: string;
    phone: string;
    fptStudentId: string;
    schoolName: string;
    githubUrl: string;
    skills: string;
}

const ProfilePage: React.FC = () => {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [form, setForm] = useState<FormState>({
        fullName: '',
        phone: '',
        fptStudentId: '',
        schoolName: '',
        githubUrl: '',
        skills: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/profile/me');
                const data: ProfileData = response.data.data;
                setProfile(data);
                setForm({
                    fullName: data.fullName ?? '',
                    phone: data.phone ?? '',
                    fptStudentId: data.fptStudentId ?? '',
                    schoolName: data.schoolName ?? '',
                    githubUrl: data.githubUrl ?? '',
                    skills: data.skills ?? '',
                });
            } catch {
                toast.error('Failed to load profile data.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                fullName: form.fullName.trim() || undefined,
                phone: form.phone.trim() || undefined,
                fptStudentId: form.fptStudentId.trim() || undefined,
                schoolName: form.schoolName.trim() || undefined,
                githubUrl: form.githubUrl.trim() || undefined,
                skills: form.skills.trim() || undefined
            };
            const response = await api.put('/profile/me', payload);
            setProfile(prev => prev ? { ...prev, ...response.data.data } : prev);
            toast.success('Profile updated successfully!');
        } catch {
            toast.error('Failed to update profile.');
        } finally {
            setForm(f => ({
                ...f,
                fullName: form.fullName,
                phone: form.phone,
                fptStudentId: form.fptStudentId,
                schoolName: form.schoolName,
                githubUrl: form.githubUrl,
                skills: form.skills
            }));
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="max-w-3xl mx-auto space-y-6">
            <Skeleton type="card" lines={3} className="h-64" />
        </div>
    );

    const roleColors: Record<string, string> = {
        ADMIN: 'bg-red-50 text-red-700 border-red-200',
        ORGANIZER: 'bg-purple-50 text-purple-700 border-purple-200',
        JUDGE: 'bg-amber-50 text-amber-700 border-amber-200',
        MENTOR: 'bg-teal-50 text-teal-700 border-teal-200',
        PARTICIPANT: 'bg-blue-50 text-blue-700 border-blue-200',
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Profile header card */}
            <div className="bg-white border border-outline-variant rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-container to-primary flex items-center justify-center text-white font-bold text-2xl shrink-0">
                        {profile?.username?.[0]?.toUpperCase() ?? 'U'}
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-on-surface">{profile?.username}</h1>
                        <p className="text-sm text-on-surface-variant">{profile?.email}</p>
                        {profile?.role && (
                            <span className={`mt-2 inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full border ${roleColors[profile.role] ?? 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                                {profile.role}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit form */}
            <div className="bg-white border border-outline-variant rounded-xl p-6 md:p-8 shadow-sm">
                <h2 className="text-lg font-bold text-on-surface border-b border-slate-100 pb-3 mb-5">Edit Profile Information</h2>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Full Name */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
                                <span className="flex items-center gap-1.5"><User size={14} /> Full Name</span>
                            </label>
                            <input
                                type="text"
                                value={form.fullName}
                                onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                                placeholder="Your full name"
                                className="w-full px-3 py-2 bg-white border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all placeholder-slate-400"
                            />
                        </div>

                        {/* Phone Number */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
                                <span className="flex items-center gap-1.5"><Phone size={14} /> Phone Number</span>
                            </label>
                            <input
                                type="text"
                                value={form.phone}
                                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                placeholder="e.g. 0987654321"
                                className="w-full px-3 py-2 bg-white border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all placeholder-slate-400"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* FPT Student ID */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
                                <span className="flex items-center gap-1.5"><Hash size={14} /> FPT Student ID</span>
                            </label>
                            <input
                                type="text"
                                value={form.fptStudentId}
                                onChange={e => setForm(f => ({ ...f, fptStudentId: e.target.value }))}
                                placeholder="e.g. SE170001"
                                className="w-full px-3 py-2 bg-white border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all placeholder-slate-400"
                            />
                        </div>

                        {/* School Name */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
                                <span className="flex items-center gap-1.5"><School size={14} /> School / University</span>
                            </label>
                            <input
                                type="text"
                                value={form.schoolName}
                                onChange={e => setForm(f => ({ ...f, schoolName: e.target.value }))}
                                placeholder="e.g. FPT University"
                                className="w-full px-3 py-2 bg-white border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all placeholder-slate-400"
                            />
                        </div>
                    </div>

                    {/* GitHub URL */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
                            <span className="flex items-center gap-1.5"><Link size={14} /> GitHub URL</span>
                        </label>
                        <input
                            type="url"
                            value={form.githubUrl}
                            onChange={e => setForm(f => ({ ...f, githubUrl: e.target.value }))}
                            placeholder="https://github.com/yourusername"
                            className="w-full px-3 py-2 bg-white border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all placeholder-slate-400"
                        />
                        {form.githubUrl && (
                            <a
                                href={form.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary-container font-semibold hover:underline mt-1.5 inline-block"
                            >
                                View GitHub Profile ↗
                            </a>
                        )}
                    </div>

                    {/* Skills */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
                            <span className="flex items-center gap-1.5"><BookOpen size={14} /> Skills</span>
                        </label>
                        <textarea
                            rows={3}
                            value={form.skills}
                            onChange={e => setForm(f => ({ ...f, skills: e.target.value }))}
                            placeholder="e.g. React, Spring Boot, Machine Learning, UI/UX Design"
                            className="w-full px-3 py-2 bg-white border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all placeholder-slate-400 resize-none"
                        />
                        <p className="text-xs text-on-surface-variant mt-1.5">Separate skills with commas. This helps teams find the right collaborators.</p>
                    </div>

                    {/* Skills Preview */}
                    {form.skills && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                            {form.skills.split(',').map(s => s.trim()).filter(Boolean).map(skill => (
                                <span key={skill} className="text-xs px-2.5 py-1 bg-primary-container/5 text-primary rounded-full border border-primary-container/20">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="flex justify-end pt-4 border-t border-slate-100">
                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-container hover:bg-[#d9611b] text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                        >
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;

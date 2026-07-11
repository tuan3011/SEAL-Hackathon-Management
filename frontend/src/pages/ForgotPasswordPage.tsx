import React, { useState } from 'react';
import { ArrowRight, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import api from '../services/api';

const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleForgot = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { email });
            toast.success('Recovery email sent! Please check your inbox.');
            navigate('/reset-password');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to send recovery email.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-on-surface">Email Recovery</h2>
                <p className="mt-2 text-sm text-on-surface-variant">
                    Enter your email to recover your account
                </p>
            </div>

            <form onSubmit={handleForgot} className="space-y-6">
                <Input 
                    label="Email Address"
                    id="email"
                    name="email"
                    placeholder="john@example.com"
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    leftIcon={<Mail size={18} />}
                />

                <Button 
                    type="submit"
                    className="w-full"
                    rightIcon={<ArrowRight size={18} />}
                    disabled={loading}
                >
                    {loading ? 'Sending...' : 'Send Recovery Email'}
                </Button>
            </form>

            <p className="text-sm text-center text-on-surface-variant mt-6">
                Remember your password?{' '}
                <a href="/login" className="font-semibold text-primary hover:underline cursor-pointer">
                    Log in
                </a>
            </p>
        </AuthLayout>
    );
};

export default ForgotPasswordPage;

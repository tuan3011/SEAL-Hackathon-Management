import React, { useState } from 'react';
import { ArrowRight, Mail, Key, Lock } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const ResetPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/reset-password', {
                email: email.trim(),
                otpCode: otp.trim(),
                newPassword,
            });
            toast.success('Password reset successfully! Please log in.');
            navigate('/login');
        } catch (err: any) {
            toast.error(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-on-surface">Reset Password</h2>
                <p className="mt-2 text-sm text-on-surface-variant">
                    Enter your email, the OTP sent to you, and your new password
                </p>
            </div>

            <form onSubmit={handleReset} className="space-y-6">
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
                
                <Input 
                    label="OTP Code"
                    id="otp"
                    name="otp"
                    placeholder="123456"
                    required
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    leftIcon={<Key size={18} />}
                />

                <Input 
                    label="New Password"
                    id="newPassword"
                    name="newPassword"
                    placeholder="••••••••"
                    required
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    leftIcon={<Lock size={18} />}
                />

                <Button 
                    type="submit"
                    className="w-full"
                    rightIcon={<ArrowRight size={18} />}
                    disabled={loading}
                >
                    {loading ? 'Resetting...' : 'Reset Password'}
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

export default ResetPasswordPage;

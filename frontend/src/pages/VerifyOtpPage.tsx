import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Code, ArrowRight, CheckCircle2, Key } from 'lucide-react';
import api from '../services/api';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const VerifyOtpPage: React.FC = () => {
    const [otp, setOtp] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const emailFromUrl = searchParams.get('email');
        if (emailFromUrl) {
            setEmail(emailFromUrl);
        } else {
            setError('Email not found. Please go back to the registration page.');
        }
    }, [location]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            // Fix: send 'otp' instead of 'otpCode' to match the backend VerifyOtpRequest DTO
            await api.post('/auth/verify-otp', { email, otp });
            setSuccess('Account verified successfully! Your account is currently pending administrator approval. You will receive an email notification once approved, after which you may log in.');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'Invalid or expired OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-on-surface">Verify Your Account</h2>
                <p className="mt-2 text-sm text-on-surface-variant">
                    An OTP has been sent to <strong className="text-primary">{email}</strong>. Please enter it below.
                </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
                {/* OTP Field */}
                <Input 
                    label="One-Time Password (OTP)"
                    id="otp"
                    name="otp"
                    placeholder="000000"
                    required
                    maxLength={6}
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    leftIcon={<Key size={18} />}
                    className="text-center tracking-widest font-bold text-2xl"
                />

                {/* Messages */}
                {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg text-center">{error}</p>}
                {success && (
                    <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-200 p-3 rounded-lg justify-center">
                        <CheckCircle2 size={18} />
                        <span>{success}</span>
                    </div>
                )}

                {/* Main Action */}
                <Button 
                    type="submit"
                    className="w-full"
                    disabled={!otp || !!success}
                    isLoading={loading}
                    rightIcon={<ArrowRight size={18} />}
                >
                    Verify Account
                </Button>
            </form>

            <p className="text-sm text-center text-on-surface-variant mt-6">
                Didn't receive the code?{' '}
                <button className="font-semibold text-primary hover:underline disabled:text-slate-300 disabled:no-underline cursor-pointer" disabled>
                    Resend OTP
                </button>
            </p>
        </AuthLayout>
    );
};

export default VerifyOtpPage;

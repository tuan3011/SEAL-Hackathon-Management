import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { Code, ArrowRight, Eye, EyeOff, User, Lock, ArrowLeft } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const LoginPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [oauthMessage, setOauthMessage] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    React.useEffect(() => {
        const params = new URLSearchParams(location.search);
        const oauthError = params.get('error');
        const stateError = (location.state as any)?.error;

        if (oauthError?.includes('pending_approval') || oauthError?.includes('Account_is_locked')) {
            setOauthMessage('Your account is pending administrator approval. Please wait for the confirmation email before signing in.');
        } else if (stateError?.includes('pending_approval') || stateError?.includes('Account_is_locked')) {
            setOauthMessage('Your account is pending administrator approval. Please wait for the confirmation email before signing in.');
        } else if (stateError) {
            setError(stateError);
        }
    }, [location]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await axios.post(
                'http://localhost:8080/api/v1/auth/login',
                { username, password }
            );

            const { accessToken, refreshToken } = response.data.data;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            navigate('/dashboard');
        } catch (err: any) {
            const message = err.response?.data?.error?.message || err.response?.data?.message || 'Incorrect username or password';
            
            if (message.toLowerCase().includes('approved')) {
                setOauthMessage('Your account is pending administrator approval. Please wait for the confirmation email before signing in.');
                setError('');
            } else {
                setError('Incorrect username or password');
                setOauthMessage('');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            {/* Back to Home */}
            <div className="mb-4">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="pl-0 text-on-surface-variant hover:text-on-surface hover:bg-transparent"
                    leftIcon={<ArrowLeft size={16} />}
                    onClick={() => navigate('/')}
                >
                    Back to Home
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex mb-8 border-b border-outline-variant">
                <button className="flex-1 pb-3 font-semibold text-center text-primary border-b-2 border-primary transition-colors cursor-pointer">
                    Log In
                </button>
                <button 
                    onClick={() => navigate('/register')}
                    className="flex-1 pb-3 text-center text-on-surface-variant border-b-2 border-transparent hover:text-on-surface transition-colors cursor-pointer"
                >
                    Create Account
                </button>
            </div>
            
            {/* Form */}
            <form className="space-y-6" onSubmit={handleLogin}>
                {/* Google Sign In */}
                <Button 
                    type="button"
                    variant="secondary"
                    className="w-full bg-white shadow-sm"
                    onClick={() => {
                        window.location.href = 'http://localhost:8080/oauth2/authorization/google';
                    }}
                    leftIcon={
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                        </svg>
                    }
                >
                    Sign in with Google
                </Button>
                
                <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-outline-variant"></div>
                    <span className="flex-shrink-0 mx-4 text-on-surface-variant text-sm">or</span>
                    <div className="flex-grow border-t border-outline-variant"></div>
                </div>

                {/* Username Field */}
                <Input 
                    label="Username"
                    id="username"
                    name="username"
                    placeholder="Enter your username"
                    required
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    leftIcon={<User size={18} />}
                />

                {/* Password Field */}
                <Input 
                    label="Password"
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    required
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    leftIcon={<Lock size={18} />}
                    rightIcon={showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    onRightIconClick={() => setShowPassword(!showPassword)}
                />

                {/* OAuth2 Pending Approval Message */}
                {oauthMessage && (
                    <div className="flex items-start gap-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 p-3 rounded-lg">
                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                        <span>{oauthMessage}</span>
                    </div>
                )}

                {/* Error Message */}
                {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg">{error}</p>}

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between mt-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <input 
                            className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary/20 focus:ring-offset-0 bg-white checked:bg-primary checked:border-primary transition-colors cursor-pointer" 
                            type="checkbox"
                        />
                        <span className="text-xs text-on-surface-variant group-hover:text-on-surface transition-colors">Remember this device for 30 days</span>
                    </label>
                    <a className="text-xs text-primary font-semibold hover:underline transition-colors" href="/forgot-password">Forgot password?</a>
                </div>

                {/* Main Action */}
                <Button 
                    type="submit"
                    className="w-full"
                    isLoading={loading}
                    rightIcon={<ArrowRight size={18} />}
                >
                    Sign In
                </Button>
            </form>
        </AuthLayout>
    );
};

export default LoginPage;
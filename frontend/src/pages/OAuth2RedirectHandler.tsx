import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const OAuth2RedirectHandler: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const accessToken = params.get('accessToken');
        const refreshToken = params.get('refreshToken');
        const error = params.get('error');

        if (accessToken && refreshToken) {
            // Save tokens to localStorage
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            
            // Redirect to dashboard
            navigate('/dashboard', { replace: true });
        } else {
            // Handle error or missing tokens
            navigate('/login', { 
                replace: true, 
                state: { error: error || 'OAuth2 login failed. Please try again.' } 
            });
        }
    }, [location, navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-surface">
            <div className="text-center">
                <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <h2 className="text-xl font-semibold text-on-surface">Authenticating...</h2>
                <p className="text-on-surface-variant">Please wait while we log you in.</p>
            </div>
        </div>
    );
};

export default OAuth2RedirectHandler;

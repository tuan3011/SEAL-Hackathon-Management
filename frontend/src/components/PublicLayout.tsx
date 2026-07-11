import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Trophy, LogIn } from 'lucide-react';
import { isAuthenticated } from '../services/authUtils';

const PublicHeader: React.FC = () => {
    const navigate = useNavigate();
    const loggedIn = isAuthenticated();

    return (
        <header className="flex items-center justify-between w-full h-16 px-6 md:px-8 bg-white border-b border-neutral-border sticky top-0 z-50 shadow-sm">
             <Link to="/" className="flex items-center gap-3 group">
                <div className="bg-brand-orange p-2 rounded-lg group-hover:scale-105 transition-transform duration-200">
                    <Trophy size={20} className="text-white" />
                </div>
                <div className="text-xl md:text-2xl font-bold tracking-tight text-brand-navy group-hover:text-brand-orange transition-colors">
                    SEAL Hackathon
                </div>
            </Link>
            
            {loggedIn ? (
                 <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-brand-orange hover:bg-primary hover:shadow-md transition-all duration-300 rounded-lg"
                >
                    Go to Dashboard
                </button>
            ) : (
                <button
                    onClick={() => navigate('/login')}
                    className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-brand-navy bg-neutral-base border border-neutral-border rounded-lg hover:bg-neutral-divider transition-all duration-300 cursor-pointer"
                >
                    <LogIn size={16} className="text-brand-orange" />
                    Sign In
                </button>
            )}
        </header>
    );
};


const PublicLayout: React.FC = () => {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <PublicHeader />
            <main className="flex-grow">
                <Outlet />
            </main>
        </div>
    );
};

export default PublicLayout;

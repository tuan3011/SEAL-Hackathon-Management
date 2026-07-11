import React from 'react';
import { Code } from 'lucide-react';

interface AuthLayoutProps {
    children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
    return (
        <div className="bg-surface-container-lowest min-h-screen font-body-md text-on-surface flex flex-col md:flex-row w-full">
            {/* Left Side: Hero Section */}
            <div className="hidden md:flex md:w-1/2 bg-brand-navy text-white flex-col p-8 lg:p-12 justify-between h-screen overflow-y-auto">
                {/* Logo */}
                <div className="flex items-center gap-2 mb-8">
                    <Code className="text-primary-container font-bold text-2xl" />
                    <span className="font-headline-sm text-headline-sm font-semibold">SEAL Hackathon</span>
                </div>
                {/* Hero Image */}
                <div className="flex-grow flex items-center justify-center mb-8">
                    <img 
                        alt="Students collaborating on a technology project" 
                        className="w-full max-w-lg object-contain rounded-lg shadow-2xl" 
                        src="https://lh3.googleusercontent.com/aida/ADBb0uitWim82Q5HfJqywHlRjkXxio2RpnopMgkHEKJ0tMxeOH_jBYBLhndF1KCCeX_ojm2jGSpoEf-7rQcG2lOD7IA_diFsTsXwt_2LTZ_dsDfdA9HexT5YsaL_kJNXMOSfry5qQv1sZlSAjIgu3hu7dc-7Pw3C811SEusrLx7wDrPhRtfMZIGHYbFGtyDCYibDyJ_y7t52QPh1xu2HV7gKjqiQS_FCCZgw-G0DrocQ5aQweNEzONcH2xRqLZ7O"
                    />
                </div>
                {/* Typography */}
                <div className="max-w-md">
                    <h1 className="font-headline-lg text-headline-lg font-bold mb-4 leading-tight">Empowering the next generation of software innovators.</h1>
                    <p className="font-body-lg text-body-lg text-slate-300">Join the elite FPT University hackathon. Build, collaborate, and showcase your skills to top industry leaders.</p>
                </div>
            </div>

            {/* Right Side: Form Section */}
            <main className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 h-screen overflow-y-auto bg-white relative">
                {/* Mobile Logo */}
                <div className="absolute top-6 left-6 md:hidden flex items-center gap-2 text-brand-navy">
                    <Code className="text-primary-container font-bold text-2xl" />
                    <span className="font-headline-sm text-headline-sm font-semibold">SEAL Hackathon</span>
                </div>
                <div className="w-full max-w-md mt-16 md:mt-0">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AuthLayout;

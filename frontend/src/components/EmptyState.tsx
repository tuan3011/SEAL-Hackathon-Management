import React from 'react';
import { FileQuestion } from 'lucide-react';

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
    icon = <FileQuestion size={40} className="text-gray-300" />, 
    title, 
    description, 
    action, 
    className = "" 
}) => {
    return (
        <div className={`flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl shadow-sm border border-gray-100 min-h-[200px] ${className}`}>
            <div className="mb-4 bg-gray-50 p-4 rounded-full">
                {icon}
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
            {description && (
                <p className="text-sm text-gray-500 max-w-sm mx-auto mb-4">{description}</p>
            )}
            {action && (
                <div className="mt-2">
                    {action}
                </div>
            )}
        </div>
    );
};

export default EmptyState;

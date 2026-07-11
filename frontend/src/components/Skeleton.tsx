import React from 'react';

interface SkeletonProps {
    className?: string;
    type?: 'text' | 'title' | 'avatar' | 'card' | 'table-row';
    lines?: number;
}

const Skeleton: React.FC<SkeletonProps> = ({ className = '', type = 'text', lines = 1 }) => {
    const baseClass = "animate-pulse bg-gray-200 rounded";

    if (type === 'table-row') {
        return (
            <div className={`space-y-3 ${className}`}>
                {Array.from({ length: lines }).map((_, idx) => (
                    <div key={idx} className="flex gap-4 p-4 border-b border-gray-100">
                        <div className={`${baseClass} h-4 w-1/4`} />
                        <div className={`${baseClass} h-4 w-1/4`} />
                        <div className={`${baseClass} h-4 w-1/4`} />
                        <div className={`${baseClass} h-4 w-1/4`} />
                    </div>
                ))}
            </div>
        );
    }

    if (type === 'card') {
        return (
            <div className={`border border-gray-100 p-4 rounded-xl shadow-sm space-y-3 ${className}`}>
                <div className="flex items-center gap-3">
                    <div className={`${baseClass} w-10 h-10 rounded-full`} />
                    <div className="space-y-2 flex-1">
                        <div className={`${baseClass} h-4 w-1/3`} />
                        <div className={`${baseClass} h-3 w-1/4`} />
                    </div>
                </div>
                <div className="space-y-2 pt-2">
                    <div className={`${baseClass} h-3 w-full`} />
                    <div className={`${baseClass} h-3 w-5/6`} />
                </div>
            </div>
        );
    }

    return (
        <div className={`space-y-2 ${className}`}>
            {Array.from({ length: lines }).map((_, idx) => (
                <div
                    key={idx}
                    className={`${baseClass} ${
                        type === 'avatar' ? 'w-12 h-12 rounded-full' :
                        type === 'title' ? 'h-6 w-1/2' :
                        'h-4 w-full'
                    }`}
                />
            ))}
        </div>
    );
};

export default Skeleton;

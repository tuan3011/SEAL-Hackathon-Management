import React from 'react';

type Status = 'DRAFT' | 'REGISTRATION_OPEN' | 'ONGOING' | 'ENDED' | 'CANCELLED' | 'PENDING' | 'DISQUALIFIED' | string;

interface StatusBadgeProps {
    status: Status;
    size?: 'sm' | 'md';
}

const statusConfig: Record<string, { label: string; className: string }> = {
    DRAFT: {
        label: 'Draft',
        className: 'bg-slate-100 text-slate-700 border border-slate-200',
    },
    PUBLISHED: {
        label: 'Published',
        className: 'bg-blue-50 text-blue-700 border border-blue-200',
    },
    REGISTRATION_OPEN: {
        label: 'Registration Open',
        className: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    },
    ONGOING: {
        label: 'Ongoing',
        className: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    },
    IN_PROGRESS: {
        label: 'Ongoing',
        className: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    },
    COMPLETED: {
        label: 'Completed',
        className: 'bg-slate-100 text-slate-500 border border-slate-200',
    },
    ENDED: {
        label: 'Ended',
        className: 'bg-slate-100 text-slate-500 border border-slate-200',
    },
    CANCELLED: {
        label: 'Cancelled',
        className: 'bg-rose-100 text-rose-800 border border-rose-200',
    },
    PENDING: {
        label: 'Pending',
        className: 'bg-brand-orange/10 text-brand-orange border border-brand-orange/20',
    },
    DISQUALIFIED: {
        label: 'Disqualified',
        className: 'bg-rose-100 text-rose-800 border border-rose-200',
    },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
    const config = statusConfig[status] ?? {
        label: status.replace(/_/g, ' '),
        className: 'bg-slate-100 text-slate-600 border border-slate-200',
    };

    const sizeClass = size === 'md'
        ? 'px-3 py-1 text-sm font-semibold'
        : 'px-2.5 py-0.5 text-xs font-semibold';

    return (
        <span className={`inline-flex items-center rounded-full ${sizeClass} ${config.className}`}>
            {config.label}
        </span>
    );
};

export default StatusBadge;

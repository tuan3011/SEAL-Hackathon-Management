import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
    maxWidth = 'md',
}) => {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const maxWidthClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-slate-900/50 backdrop-blur-sm p-4 sm:p-6 transition-opacity">
            <div
                className={`relative w-full ${maxWidthClasses[maxWidth]} bg-surface-container-lowest rounded-2xl shadow-floating transform transition-all flex flex-col max-h-[90vh]`}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? 'modal-title' : undefined}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant shrink-0">
                    {title && (
                        <h3 className="text-lg font-semibold text-on-surface" id="modal-title">
                            {title}
                        </h3>
                    )}
                    <button
                        onClick={onClose}
                        className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-orange ml-auto"
                        aria-label="Close modal"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-6 overflow-y-auto">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="px-6 py-4 border-t border-outline-variant bg-slate-50 rounded-b-2xl shrink-0 flex items-center justify-end gap-3">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;

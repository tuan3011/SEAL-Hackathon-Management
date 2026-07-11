import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isDanger = false
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
            <div className="bg-white rounded-xl shadow-2xl border border-gray-100 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-full flex-shrink-0 ${isDanger ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                            <AlertTriangle size={24} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">{message}</p>
                        </div>
                    </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg shadow-sm transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className={`px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-sm transition-colors ${
                            isDanger 
                                ? 'bg-red-600 hover:bg-red-700 active:bg-red-800' 
                                : 'bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-gray-950 font-bold'
                        }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;

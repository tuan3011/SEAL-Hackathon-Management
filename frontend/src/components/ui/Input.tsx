import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    onRightIconClick?: () => void;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            className = '',
            label,
            error,
            helperText,
            leftIcon,
            rightIcon,
            onRightIconClick,
            id,
            disabled,
            ...props
        },
        ref
    ) => {
        const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-semibold text-on-surface mb-2"
                    >
                        {label}
                    </label>
                )}
                <div className="relative">
                    {leftIcon && (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        id={inputId}
                        ref={ref}
                        disabled={disabled}
                        className={`w-full px-4 py-2 bg-white rounded-lg border text-on-surface text-sm transition-all duration-200 focus:outline-none focus:ring-2 disabled:bg-slate-50 disabled:text-slate-500
                            ${leftIcon ? 'pl-10' : ''}
                            ${rightIcon ? 'pr-10' : ''}
                            ${
                                error
                                    ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500'
                                    : 'border-outline-variant focus:ring-brand-orange/20 focus:border-brand-orange hover:border-neutral-400'
                            }
                            ${className}
                        `}
                        {...props}
                    />
                    {rightIcon && (
                        <button
                            type="button"
                            onClick={onRightIconClick}
                            disabled={disabled || !onRightIconClick}
                            className={`absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 
                                ${onRightIconClick ? 'hover:text-primary cursor-pointer focus:outline-none' : 'pointer-events-none'}
                            `}
                        >
                            {rightIcon}
                        </button>
                    )}
                </div>
                {error && <p className="mt-1.5 text-sm text-red-600 font-medium">{error}</p>}
                {helperText && !error && (
                    <p className="mt-1.5 text-sm text-on-surface-variant">{helperText}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;

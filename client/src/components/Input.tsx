import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, hint, id, className = '', ...props }) => {
  const inputId = id || props.name || `input_${Math.random().toString(36).substring(2, 7)}`;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold uppercase tracking-wider text-[#2B1D16]/80">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-3.5 py-2.5 text-sm bg-[#FAF6F0] text-[#2B1D16] border rounded-lg transition-colors placeholder:text-[#2B1D16]/40 focus:outline-none focus:ring-1 ${
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
            : 'border-[#2B1D16]/20 focus:border-[#C2622D] focus:ring-[#C2622D]'
        } ${className}`}
        aria-invalid={error ? 'true' : 'false'}
        {...props}
      />
      {hint && !error && <span className="text-xs text-[#2B1D16]/60">{hint}</span>}
      {error && <span className="text-xs font-medium text-red-600">{error}</span>}
    </div>
  );
};

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shrink-0 cursor-pointer';

  const sizeClasses = {
    sm: 'text-xs px-3.5 py-1.5 rounded-md gap-1.5',
    md: 'text-sm px-5 py-2.5 rounded-lg gap-2',
    lg: 'text-base px-6 py-3 rounded-lg gap-2.5',
  }[size];

  const variantClasses = {
    primary:
      'bg-[#C2622D] text-[#FAF6F0] hover:bg-[#A85022] active:bg-[#92441B] focus-visible:ring-[#C2622D] shadow-sm',
    secondary:
      'bg-[#2B1D16] text-[#FAF6F0] hover:bg-[#3F2C22] active:bg-[#1C120D] focus-visible:ring-[#2B1D16]',
    outline:
      'border border-[#2B1D16]/20 text-[#2B1D16] bg-transparent hover:bg-[#2B1D16]/5 active:bg-[#2B1D16]/10 focus-visible:ring-[#2B1D16]',
    ghost:
      'text-[#2B1D16] bg-transparent hover:bg-[#2B1D16]/5 active:bg-[#2B1D16]/10 focus-visible:ring-[#2B1D16]',
    danger:
      'bg-[#B91C1C] text-[#FAF6F0] hover:bg-[#991B1B] active:bg-[#7F1D1D] focus-visible:ring-[#B91C1C]',
  }[variant];

  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>Processing...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

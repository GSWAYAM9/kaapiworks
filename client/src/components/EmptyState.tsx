import React from 'react';
import { Coffee } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center max-w-md mx-auto my-8 border border-dashed border-[#2B1D16]/20 rounded-xl bg-[#FAF6F0]/60">
      <div className="w-14 h-14 rounded-full bg-[#2B1D16]/5 text-[#C2622D] flex items-center justify-center mb-4">
        {icon || <Coffee className="w-7 h-7" />}
      </div>
      <h3 className="font-serif text-xl font-bold text-[#2B1D16] mb-2">{title}</h3>
      <p className="text-sm text-[#2B1D16]/70 leading-relaxed mb-6">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} variant="primary">
          {actionText}
        </Button>
      )}
    </div>
  );
};

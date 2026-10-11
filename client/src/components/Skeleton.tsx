import React from 'react';

export const CardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col bg-[#FAF6F0] border border-[#2B1D16]/10 rounded-lg overflow-hidden animate-pulse">
      <div className="w-full aspect-4/3 bg-[#2B1D16]/10" />
      <div className="p-5 flex flex-col gap-3">
        <div className="h-3 w-20 bg-[#2B1D16]/10 rounded" />
        <div className="h-5 w-3/4 bg-[#2B1D16]/15 rounded" />
        <div className="h-3 w-full bg-[#2B1D16]/10 rounded" />
        <div className="flex items-center justify-between pt-2 border-t border-[#2B1D16]/5 mt-2">
          <div className="h-5 w-16 bg-[#2B1D16]/15 rounded" />
          <div className="h-8 w-24 bg-[#2B1D16]/15 rounded" />
        </div>
      </div>
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="w-full border border-[#2B1D16]/10 rounded-lg overflow-hidden bg-[#FAF6F0] animate-pulse">
      <div className="h-12 bg-[#2B1D16]/5 border-b border-[#2B1D16]/10" />
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-16 border-b border-[#2B1D16]/5 px-6 flex items-center justify-between gap-4"
        >
          <div className="h-4 w-12 bg-[#2B1D16]/10 rounded" />
          <div className="h-4 w-48 bg-[#2B1D16]/15 rounded" />
          <div className="h-4 w-24 bg-[#2B1D16]/10 rounded" />
          <div className="h-4 w-20 bg-[#2B1D16]/10 rounded" />
          <div className="h-8 w-20 bg-[#2B1D16]/15 rounded" />
        </div>
      ))}
    </div>
  );
};

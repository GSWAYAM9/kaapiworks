import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from './Button';

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#C2622D] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login?redirect=/admin" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-[#F4EDE3]">
        <div className="max-w-md w-full bg-[#FAF6F0] border border-[#2B1D16]/15 rounded-xl p-8 text-center shadow-lg">
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-red-600">
            HTTP 403 Forbidden
          </span>
          <h2 className="font-serif text-2xl font-bold text-[#2B1D16] mt-1 mb-3">
            Admin Privileges Required
          </h2>
          <p className="text-sm text-[#2B1D16]/75 leading-relaxed mb-6">
            You are signed in as <strong>{user?.name}</strong> ({user?.email}) with the role{' '}
            <span className="font-mono text-xs bg-[#2B1D16]/10 px-1.5 py-0.5 rounded">customer</span>. Only administrator accounts can access this console.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/">
              <Button variant="outline" size="sm" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Return to Store
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="primary" size="sm" className="w-full">
                <LogIn className="w-4 h-4 mr-1" />
                Sign in as Admin
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

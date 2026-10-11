import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Coffee, Shield, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

export const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email.trim() || !password) {
      setFormError('Please enter both email and password.');
      return;
    }

    const success = await login(email.trim(), password);
    if (success) {
      navigate(redirect);
    }
  };

  const fillAdminTest = () => {
    setEmail('admin@kaapiworks.in');
    setPassword('KaapiAdmin@2026');
    setFormError(null);
  };

  const fillCustomerTest = () => {
    setEmail('customer@kaapiworks.in');
    setPassword('KaapiCustomer@2026');
    setFormError(null);
  };

  return (
    <div className="bg-[#F4EDE3] min-h-[80vh] py-12 px-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-[#FAF6F0] rounded-2xl border border-[#2B1D16]/12 p-8 shadow-xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#2B1D16] text-[#FAF6F0] flex items-center justify-center mx-auto mb-3 shadow-md">
            <Coffee className="w-6 h-6 text-[#C2622D]" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#2B1D16]">Welcome to Kaapi Works</h1>
          <p className="text-xs text-[#2B1D16]/70 mt-1">
            Sign in to access your coffee bag, saved addresses, and roastery orders.
          </p>
        </div>

        {/* Evaluator Quick Credential Fillers */}
        <div className="mb-6 p-3 rounded-xl bg-[#F4EDE3] border border-[#2B1D16]/10 text-xs">
          <span className="font-semibold text-[#2B1D16] block mb-2">
            Hiring Test Quick Credentials:
          </span>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={fillAdminTest}
              className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#2F4A3A] text-[#FAF6F0] font-medium text-[11px] hover:bg-[#23382C] transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Fill Admin (Full Access)</span>
            </button>
            <button
              type="button"
              onClick={fillCustomerTest}
              className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#2B1D16] text-[#FAF6F0] font-medium text-[11px] hover:bg-[#3F2C22] transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span>Fill Customer (Buyer)</span>
            </button>
          </div>
        </div>

        {formError && (
          <div className="p-3 mb-4 rounded-lg bg-red-100 border border-red-300 text-red-800 text-xs">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. roaster@kaapiworks.in"
            required
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            required
            autoComplete="current-password"
          />

          <Button
            type="submit"
            isLoading={isLoading}
            variant="primary"
            size="lg"
            className="w-full mt-2"
          >
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </form>

        <div className="pt-6 mt-6 border-t border-[#2B1D16]/10 text-center text-xs text-[#2B1D16]/70">
          <span>New to Kaapi Works? </span>
          <Link
            to={`/register?redirect=${encodeURIComponent(redirect)}`}
            className="font-bold text-[#C2622D] hover:underline"
          >
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};

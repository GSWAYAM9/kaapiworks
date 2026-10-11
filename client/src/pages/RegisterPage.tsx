import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Coffee, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

export const RegisterPage: React.FC = () => {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }

    const success = await register(name.trim(), email.trim(), password);
    if (success) {
      navigate(redirect);
    }
  };

  return (
    <div className="bg-[#F4EDE3] min-h-[80vh] py-12 px-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-[#FAF6F0] rounded-2xl border border-[#2B1D16]/12 p-8 shadow-xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#2B1D16] text-[#FAF6F0] flex items-center justify-center mx-auto mb-3 shadow-md">
            <Coffee className="w-6 h-6 text-[#C2622D]" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#2B1D16]">Create Your Account</h1>
          <p className="text-xs text-[#2B1D16]/70 mt-1">
            Join the Kaapi Works community for early access to micro-lot harvests.
          </p>
        </div>

        {formError && (
          <div className="p-3 mb-4 rounded-lg bg-red-100 border border-red-300 text-red-800 text-xs">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Full Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Priya Iyer"
            required
            autoComplete="name"
          />

          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. priya@example.com"
            required
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            required
            autoComplete="new-password"
            hint="Must be at least 6 characters"
          />

          <Button
            type="submit"
            isLoading={isLoading}
            variant="primary"
            size="lg"
            className="w-full mt-2"
          >
            <span>Create Account</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </form>

        <div className="pt-6 mt-6 border-t border-[#2B1D16]/10 text-center text-xs text-[#2B1D16]/70">
          <span>Already registered? </span>
          <Link
            to={`/login?redirect=${encodeURIComponent(redirect)}`}
            className="font-bold text-[#C2622D] hover:underline"
          >
            Sign in instead
          </Link>
        </div>
      </div>
    </div>
  );
};

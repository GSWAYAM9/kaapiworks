import React, { useState } from 'react';
import { Mail, CheckCircle2, ArrowRight, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from './Toast';

interface NewsletterSignupProps {
  className?: string;
}

export const NewsletterSignup: React.FC<NewsletterSignupProps> = ({ className = '' }) => {
  const { success, error: toastError } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [inputError, setInputError] = useState('');

  const validateEmail = (val: string) => {
    return /^\S+@\S+\.\S+$/.test(val.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInputError('');

    const trimmed = email.trim();
    if (!trimmed) {
      setInputError('Please enter your email address.');
      return;
    }

    if (!validateEmail(trimmed)) {
      setInputError('Please enter a valid email address (e.g. name@domain.com).');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.subscribeNewsletter(trimmed, 'footer');
      setIsSuccess(true);
      setStatusMessage(res.message);
      success(res.message);
    } catch (err: any) {
      const msg = err.message || 'Unable to subscribe. Please try again.';
      setInputError(msg);
      toastError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`w-full bg-[#35231A]/70 backdrop-blur-xs border border-[#FAF6F0]/10 rounded-2xl p-6 sm:p-8 lg:p-10 text-[#FAF6F0] shadow-lg ${className}`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Heading & Value Proposition */}
        <div className="lg:col-span-7 flex flex-col gap-2.5">
          <div className="inline-flex items-center gap-2 self-start px-2.5 py-1 rounded-full bg-[#C2622D]/20 border border-[#C2622D]/30 text-[#C2622D] text-[11px] font-semibold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Roaster's Dispatch</span>
          </div>

          <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#FAF6F0]">
            Fresh Roasts, Origin Stories & Cupping Notes
          </h3>

          <p className="text-sm text-[#FAF6F0]/75 leading-relaxed max-w-xl">
            Join 4,200+ South Indian coffee connoisseurs. Receive first access to limited Chikmagalur & Araku micro-lot harvest drops, seasonal roast profiles, and brewing guides.
          </p>

          {/* Micro Value Tags */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 pt-2 text-xs text-[#FAF6F0]/60">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C2622D]" />
              <span>Micro-Batch Drops</span>
            </span>
            <span className="text-[#FAF6F0]/20">·</span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C2622D]" />
              <span>Private Tasting Invites</span>
            </span>
            <span className="text-[#FAF6F0]/20">·</span>
            <span className="flex items-center gap-1.5">
              <span>No Spam Ever</span>
            </span>
          </div>
        </div>

        {/* Right Column: Interactive Subscription Form */}
        <div className="lg:col-span-5">
          {isSuccess ? (
            <div className="p-5 rounded-xl bg-[#2F4A3A]/40 border border-[#2F4A3A]/60 flex flex-col gap-3 animate-in fade-in duration-300">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm text-[#FAF6F0]">
                    You are in the guild!
                  </h4>
                  <p className="text-xs text-[#FAF6F0]/80 mt-1 leading-relaxed">
                    {statusMessage ||
                      'We have reserved your spot for our next weekly micro-lot roasting alert.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#FAF6F0]/10 text-[11px] text-[#FAF6F0]/60">
                <span className="truncate max-w-[200px] font-mono text-[#FAF6F0]/90">
                  {email}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsSuccess(false);
                    setEmail('');
                    setStatusMessage('');
                  }}
                  className="text-[#C2622D] hover:underline cursor-pointer"
                >
                  Subscribe another email
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-2.5" noValidate>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-[#FAF6F0]/40 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (inputError) setInputError('');
                    }}
                    disabled={isLoading}
                    placeholder="Enter your email address..."
                    className={`w-full bg-[#2B1D16]/90 border rounded-lg py-3 pl-10 pr-4 text-sm text-[#FAF6F0] placeholder:text-[#FAF6F0]/40 focus:outline-none focus:ring-1 transition-all ${
                      inputError
                        ? 'border-red-400 focus:border-red-400 focus:ring-red-400/30'
                        : 'border-[#FAF6F0]/20 focus:border-[#C2622D] focus:ring-[#C2622D]/40'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-3 rounded-lg bg-[#C2622D] hover:bg-[#d66f36] text-[#FAF6F0] text-sm font-semibold flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer disabled:opacity-60 active:scale-98 shadow-sm"
                  aria-label="Subscribe to newsletter"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Subscribing...</span>
                    </>
                  ) : (
                    <>
                      <span>Join Guild</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Error Message */}
              {inputError && (
                <p className="text-xs text-red-300 font-medium pl-1 animate-in fade-in duration-150">
                  {inputError}
                </p>
              )}

              <p className="text-[11px] text-[#FAF6F0]/50 pl-1">
                By signing up, you agree to receive promotional updates from Kaapi Works. Easy one-click unsubscribe at any time.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

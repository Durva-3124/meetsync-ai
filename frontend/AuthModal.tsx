import React, { useState } from 'react';
import { X, Lock, Mail, ArrowRight, ShieldCheck, Sparkles, Building2, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin: (userData: { email: string; name: string; role: string }) => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('elena.rostova@meetsync.corp');
  const [password, setPassword] = useState('••••••••••••');
  const [name, setName] = useState('Elena Rostova');
  const [org, setOrg] = useState('Enterprise Product Guild');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccessLogin({
      email,
      name: mode === 'signup' ? name : 'Elena Rostova',
      role: 'VP of Product',
    });
  };

  const handleQuickDemoLogin = () => {
    onSuccessLogin({
      email: 'elena.rostova@meetsync.corp',
      name: 'Elena Rostova',
      role: 'VP of Product',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-6 sm:p-8 relative text-slate-100 ring-1 ring-[#00F9C7]/20">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          aria-label="Close authentication modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Brand Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1D70F5] to-[#00F9C7] flex items-center justify-center text-slate-950 font-black text-xl shadow-[0_0_15px_rgba(0,249,199,0.3)]">
            M
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white">MeetSync AI</span>
              <span className="text-[10px] font-mono font-bold bg-[#00F9C7]/15 text-[#00F9C7] px-2 py-0.5 rounded-full border border-[#00F9C7]/30">
                Enterprise
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {mode === 'login' ? 'Sign in to access your intelligence workspace' : 'Start your 14-day enterprise trial'}
            </p>
          </div>
        </div>

        {/* Quick Demo Access One-Click Button */}
        <button
          onClick={handleQuickDemoLogin}
          type="button"
          className="w-full mb-5 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-[#00F9C7] hover:bg-[#00E5B6] text-slate-950 font-bold text-xs uppercase tracking-wider transition shadow-[0_0_20px_rgba(0,249,199,0.25)] active:scale-98"
        >
          <Sparkles className="w-4 h-4 fill-slate-950" />
          <span>Instant One-Click Demo Access</span>
        </button>

        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-slate-900 px-3 text-[11px] font-mono uppercase text-slate-500 shrink-0">
            or continue with credentials
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="text-xs font-semibold text-slate-300">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Elena Rostova"
                className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-sm text-white placeholder-slate-500 focus:border-[#00F9C7] focus:ring-1 focus:ring-[#00F9C7] outline-none"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-300">Work Email Address</label>
            <div className="relative mt-1.5">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-sm text-white placeholder-slate-500 focus:border-[#00F9C7] focus:ring-1 focus:ring-[#00F9C7] outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              {mode === 'login' && (
                <button type="button" className="text-[11px] text-[#00F9C7] hover:underline">
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative mt-1.5">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-sm text-white placeholder-slate-500 focus:border-[#00F9C7] focus:ring-1 focus:ring-[#00F9C7] outline-none"
              />
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-[#1D70F5] hover:bg-[#165fd4] text-white font-bold text-sm transition shadow-md flex items-center justify-center gap-2 mt-2"
          >
            <span>{mode === 'login' ? 'Sign In to Workspace' : 'Create Organization Workspace'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Enterprise SSO Option */}
        <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
          <button
            type="button"
            onClick={handleQuickDemoLogin}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 text-xs font-semibold text-slate-200 transition"
          >
            <Building2 className="w-4 h-4 text-slate-400" />
            <span>Sign In with Enterprise SSO (Okta / Google Workspace)</span>
          </button>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <span>{mode === 'login' ? "Don't have an account?" : 'Already have an enterprise account?'}</span>
            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="font-bold text-[#00F9C7] hover:underline"
            >
              {mode === 'login' ? 'Sign Up / Request Demo' : 'Sign In'}
            </button>
          </div>
        </div>

        {/* Security Stamp */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>SOC2 Type II Certified · 256-bit AES Encryption</span>
        </div>

      </div>
    </div>
  );
};

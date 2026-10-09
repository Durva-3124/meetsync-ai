import React, { useState } from 'react';
import { Lock, Mail, User, Shield, AlertCircle, ArrowRight, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AuthView: React.FC<Props> = ({ onSuccess, onCancel }) => {
  const { login, register, availablePersonas } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Enterprise Lead');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid enterprise email address.');
      return;
    }
    if (!password || password.trim().length === 0) {
      setErrorMessage('Password cannot be empty.');
      return;
    }
    if (mode === 'register' && !name.trim()) {
      setErrorMessage('Full name is required for enterprise registration.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email.trim(), password);
      } else {
        await register(name.trim(), email.trim(), password, role);
      }
      onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (personaEmail: string) => {
    setEmail(personaEmail);
    setPassword('enterprise-secret-key');
    setLoading(true);
    setErrorMessage(null);
    try {
      await login(personaEmail, 'enterprise-secret-key');
      onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
      <div
        className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--card)] text-[var(--text-primary)] p-6 sm:p-8 shadow-2xl transition-all"
      >
        {/* Brand Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00F5D4] via-[#00E5FF] to-[#2563EB] flex items-center justify-center mx-auto shadow-md">
            <span className="font-mono font-black text-slate-950 text-xl">M</span>
          </div>
          <h2 className="text-xl font-extrabold text-[var(--heading)]">
            MeetSync AI Enterprise
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Sign in to access your multi-meeting synthesis dashboard
          </p>
        </div>

        {/* Tab switch between Login and Register */}
        <div className="flex p-1 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs font-semibold mb-6">
          <button
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-[var(--primary)] text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setMode('register');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-[var(--primary)] text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Register Account
          </button>
        </div>

        {/* Error Toast */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-600/50 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {mode === 'register' && (
            <div>
              <label className="block font-semibold text-[var(--text-primary)] mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-[var(--text-secondary)]" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Trisha Moharle"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-semibold text-[var(--text-primary)] mb-1">Work Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-[var(--text-secondary)]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@enterprise.io"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[var(--text-primary)] mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-[var(--text-secondary)]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-xs bg-[#00F5D4] text-slate-950 hover:bg-[#00E5FF] shadow-lg shadow-[#00F5D4]/20 transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In to Dashboard' : 'Create Enterprise Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* 1-Click Executive Demo Personas */}
        <div className="mt-6 pt-5 border-t border-[var(--border)] space-y-2 text-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] text-center">
            Instant 1-Click Executive Access
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickLogin('trishamoharle26@enterprise.io')}
              className="p-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)] hover:border-[#00F5D4] text-left transition-colors"
            >
              <div className="font-bold text-[var(--text-primary)] text-[11px]">Trisha Moharle</div>
              <div className="text-[10px] text-[#00F5D4] font-medium">Enterprise Lead</div>
            </button>
            <button
              onClick={() => handleQuickLogin('mohan.moharle@enterprise.io')}
              className="p-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)] hover:border-[#00F5D4] text-left transition-colors"
            >
              <div className="font-bold text-[var(--text-primary)] text-[11px]">Mohan Moharle</div>
              <div className="text-[10px] text-sky-400 font-medium">Enterprise Admin</div>
            </button>
          </div>
        </div>

        <button
          onClick={onCancel}
          className="w-full mt-4 text-center text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          Cancel & Return to Overview
        </button>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext.jsx';
import { Logo } from '../../../components/ui/index.js';

export const AdminAuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading } = useAdminAuth();

  const [username, setUsername] = useState('shoaibwani');
  const [password, setPassword] = useState('kashbites@admin2026');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // If already logged in, redirect to dashboard
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || '/prelaunch/admin/dashboard';
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Please provide both administrator username and password');
      return;
    }

    const res = await login(username, password);
    if (!res.success) {
      setError(res.message || 'Authentication failed. Please verify credentials.');
    } else {
      const from = location.state?.from?.pathname || '/prelaunch/admin/dashboard';
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-brand-emerald-darker flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
      {/* Background radial accent */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(var(--color-brand-gold-bright)_1px,transparent_1px)] [background-size:24px_24px]"></div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-brand-gold/30 overflow-hidden relative z-10">
        {/* Header Banner */}
        <div className="bg-brand-emerald p-6 text-center text-white border-b border-brand-gold/40 relative">
          <div className="flex justify-center mb-3">
            <Logo variant="light" size="md" />
          </div>

          <h1 className="font-serif-brand text-2xl font-bold tracking-tight flex items-center justify-center gap-2">
            <span>Atelier Portal</span>
            <span className="text-[10px] bg-brand-gold text-brand-emerald-darker px-2 py-0.5 rounded font-bold uppercase tracking-wider">
              Admin
            </span>
          </h1>
          <p className="text-xs text-brand-sand-light mt-1 font-medium">
            Administrative & Logistics Operation Suite
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-brand-emerald block mb-1.5">
              Admin Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-brand-text-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="shoaibwani"
                autoComplete="username"
                className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-brand-sand bg-white text-brand-text-display placeholder:text-brand-text-subtle focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-brand-emerald block mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-brand-text-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoComplete="current-password"
                className="w-full text-xs pl-10 pr-10 py-2.5 rounded-xl border border-brand-sand bg-white text-brand-text-display placeholder:text-brand-text-subtle focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-text-subtle hover:text-brand-emerald"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand-emerald hover:bg-brand-emerald-dark text-brand-gold font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer disabled:opacity-60"
            >
              <span>{isLoading ? 'Authenticating...' : 'Sign In to Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="text-center pt-2 border-t border-brand-sand/60">
            <button
              type="button"
              onClick={() => navigate('/prelaunch')}
              className="text-xs text-brand-emerald hover:underline font-medium cursor-pointer"
            >
              ← Back to Customer Storefront
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAuthPage;

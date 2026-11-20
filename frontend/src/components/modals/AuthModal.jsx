import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Logo } from '../common/Logo.jsx';
import { X, Lock, Mail, User as UserIcon, Phone, Sparkles, ArrowRight } from 'lucide-react';
export const AuthModal = () => {
    const { isAuthModalOpen, setIsAuthModalOpen, login, register, quickLoginAsOwais } = useAuth();
    const [mode, setMode] = useState('login');
    const [email, setEmail] = useState('mohammadowais616@gmail.com');
    const [password, setPassword] = useState('password123');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    if (!isAuthModalOpen)
        return null;
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            if (mode === 'login') {
                const res = await login(email, password);
                if (!res.success)
                    setError(res.message || 'Invalid email or password');
            }
            else {
                const res = await register(name, email, phone, password);
                if (!res.success)
                    setError(res.message || 'Registration failed');
            }
        }
        catch {
            setError('Something went wrong. Please try again.');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#FCFAF5] rounded-2xl shadow-2xl border-2 border-[#C59432]/40 overflow-hidden text-[#1E2E21]">
        
        {/* Header Ribbon */}
        <div className="bg-[#103822] text-[#FAF7F2] p-5 border-b-2 border-[#C59432] relative flex flex-col items-center text-center">
          <button onClick={() => setIsAuthModalOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 text-white transition-colors">
            <X className="w-5 h-5"/>
          </button>

          <Logo variant="light" size="sm" showTagline={false}/>
          <h3 className="font-serif-brand text-xl font-bold mt-2">
            {mode === 'login' ? 'Welcome Back to KashBites' : 'Join the KashBites Family'}
          </h3>
          <span className="text-xs text-[#D5C9B5] mt-0.5">
            {mode === 'login'
            ? 'Sign in to access your orders, saved addresses & Chinar points'
            : 'Direct from Kashmir mountain orchards to your doorstep'}
          </span>
        </div>

        {/* Body */}
        <div className="p-6">
          
          {/* Quick 1-Click Demo Login Button */}
          {mode === 'login' && (<div className="mb-5 p-3 rounded-xl bg-[#FAF0D6] border border-[#DFB248]/60 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#9E6D0E] shrink-0"/>
                <div className="text-left">
                  <span className="text-[11px] font-bold text-[#6D4906] block">
                    Quick Testing Account
                  </span>
                  <span className="text-[10px] text-[#865908]">
                    mohammadowais616@gmail.com
                  </span>
                </div>
              </div>

              <button type="button" onClick={quickLoginAsOwais} className="px-3 py-1.5 bg-[#143E26] hover:bg-[#0E2D1B] text-white rounded-lg text-xs font-bold transition-all shadow-xs shrink-0">
                1-Click Login
              </button>
            </div>)}

          {error && (<div className="mb-4 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {error}
            </div>)}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (<>
                <div>
                  <label className="block text-xs font-semibold text-[#4F6354] mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-[#8C9C90] absolute left-3 top-3"/>
                    <input type="text" required placeholder="e.g. Mohammad Owais" value={name} onChange={(e) => setName(e.target.value)} className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-[#D5CABB] bg-white outline-none focus:border-[#143E26]"/>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4F6354] mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#8C9C90] absolute left-3 top-3"/>
                    <input type="tel" placeholder="+91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-[#D5CABB] bg-white outline-none focus:border-[#143E26]"/>
                  </div>
                </div>
              </>)}

            <div>
              <label className="block text-xs font-semibold text-[#4F6354] mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8C9C90] absolute left-3 top-3"/>
                <input type="email" required placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-[#D5CABB] bg-white outline-none focus:border-[#143E26]"/>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4F6354] mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8C9C90] absolute left-3 top-3"/>
                <input type="password" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-[#D5CABB] bg-white outline-none focus:border-[#143E26]"/>
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-[#143E26] hover:bg-[#0D2D1B] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 mt-4">
              <span>{mode === 'login' ? 'Sign In to KashBites' : 'Create My Account'}</span>
              <ArrowRight className="w-4 h-4 text-[#DFB248]"/>
            </button>
          </form>

          {/* Toggle Login / Register */}
          <div className="mt-5 pt-4 border-t border-[#E8DEC8] text-center text-xs text-[#5C6E61]">
            {mode === 'login' ? (<span>
                New to KashBites?{' '}
                <button type="button" onClick={() => {
                setMode('register');
                setError('');
            }} className="text-[#143E26] font-bold hover:underline">
                  Create an account
                </button>
              </span>) : (<span>
                Already have an account?{' '}
                <button type="button" onClick={() => {
                setMode('login');
                setError('');
            }} className="text-[#143E26] font-bold hover:underline">
                  Sign in
                </button>
              </span>)}
          </div>

        </div>

      </div>
    </div>);
};

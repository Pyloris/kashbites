import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Modal, Input, Button, Alert, Logo } from '../ui/index.js';
import { Lock, Mail, User as UserIcon, Phone, Sparkles, ArrowRight } from 'lucide-react';

export const AuthModal = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, login, register, quickLoginAsOwais } = useAuth();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('mohammadowais616@gmail.com');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        const res = await login(email, password);
        if (!res.success) setError(res.message || 'Invalid email or password');
      } else {
        const res = await register(name, email, phone, password);
        if (!res.success) setError(res.message || 'Registration failed');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isAuthModalOpen}
      onClose={() => setIsAuthModalOpen(false)}
      maxWidth="max-w-md"
      title={mode === 'login' ? 'Welcome Back to KashBites' : 'Join the KashBites Family'}
      subtitle={
        mode === 'login'
          ? 'Sign in to access your orders, saved addresses & Chinar points'
          : 'Direct from Kashmir mountain orchards to your doorstep'
      }
    >
      <div className="space-y-4">
        {error && (
          <Alert variant="danger" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <>
              <Input
                label="Full Name *"
                type="text"
                required
                placeholder="e.g. Shoaib Wani"
                value={name}
                onChange={(e) => setName(e.target.value)}
                leftIcon={<UserIcon className="w-4 h-4 text-brand-text-subtle" />}
              />

              <Input
                label="Phone Number"
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                leftIcon={<Phone className="w-4 h-4 text-brand-text-subtle" />}
              />
            </>
          )}

          <Input
            label="Email Address *"
            type="email"
            required
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4 text-brand-text-subtle" />}
          />

          <Input
            label="Password *"
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4 text-brand-text-subtle" />}
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full mt-4"
            disabled={isSubmitting}
            loading={isSubmitting}
            rightIcon={<ArrowRight className="w-4 h-4 text-brand-gold" />}
          >
            {mode === 'login' ? 'Sign In to KashBites' : 'Create My Account'}
          </Button>
        </form>

        <div className="pt-4 border-t border-brand-sand text-center text-xs text-brand-text-muted">
          {mode === 'login' ? (
            <span>
              New to KashBites?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError('');
                }}
                className="text-brand-emerald font-bold hover:underline cursor-pointer"
              >
                Create an account
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
                className="text-brand-emerald font-bold hover:underline cursor-pointer"
              >
                Sign in
              </button>
            </span>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default AuthModal;

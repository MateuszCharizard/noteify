'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, signup, resendVerificationEmail } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted:', { email, password, displayName, isSignUp });
    setIsLoading(true);
    try {
      if (isSignUp) {
        if (!displayName.trim()) {
          toast.error('Display name is required!');
          console.log('Signup failed: Missing display name');
          return;
        }
        console.log('Attempting signup...');
        await signup(email, password, displayName);
        toast.success('Account created! Please check your email to verify your account.');
      } else {
        console.log('Attempting login...');
        await login(email, password);
        toast.success('Logged in!');
      }
    } catch (error) {
      console.error('Auth error:', error.message);
      if (typeof error.message === 'string' && error.message.includes('verify your email')) {
        toast.error(
          <div>
            <p>Please verify your email.</p>
            <button
              onClick={async () => {
                try {
                  await resendVerificationEmail();
                  toast.success('Verification email resent!');
                } catch (err) {
                  toast.error(err.message);
                }
              }}
              className="underline text-blue-500"
            >
              Resend verification email
            </button>
          </div>,
          { duration: 5000 }
        );
      } else {
        toast.error(error.message || 'Authentication error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-500">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2200,
          style: {
            background: '#fff',
            color: '#222',
            borderRadius: '12px',
            fontWeight: 500,
            boxShadow: '0 4px 24px 0 rgba(0,0,0,0.08)',
          },
        }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
        className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-10 w-full max-w-md border border-gray-100 dark:border-gray-800"
      >
        <div className="flex flex-col items-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-extrabold text-blue-600 dark:text-blue-400 tracking-tight mb-2"
          >
            Noteify
          </motion.h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            Welcome! Please {isSignUp ? 'sign up' : 'log in'} to continue.
          </p>
        </div>
        <div className="flex justify-center mb-8">
          <div className="relative w-44 bg-gray-200 dark:bg-gray-800 rounded-full p-1 shadow-inner">
            <motion.div
              className="absolute top-1 left-1 w-20 h-8 bg-blue-500 dark:bg-blue-600 rounded-full shadow"
              animate={{ x: isSignUp ? 80 : 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            />
            <div className="flex justify-between text-sm font-semibold text-gray-700 dark:text-gray-300 relative z-10">
              <button
                onClick={() => setIsSignUp(false)}
                className={`w-20 py-2 transition-colors ${
                  !isSignUp ? 'text-white' : 'text-gray-600 dark:text-gray-300'
                }`}
                aria-pressed={!isSignUp}
              >
                Login
              </button>
              <button
                onClick={() => setIsSignUp(true)}
                className={`w-20 py-2 transition-colors ${
                  isSignUp ? 'text-white' : 'text-gray-600 dark:text-gray-300'
                }`}
                aria-pressed={isSignUp}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <AnimatePresence>
            {isSignUp && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="relative"
              >
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Display Name
                </label>
                <div className="flex items-center relative">
                  <User className="w-5 h-5 text-gray-400 absolute left-3" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full pl-10 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
                    disabled={isLoading}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <div className="flex items-center relative">
              <Mail className="w-5 h-5 text-gray-400 absolute left-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full pl-10 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <div className="flex items-center relative">
              <Lock className="w-5 h-5 text-gray-400 absolute left-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-10 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
                disabled={isLoading}
              />
            </div>
          </div>
          <motion.button
            whileHover={{ scale: isLoading ? 1 : 1.04 }}
            whileTap={{ scale: isLoading ? 1 : 0.97 }}
            type="submit"
            className={`w-full p-3 bg-blue-600 dark:bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all duration-200 ${
              isLoading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-blue-700 dark:hover:bg-blue-600'
            }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <LogIn className="w-5 h-5" />
            )}
            {isSignUp ? 'Sign Up' : 'Login'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
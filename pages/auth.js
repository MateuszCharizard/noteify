import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Stand-in for Next.js's Head component
const Head = ({ children }) => {
  useEffect(() => {
    const childrenArray = React.Children.toArray(children);
    const title = childrenArray.find(c => c.type === 'title')?.props.children;
    if (title) document.title = title;
  }, [children]);
  return null;
};

const supabaseUrl = typeof window === 'undefined' ? process.env.SUPABASE_URL : process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = typeof window === 'undefined' ? process.env.SUPABASE_ANON_KEY : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- SVG ICONS ---
const LogoIcon = (props) => (
  <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M16 3L3 9.75V22.25L16 29L29 22.25V9.75L16 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 17V29" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 9.75L16 17L29 9.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const SpinnerIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin" {...props}>
    <line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
  </svg>
);

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formKey, setFormKey] = useState(0);

  // Set dark mode
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Auth Check
  useEffect(() => {
    console.log('Starting auth check...');
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        console.log('Session:', session);
        if (session) {
          console.log('Redirecting to /notes');
          window.location.href = '/notes';
        } else {
          console.log('No session, showing auth form');
          setInitialLoading(false);
        }
      } catch (error) {
        console.error('Auth check error:', error.message);
        setError('Failed to verify session.');
        setInitialLoading(false);
      }
    };

    const timer = setTimeout(() => {
      console.log('Fallback: Setting initialLoading to false');
      setInitialLoading(false);
    }, 5000);

    checkUser();

    return () => clearTimeout(timer);
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username, full_name: fullName }
          }
        });
        if (error) throw error;
        setIsSignUp(false);
        setEmail("");
        setPassword("");
        setUsername("");
        setFullName("");
        setFormKey(prev => prev + 1);
        return;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.href = '/notes';
      }
    } catch (error) {
      console.error('Auth error:', error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSignUp = () => {
    setIsSignUp(!isSignUp);
    setFormKey(prev => prev + 1);
  };

  if (initialLoading) {
    console.log('Rendering initial loading screen');
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <SpinnerIcon className="w-10 h-10 text-[var(--color-text-primary)] animate-scale-in" style={{ animationDelay: '0.1s' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)] transition-colors duration-500 flex flex-col items-center justify-center relative overflow-hidden font-sans p-4 select-none">
      <Head>
        <title>Noteify - Auth</title>
      </Head>

      <main className="w-full max-w-md mx-auto p-8 z-10 bg-[var(--color-bg-subtle-translucent)] backdrop-blur-md rounded-2xl shadow-lg border border-[var(--color-border)] animate-scale-in-up" style={{ animationDelay: '0.2s' }} key={formKey}>
        <div className="text-center mb-8">
          <LogoIcon className="mx-auto h-12 w-12 text-[var(--color-brand)] animate-scale-in" style={{ animationDelay: '0.3s' }} />
          <h1 className="text-3xl font-bold mt-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            {isSignUp ? 'Create Your Account' : 'Welcome Back'}
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            {isSignUp ? 'Get started with your new workspace.' : 'Sign in to continue to Noteify.'}
          </p>
        </div>
        <form onSubmit={handleAuth} className="space-y-4 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          {isSignUp && (
            <>
              <div className="animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
                <label className="block text-sm font-semibold mb-1 text-[var(--color-text-secondary)]">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-transparent border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
                  required
                />
              </div>
              <div className="animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
                <label className="block text-sm font-semibold mb-1 text-[var(--color-text-secondary)]">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-transparent border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
                  required
                />
              </div>
            </>
          )}
          <div className="animate-fade-in-up" style={{ animationDelay: isSignUp ? '0.9s' : '0.7s' }}>
            <label className="block text-sm font-semibold mb-1 text-[var(--color-text-secondary)]">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-transparent border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
              required
            />
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: isSignUp ? '1.0s' : '0.8s' }}>
            <label className="block text-sm font-semibold mb-1 text-[var(--color-text-secondary)]">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-transparent border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 px-6 py-3 bg-[var(--color-brand)] text-white rounded-full font-semibold transition-colors hover:bg-[var(--color-brand-hover)] disabled:opacity-50 flex items-center justify-center animate-scale-in"
            style={{ animationDelay: isSignUp ? '1.1s' : '0.9s' }}
          >
            {loading ? <SpinnerIcon className="w-5 h-5"/> : (isSignUp ? 'Sign Up' : 'Login')}
          </button>
          {error && (
            <p className="text-red-500 text-center text-sm mt-2 animate-fade-in-up" style={{ animationDelay: isSignUp ? '1.2s' : '1.0s' }}>
              {error}
            </p>
          )}
        </form>
        <p className="mt-6 text-center text-sm animate-fade-in-up" style={{ animationDelay: isSignUp ? '1.3s' : '1.1s' }}>
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          <button 
            onClick={toggleSignUp} 
            className="font-semibold text-[var(--color-brand)] hover:underline ml-1 animate-scale-in"
            style={{ animationDelay: isSignUp ? '1.4s' : '1.2s' }}
          >
            {isSignUp ? 'Login' : 'Sign Up'}
          </button>
        </p>
      </main>

      <style jsx global>{`
        :root {
          --color-background: #0a0a0a;
          --color-bg-subtle: #171717;
          --color-bg-subtle-hover: #262626;
          --color-bg-subtle-translucent: rgba(10, 10, 10, 0.8);
          --color-text-primary: #f5f5f5;
          --color-text-secondary: #a3a3a3;
          --color-border: #4b5563;
          --color-brand: #3b82f6;
          --color-brand-hover: #60a5fa;
          transition: all 0.3s cubic-bezier(.4,0,.2,1);
        }

        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes scale-in-up {
          from { opacity: 0; transform: perspective(1000px) rotateX(10deg) rotateY(10deg) scale3d(0.8, 0.8, 0.8); }
          to { opacity: 1; transform: perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1); }
        }

        .animate-fade-in {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-scale-in {
          animation: scale-in 0.6s cubic-bezier(0.03, 0.98, 0.52, 0.99) forwards;
          opacity: 0;
        }

        .animate-scale-in-up {
          animation: scale-in-up 0.6s cubic-bezier(0.03, 0.98, 0.52, 0.99) forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
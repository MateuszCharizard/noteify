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
const SunIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path>
  </svg>
);
const MoonIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
  </svg>
);
const SpinnerIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin" {...props}>
    <line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
  </svg>
);

export default function AuthPage() {
  const [theme, setTheme] = useState('light');
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  // Removed animated background

  // Theme Management
  useEffect(() => {
    console.log('Initializing theme...');
    if (typeof window === 'undefined') {
      console.log('Skipping theme setup: window undefined');
      return;
    }
    const savedTheme = localStorage.getItem('theme');
    const userPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (userPrefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
    console.log('Theme initialized:', initialTheme);
  }, []);

  useEffect(() => {
    console.log('Applying theme:', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);



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
        // Get the user id from the session (if available)
        let userId = data?.user?.id;
        // If not available, try to sign in to get the user id
        if (!userId) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
          if (signInError) {
            alert('Check your email for the confirmation link!');
            return;
          }
          userId = signInData?.user?.id;
        }
        // Insert into profiles table
        if (userId) {
          await supabase.from('profiles').upsert({
            id: userId,
            username,
            full_name: fullName,
            email
          });
        }
        window.location.href = '/notes';
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

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  if (initialLoading) {
    console.log('Rendering initial loading screen');
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <SpinnerIcon className="w-10 h-10 text-[var(--color-text-primary)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)] transition-colors duration-300 flex flex-col items-center justify-center relative overflow-hidden font-sans p-4">
      <Head>
        <title>Noteify - Auth</title>
      </Head>



      <header className="absolute top-0 right-0 p-6 z-20">
        <button
          onClick={toggleTheme}
          role="switch"
          aria-checked={theme === 'dark'}
          className="relative inline-flex items-center h-8 w-14 rounded-full p-1 transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-brand)] focus:ring-offset-[var(--color-background)] bg-[var(--color-switch-track)]"
        >
          <span className="sr-only">Toggle theme</span>
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
              theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
            }`}
          >
            {theme === 'dark' 
              ? <MoonIcon className="h-4 w-4 text-[var(--color-switch-icon)]" /> 
              : <SunIcon className="h-4 w-4 text-[var(--color-switch-icon)]" />
            }
          </span>
        </button>
      </header>

      <main className="w-full max-w-md mx-auto p-8 z-10 bg-[var(--color-bg-subtle-translucent)] backdrop-blur-md rounded-2xl shadow-lg border border-[var(--color-border)]">
        <div className="text-center mb-8">
          <LogoIcon className="mx-auto h-12 w-12 text-[var(--color-brand)]" />
          <h1 className="text-3xl font-bold mt-4">{isSignUp ? 'Create Your Account' : 'Welcome Back'}</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">
            {isSignUp ? 'Get started with your new workspace.' : 'Sign in to continue to Noteify.'}
          </p>
        </div>
        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <>
              <div>
                <label className="block text-sm font-semibold mb-1 text-[var(--color-text-secondary)]">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-transparent border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
                  required
                />
              </div>
              <div>
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
          <div>
            <label className="block text-sm font-semibold mb-1 text-[var(--color-text-secondary)]">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-transparent border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
              required
            />
          </div>
          <div>
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
            className="w-full mt-2 px-6 py-3 bg-[var(--color-brand)] text-white rounded-full font-semibold transition-colors hover:bg-[var(--color-brand-hover)] disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? <SpinnerIcon className="w-5 h-5"/> : (isSignUp ? 'Sign Up' : 'Login')}
          </button>
          {error && <p className="text-red-500 text-center text-sm mt-2">{error}</p>}
        </form>
        <p className="mt-6 text-center text-sm">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          <button onClick={() => setIsSignUp(!isSignUp)} className="font-semibold text-[var(--color-brand)] hover:underline ml-1">
            {isSignUp ? 'Login' : 'Sign Up'}
          </button>
        </p>
      </main>

      <style jsx global>{`
        :root {
          --color-background: #f9fafb;
          --color-bg-subtle: #f3f4f6;
          --color-bg-subtle-hover: #e5e7eb;
          --color-bg-subtle-translucent: rgba(249, 250, 251, 0.8);
          --color-text-primary: #171717;
          --color-text-secondary: #6b7280;
          --color-border: #d1d5db;
          --color-brand: #3b82f6;
          --color-brand-hover: #2563eb;
          --color-switch-track: #fcd34d;
          --color-switch-icon: #f59e0b;
        }
        .dark {
          --color-background: #0a0a0a;
          --color-bg-subtle: #171717;
          --color-bg-subtle-hover: #262626;
          --color-bg-subtle-translucent: rgba(10, 10, 10, 0.8);
          --color-text-primary: #f5f5f5;
          --color-text-secondary: #a3a3a3;
          --color-border: #4b5563;
          --color-brand: #3b82f6;
          --color-brand-hover: #60a5fa;
          --color-switch-track: #4f46e5;
          --color-switch-icon: #c7d2fe;
        }
      `}</style>
    </div>
  );
}
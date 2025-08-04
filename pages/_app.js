import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import '../styles/globals.css';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function MyApp({ Component, pageProps }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        // Handle redirects based on auth state
        if (event === 'SIGNED_IN') {
          if (router.pathname === '/auth') {
            router.push('/notes');
          }
        } else if (event === 'SIGNED_OUT') {
          if (router.pathname !== '/' && router.pathname !== '/auth' && router.pathname !== '/landing') {
            router.push('/auth');
          }
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, [router]);

  // Show loading screen while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading Noteify...</p>
        </div>
      </div>
    );
  }
  
  return <Component {...pageProps} session={session} />;
}

export default MyApp;
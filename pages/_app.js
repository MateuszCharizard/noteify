import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);

      // Allow access to index and login pages for unauthenticated users
      const publicPaths = ['/', '/login'];
      const isPublicPath = publicPaths.includes(router.pathname);

      if (!user && !isPublicPath) {
        router.push('/login');
      }
    };

    checkUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [router]);

  if (loading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  return <Component {...pageProps} />;
}

export default MyApp;
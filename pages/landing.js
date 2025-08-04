import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import confetti from 'canvas-confetti';
import * as THREE from 'three';
import { createClient } from '@supabase/supabase-js';

// This is a stand-in for Next.js's Head component for this environment.
const Head = ({ children }) => {
  useEffect(() => {
    const childrenArray = React.Children.toArray(children);
    const title = childrenArray.find(c => c.type === 'title')?.props.children;
    if (title) document.title = title;
  }, [children]);
  return null;
};

// This is a stand-in for Next.js's Link component for this environment.
const Link = ({ href, children, ...props }) => <a href={href} {...props}>{children}</a>;

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);


export default function Landing({ session }) {
  const router = useRouter();
  const [theme, setTheme] = useState('light');
  const backgroundRef = useRef(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect non-authenticated users to auth page
    if (!session) {
      router.push('/auth');
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('avatar_url, username, full_name')
          .eq('id', session.user.id)
          .single();
        
        if (error) {
          console.error('Error fetching profile:', error);
        } else {
          setProfile(data);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [session, router]);

  useEffect(() => {
    if (typeof window === 'undefined' || !backgroundRef.current || !session) return;
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Clear previous content
    while (backgroundRef.current.firstChild) {
      backgroundRef.current.removeChild(backgroundRef.current.firstChild);
    }
    backgroundRef.current.appendChild(renderer.domElement);

    const stars = new THREE.Group();
    const starGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const starMaterial = new THREE.MeshBasicMaterial({
      color: theme === 'dark' ? 0xffffff : 0x666666
    });

    for (let i = 0; i < 800; i++) {
      const star = new THREE.Mesh(starGeometry, starMaterial);
      star.position.set(
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 200
      );
      stars.add(star);
    }
    scene.add(stars);
    camera.position.z = 5;
    
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      stars.rotation.y += 0.001;
      starMaterial.color.set(theme === 'dark' ? 0xffffff : 0x666666);
      renderer.render(scene, camera);
    };
    animate();
    
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme, session]);

  const handleLogoClick = () => {
    confetti({
      particleCount: 100,
      spread: 90,
      origin: { y: 0.1 },
      colors: ['#ffffff', '#cccccc', '#999999'],
    });
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Don't render if user is not authenticated (will redirect)
  if (!session) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''} min-h-screen select-none ${theme === 'dark' ? 'bg-black text-gray-100' : 'bg-white text-gray-900'} transition-all duration-500 flex flex-col items-center relative overflow-hidden`}>
      <Head>
        <title>Noteify - Your Smart Note-Taking App</title>
        <meta name="description" content="Noteify: Transform your note-taking with AI-driven features and seamless synchronization." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div id="background" ref={backgroundRef} className="absolute inset-0 z-0"></div>

      <div className="absolute top-4 right-4 flex items-center gap-4 z-20">
        <button 
          onClick={toggleTheme} 
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 transition-all duration-300 hover:bg-gray-300 dark:hover:bg-gray-700 focus:outline-none" 
          aria-label="Toggle theme"
        >
          <svg className="w-5 h-5 text-gray-900 dark:text-gray-100" fill="currentColor" viewBox="0 0 24 24">
            {theme === 'light' ? (
              <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.63-.14 2.39-.41-.56.24-1.15.41-1.77.41-3.31 0-6-2.69-6-6s2.69-6 6-6c.62 0 1.21.17 1.77.41-.76-.27-1.56-.41-2.39-.41zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7z" />
            ) : (
              <path d="M12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm0-10c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm-1 13h2v2h-2zm0-18h2v2h-2zm10 10h2v-2h-2zm-18 0h2v-2H3zm15.66 6.34l1.41 1.41 1.41-1.41-1.41-1.41-1.41 1.41zm-12.72 0l1.41-1.41-1.41-1.41-1.41 1.41 1.41 1.41zm12.72-12.72l1.41-1.41-1.41-1.41-1.41 1.41 1.41 1.41zm-12.72 0l-1.41-1.41-1.41 1.41 1.41 1.41 1.41-1.41z" />
            )}
          </svg>
        </button>
        <Link 
          href="/profile" 
          className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 transition-all duration-300 hover:scale-110 cursor-pointer z-20 overflow-hidden"
        >
          <img 
            src={profile?.avatar_url || `https://placehold.co/40x40/e2e8f0/4a5568?text=${profile?.username?.charAt(0)?.toUpperCase() || 'A'}`} 
            alt="Profile" 
            className="w-full h-full object-cover" 
          />
        </Link>
      </div>

      <header className="fixed top-0 left-0 right-0 flex justify-center pt-4 z-10">
        <img
          src="https://placehold.co/96x96/FFFFFF/000000?text=Logo"
          alt="Noteify Logo"
          className={`w-24 h-24 cursor-pointer animate-bounce-slow hover:scale-110 transition-transform duration-300 ${theme === 'dark' ? 'invert' : ''}`}
          onClick={handleLogoClick}
          title="Click for a surprise!"
        />
      </header>

      <main className="text-center relative z-10 flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-6xl font-bold animate-glow mb-4 transition-colors duration-500">Noteify</h1>
        <p className="text-2xl max-w-lg mx-auto animate-fade-in mb-8 transition-colors duration-500 text-gray-700 dark:text-gray-300">
          Transform your ideas into organized, AI-powered notes.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
          <div className="p-4 animate-fade-in hover:animate-card-hover" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-xl font-semibold animate-glow transition-colors duration-500">Intelligent Organization</h3>
            <p className="transition-colors duration-500 text-gray-600 dark:text-gray-400">Automatically sort and tag your notes with AI.</p>
          </div>
          <div className="p-4 animate-fade-in hover:animate-card-hover" style={{ animationDelay: '0.4s' }}>
            <h3 className="text-xl font-semibold animate-glow transition-colors duration-500">AI Insights</h3>
            <p className="transition-colors duration-500 text-gray-600 dark:text-gray-400">Get smart summaries and suggestions instantly.</p>
          </div>
          <div className="p-4 animate-fade-in hover:animate-card-hover" style={{ animationDelay: '0.6s' }}>
            <h3 className="text-xl font-semibold animate-glow transition-colors duration-500">Cross-Device Sync</h3>
            <p className="transition-colors duration-500 text-gray-600 dark:text-gray-400">Access your notes seamlessly on any device.</p>
          </div>
        </div>
        <a
          href="/notes"
          className="inline-block px-8 py-4 bg-blue-500 text-white rounded-full font-semibold transition-all duration-300 hover:bg-blue-600 hover:scale-105 animate-pulse-subtle animate-fade-in shadow-lg hover:shadow-xl"
          style={{ animationDelay: '0.8s' }}
        >
          Start Taking Notes
        </a>
      </main>
    </div>
  );
}

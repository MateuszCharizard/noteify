import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import confetti from 'canvas-confetti';
import * as THREE from 'three';
import { createClient } from '@supabase/supabase-js';

// Stand-in for Next.js components
const Head = ({ children }) => {
  useEffect(() => {
    const childrenArray = React.Children.toArray(children);
    const title = childrenArray.find(c => c.type === 'title')?.props.children;
    if (title) document.title = title;
  }, [children]);
  return null;
};
const Link = ({ href, children, ...props }) => <a href={href} {...props}>{children}</a>;

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- SVG ICONS ---
const LogoIcon = (props) => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M16 3L3 9.75V22.25L16 29L29 22.25V9.75L16 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 17V29" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 9.75L16 17L29 9.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const SunIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>;
const MoonIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>;
const BrainIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a4.5 4.5 0 0 0-4.5 4.5c0 1.54.83 2.9 2.06 3.73a4.5 4.5 0 0 0-1.8 3.53v.5a2.5 2.5 0 0 0 2.5 2.5h3.5a2.5 2.5 0 0 0 2.5-2.5v-.5a4.5 4.5 0 0 0-1.8-3.53c1.23-.83 2.06-2.19 2.06-3.73A4.5 4.5 0 0 0 12 2Z"/><path d="M12 16.5V22"/><path d="M12 2v.5"/><path d="M16.5 6.5a4.5 4.5 0 0 0-4.26-4.49"/><path d="M7.5 6.5a4.5 4.5 0 0 1 4.26-4.49"/></svg>;
const CloudIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10Z"/></svg>;
const FilesIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><path d="M16 11h.01"/></svg>;

export default function Landing({ session }) {
  const router = useRouter();
  const [theme, setTheme] = useState('light');
  const backgroundRef = useRef(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const userPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (userPrefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!session) {
      router.push('/auth');
      return;
    }

    const fetchProfileForLanding = async () => {
      try {
        setLoading(true);
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('avatar_url, username')
          .eq('id', session.user.id)
          .single();
        if (error) throw error;
        
        setProfile(profileData);

        if (profileData?.avatar_url) {
          setAvatarUrl(profileData.avatar_url);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileForLanding();
  }, [session, router]);

  useEffect(() => {
    if (typeof window === 'undefined' || !backgroundRef.current || !session) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    backgroundRef.current.innerHTML = '';
    backgroundRef.current.appendChild(renderer.domElement);

    const stars = new THREE.Group();
    const starGeometry = new THREE.SphereGeometry(0.05, 16, 16);
    const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true });

    for (let i = 0; i < 500; i++) {
      const star = new THREE.Mesh(starGeometry, starMaterial);
      star.position.set((Math.random() - 0.5) * 150, (Math.random() - 0.5) * 150, (Math.random() - 0.5) * 150);
      stars.add(star);
    }
    scene.add(stars);
    camera.position.z = 50;

    let mouseX = 0;
    const onMouseMove = (e) => { mouseX = e.clientX; };
    document.addEventListener('mousemove', onMouseMove);

    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      stars.rotation.y += 0.0002;
      const targetRotation = (mouseX / window.innerWidth - 0.5) * 0.2;
      camera.rotation.y += (targetRotation - camera.rotation.y) * 0.02;
      starMaterial.opacity = theme === 'dark' ? 0.7 : 0.3;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
    };
  }, [theme, session]);

  const handleLogoClick = () => {
    confetti({
      particleCount: 150, spread: 120, origin: { y: 0.1 },
      colors: theme === 'dark' ? ['#ffffff', '#9ca3af', '#6b7280'] : ['#000000', '#4b5563', '#6b7280'],
    });
  };

  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  if (!session || loading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-text-primary)]"></div>
      </div>
    );
  }

  const features = [
    { icon: <BrainIcon />, title: "AI Insights", description: "Get smart summaries and suggestions from your notes instantly." },
    { icon: <FilesIcon />, title: "Intelligent Organization", description: "Automatically sort and tag your notes with powerful AI." },
    { icon: <CloudIcon />, title: "Cross-Device Sync", description: "Access your notes seamlessly and securely on any device." },
  ];

  const finalAvatarUrl = avatarUrl || `https://avatar.vercel.sh/${profile?.username || 'A'}.png?size=40`;

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)] transition-colors duration-500 flex flex-col items-center relative overflow-hidden select-none">
      <Head>
        <title>Noteify - Your Smart Note-Taking App</title>
      </Head>

      <div id="background" ref={backgroundRef} className="fixed inset-0 z-0"></div>

      <nav className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center z-20">
        <div
          className="flex items-center gap-3 cursor-pointer text-[var(--color-text-primary)]"
          onClick={handleLogoClick}
          title="Click for a surprise!"
        >
          <LogoIcon className="w-8 h-8" />
          <span className="font-semibold text-xl">Noteify</span>
        </div>
        <div className="flex items-center gap-4">
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
              {theme === 'dark' ? (
                <MoonIcon className="h-4 w-4 text-[var(--color-switch-icon)]" />
              ) : (
                <SunIcon className="h-4 w-4 text-[var(--color-switch-icon)]" />
              )}
            </span>
          </button>
          <Link href="/profile" className="w-10 h-10 rounded-full transition-transform hover:scale-110">
            <div className={`w-full h-full rounded-full ${!avatarUrl ? 'bg-[var(--color-bg-subtle)] animate-pulse' : ''}`}>
              <img
                src={finalAvatarUrl}
                alt="Profile"
                className="w-full h-full object-cover rounded-full border-2 border-transparent"
              />
            </div>
          </Link>
        </div>
      </nav>

      <main className="text-center relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-128px)] px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl animate-fade-in-up">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 text-[var(--color-text-primary)]">
            Your second brain,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-sky-400">
              reimagined.
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl max-w-xl mx-auto mb-8 text-[var(--color-text-secondary)]">
            Noteify transforms your ideas into organized, AI-powered notes. Clarity starts here.
          </p>
          <a
            href="/notes"
            className="inline-block px-8 py-3 bg-[var(--color-brand)] text-white rounded-lg font-semibold transition-all duration-300 hover:bg-[var(--color-brand-hover)] hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Enter Your Workspace
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto mt-16 sm:mt-20 md:mt-24">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="p-6 bg-[var(--color-bg-subtle-translucent)] backdrop-blur-sm rounded-xl border border-[var(--color-border)] animate-fade-in-up transition-transform hover:-translate-y-2 feature-card"
              style={{ animationDelay: `${0.2 * (i + 1)}s` }}
            >
              <div className="flex items-center justify-center w-12 h-12 bg-[var(--color-brand-muted)] rounded-lg mb-4 text-[var(--color-brand)]">
                {feature.icon}
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-[var(--color-text-primary)]">{feature.title}</h3>
              <p className="text-sm sm:text-base text-[var(--color-text-secondary)]">{feature.description}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="w-full text-center p-4 sm:p-6 text-sm text-[var(--color-text-secondary)] z-10 mt-auto">
        © {new Date().getFullYear()} Noteify. All rights reserved.
      </footer>

      <style jsx global>{`
        :root {
          --color-background: #ffffff;
          --color-bg-subtle: #f3f4f6;
          --color-bg-subtle-hover: #e5e7eb;
          --color-bg-subtle-translucent: rgba(243, 244, 246, 0.8);
          --color-text-primary: #111827;
          --color-text-secondary: #4b5563;
          --color-border: #e5e7eb;
          --color-brand: #3b82f6;
          --color-brand-hover: #2563eb;
          --color-brand-muted: #dbeafe;
          --color-switch-track: #fcd34d;
          --color-switch-icon: #f59e0b;
          transition: all 0.3s ease;
        }

        .dark {
          --color-background: #000000;
          --color-bg-subtle: #1f2937;
          --color-bg-subtle-hover: #374151;
          --color-bg-subtle-translucent: rgba(31, 41, 55, 0.8);
          --color-text-primary: #f9fafb;
          --color-text-secondary: #9ca3af;
          --color-border: #374151;
          --color-brand: #60a5fa;
          --color-brand-hover: #3b82f6;
          --color-brand-muted: rgba(59, 130, 246, 0.2);
          --color-switch-track: #4f46e5;
          --color-switch-icon: #c7d2fe;
          transition: all 0.3s ease;
        }

        .feature-card {
          min-height: 200px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
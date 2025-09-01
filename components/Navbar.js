import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';

// Dynamically import Avatar with SSR disabled
const Avatar = dynamic(() => import('./Avatar'), { ssr: false });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// SVG Icons for theme toggle
const SunIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4"></circle>
    <path d="M12 2v2"></path>
    <path d="M12 20v2"></path>
    <path d="m4.93 4.93 1.41 1.41"></path>
    <path d="m17.66 17.66 1.41 1.41"></path>
    <path d="M2 12h2"></path>
    <path d="M20 12h2"></path>
    <path d="m6.34 17.66-1.41 1.41"></path>
    <path d="m19.07 4.93-1.41 1.41"></path>
  </svg>
);

const MoonIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
  </svg>
);

export default function Navbar({ theme, toggleTheme }) {
  const router = useRouter();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching profile in Navbar:', error);
        } else {
          setProfile(data);
        }
      }
    };

    fetchProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile();
      } else {
        setProfile(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const avatarSrc = profile?.avatar_url || `https://avatar.vercel.sh/${profile?.username || 'A'}.png?size=128`;
  const navRef = useRef(null);
  const indicatorRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const isTransitioningRef = useRef(false);

  // Map routes to button indices
  const routes = ['/explore', '/notes', '/settings'];

  useEffect(() => {
    // Set initial active index and indicator position without animation
    const currentIndex = routes.indexOf(router.pathname);
    if (currentIndex !== -1 && !isTransitioningRef.current) {
      setActiveIndex(currentIndex);
      const buttons = navRef.current?.querySelectorAll('button');
      const activeButton = buttons?.[currentIndex];
      if (activeButton && indicatorRef.current) {
        // Disable transition for initial setup
        indicatorRef.current.style.transition = 'none';
        const { offsetLeft, offsetWidth } = activeButton;
        indicatorRef.current.style.transform = `translateX(${offsetLeft}px)`;
        indicatorRef.current.style.width = `${offsetWidth}px`;
        // Re-enable transition after setting initial position
        setTimeout(() => {
          indicatorRef.current.style.transition = 'transform 200ms cubic-bezier(0.68, -0.55, 0.265, 1.55), width 200ms ease-out';
        }, 0);
      }
    }

    // Handle resize
    const updateIndicator = () => {
      if (isTransitioningRef.current || !navRef.current || !indicatorRef.current) return;

      const buttons = navRef.current.querySelectorAll('button');
      const activeButton = buttons[activeIndex];
      if (activeButton && indicatorRef.current) {
        const { offsetLeft, offsetWidth } = activeButton;
        indicatorRef.current.style.transform = `translateX(${offsetLeft}px)`;
        indicatorRef.current.style.width = `${offsetWidth}px`;
      }
    };

    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [activeIndex, router.pathname]);

  const handleButtonClick = (index, href) => {
    if (router.pathname !== href && !isTransitioningRef.current) {
      isTransitioningRef.current = true;
      const buttons = navRef.current.querySelectorAll('button');
      const targetButton = buttons[index];
      if (targetButton && indicatorRef.current) {
        const { offsetLeft, offsetWidth } = targetButton;
        indicatorRef.current.style.transform = `translateX(${offsetLeft}px)`;
        indicatorRef.current.style.width = `${offsetWidth}px`;
      }
      setActiveIndex(index); // Update activeIndex immediately
      router.push(href).then(() => {
        isTransitioningRef.current = false;
      });
    }
  };

  return (
  <div className="select-none flex fixed w-full py-10 px-6 z-50">
      <div className="flex w-full items-center justify-between">
        {/* Logo */}
        <div className="opacity-0 invisible md:opacity-100 md:visible transition-all">
          <div className="flex items-center justify-center z-20 gap-2">
          </div>
        </div>

        <div className="absolute top-4 right-4 z-50">
          <Link href="/profile" legacyBehavior>
            <a className="block w-10 h-10 rounded-full overflow-hidden border-2 border-[var(--color-border)] hover:border-[var(--color-brand)] transition-colors">
              <img src={avatarSrc} alt="Profile" className="w-full h-full object-cover" />
            </a>
          </Link>
        </div>

        {/* Navigation Buttons */}
        <div className="md:flex fixed left-0 bottom-0 md:bottom-auto right-0 p-6 items-center justify-center transition-all">
          <div className="flex bg-white/50 dark:bg-[#101010]/50 shadow-lg outline-white/5 outline backdrop-blur items-center justify-center px-3 py-2 rounded-full font-semibold relative">
            <div className="flex items-center justify-between w-full relative gap-3" ref={navRef}>
              <div
                ref={indicatorRef}
                className="absolute rounded-full h-full transition-all duration-200 ease-out"
                style={{ zIndex: 0, background: 'var(--color-brand)' }}
              ></div>
              <Link href="/explore">
                <button
                  className={`relative transition-all duration-200 px-4 py-1 rounded-full outline-none focus-visible:ring-3 
                    md:hover:bg-[var(--color-brand)]/20 md:dark:hover:bg-[var(--color-brand)]/10 focus-visible:ring-[var(--color-brand)]/50
                    dark:text-white ${activeIndex === 0 ? 'text-black' : 'text-black dark:text-white'}`}
                  style={{ zIndex: 1 }}
                  onClick={() => handleButtonClick(0, '/explore')}
                  data-active={activeIndex === 0}
                >
                  Explore
                </button>
              </Link>
              <Link href="/notes">
                <button
                  className={`relative transition-all duration-200 px-4 py-1 rounded-full outline-none focus-visible:ring-3 
                    md:hover:bg-[var(--color-brand)]/20 md:dark:hover:bg-[var(--color-brand)]/10 focus-visible:ring-[var(--color-brand)]/50
                    dark:text-white ${activeIndex === 1 ? 'text-black' : 'text-black dark:text-white'}`}
                  style={{ zIndex: 1 }}
                  onClick={() => handleButtonClick(1, '/notes')}
                  data-active={activeIndex === 1}
                >
                  Notes
                </button>
              </Link>
              <Link href="/settings">
                <button
                  className={`relative transition-all duration-200 px-4 py-1 rounded-full outline-none focus-visible:ring-3 
                    md:hover:bg-[var(--color-brand)]/20 md:dark:hover:bg-[var(--color-brand)]/10 focus-visible:ring-[var(--color-brand)]/50
                    dark:text-white ${activeIndex === 2 ? 'text-black' : 'text-black dark:text-white'}`}
                  style={{ zIndex: 1 }}
                  onClick={() => handleButtonClick(2, '/settings')}
                  data-active={activeIndex === 2}
                >
                  Settings
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <style jsx global>{`
        /* Page transition animation */
        .page-transition-enter {
          opacity: 0;
          transform: translateY(20px);
        }
        .page-transition-enter-active {
          opacity: 1;
          transform: translateY(0);
          transition: opacity 200ms ease-out, transform 200ms ease-out;
        }
        .page-transition-exit {
          opacity: 1;
          transform: translateY(0);
        }
        .page-transition-exit-active {
          opacity: 0;
          transform: translateY(-20px);
          transition: opacity 200ms ease-out, transform 200ms ease-out;
        }

        /* Bounce animation for indicator */
        @keyframes slideBounce {
          0% {
            transform: translateX(var(--start-x));
            width: var(--start-width);
          }
          70% {
            transform: translateX(var(--end-x)) scaleX(1.1);
            width: calc(var(--end-width) * 1.1);
          }
          100% {
            transform: translateX(var(--end-x));
            width: var(--end-width);
          }
        }

        .indicator-slide {
          animation: slideBounce 200ms ease-out forwards;
        }
      `}</style>
    </div>
  );
}
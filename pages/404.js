import Link from 'next/link';
import Head from 'next/head';
import { useEffect, useState } from 'react';

// SVG Logo Icon from the provided theme
const LogoIcon = (props) => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M16 3L3 9.75V22.25L16 29L29 22.25V9.75L16 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 17V29" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 9.75L16 17L29 9.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function Custom404() {
  const [theme, setTheme] = useState('light');
  // Removed animated background

  // Theme handling (simplified from provided code)
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    const selectedTheme = themes.find(t => t.id === savedTheme) || themes[0];
    document.documentElement.setAttribute('data-theme', selectedTheme.id);
    Object.entries(selectedTheme.vars).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);



  // Theme definitions from provided code
  const themes = [
    { id: 'light', name: 'Light', vars: { '--color-background': '#f9fafb', '--color-bg-subtle': '#f3f4f6', '--color-bg-subtle-hover': '#e5e7eb', '--color-text-primary': '#171717', '--color-text-secondary': '#6b7280', '--color-border': '#e5e7eb', '--color-brand': '#3b82f6' } },
    { id: 'dark', name: 'Dark', vars: { '--color-background': '#0a0a0a', '--color-bg-subtle': '#171717', '--color-bg-subtle-hover': '#262626', '--color-text-primary': '#f5f5f5', '--color-text-secondary': '#a3a3a3', '--color-border': '#262626', '--color-brand': '#3b82f6' } },
    { id: 'sunset', name: 'Sunset', vars: { '--color-background': '#0f172a', '--color-bg-subtle': '#1e293b', '--color-bg-subtle-hover': '#334155', '--color-text-primary': '#fff8f1', '--color-text-secondary': '#ffd7b3', '--color-border': '#fb923c', '--color-brand': '#fb923c' } },
    { id: 'forest', name: 'Forest', vars: { '--color-background': '#1a201c', '--color-bg-subtle': '#2d3831', '--color-bg-subtle-hover': '#3a4a40', '--color-text-primary': '#eaffea', '--color-text-secondary': '#b6e7b6', '--color-border': '#66bb6a', '--color-brand': '#66bb6a' } },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)] transition-colors duration-500 flex flex-col items-center relative overflow-hidden select-none">
      <Head>
        <title>404 - Page Not Found | Noteify</title>
        <meta name="description" content="Oops! The page you're looking for doesn't exist. Return to Noteify's home, notes, or explore pages." />
      </Head>



      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex justify-between items-center z-20">
        <div className="flex items-center gap-3 text-[var(--color-text-primary)]">
          <LogoIcon className="w-10 h-10" />
          <span className="font-semibold text-2xl tracking-tight">Noteify</span>
        </div>
      </header>

      <main className="text-center relative z-10 flex flex-col items-center justify-center min-h-[60vh] px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl animate-fade-in-up">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold mb-6 text-[var(--color-text-primary)] leading-tight">
            404 - Page Not Found
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl max-w-xl mx-auto mb-10 text-[var(--color-text-secondary)]">
            Oops! It looks like this page got lost in the notes. Let’s get you back to your Noteify workspace.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 max-w-5xl mx-auto mt-10">
          <Link
            href="/"
            className="px-6 py-3 text-lg font-semibold rounded-full shadow-sm transition-all hover:-translate-y-1"
            style={{ background: 'var(--color-brand)', color: '#fff' }}
          >
            Home
          </Link>
          <Link
            href="/notes"
            className="px-6 py-3 text-lg font-semibold rounded-full shadow-sm transition-all hover:-translate-y-1"
            style={{ background: 'var(--color-brand)', color: '#fff' }}
          >
            Notes
          </Link>
          <Link
            href="/explore"
            className="px-6 py-3 text-lg font-semibold rounded-full shadow-sm transition-all hover:-translate-y-1"
            style={{ background: 'var(--color-brand)', color: '#fff' }}
          >
            Explore
          </Link>
        </div>
      </main>

      <footer className="w-full text-center p-6 text-base text-[var(--color-text-secondary)] z-10 mt-auto">
        © {new Date().getFullYear()} Noteify. All rights reserved.
      </footer>

      <style jsx global>{`
        :root {
          --color-background: #f8fafc;
          --color-bg-subtle: #f3f4f6;
          --color-bg-subtle-hover: #e5e7eb;
          --color-bg-subtle-translucent: rgba(243, 244, 246, 0.85);
          --color-text-primary: #0f172a;
          --color-text-secondary: #64748b;
          --color-border: #e5e7eb;
          --color-brand: #3b82f6;
          --color-brand-hover: #2563eb;
          --color-brand-muted: #dbeafe;
          --color-switch-track: #fcd34d;
          --color-switch-icon: #f59e0b;
          transition: all 0.3s cubic-bezier(.4,0,.2,1);
        }

        .dark {
          --color-background: #0a0a0a;
          --color-bg-subtle: #1e293b;
          --color-bg-subtle-hover: #334155;
          --color-bg-subtle-translucent: rgba(30, 41, 59, 0.85);
          --color-text-primary: #f1f5f9;
          --color-text-secondary: #94a3b8;
          --color-border: #334155;
          --color-brand: #60a5fa;
          --color-brand-hover: #3b82f6;
          --color-brand-muted: rgba(59, 130, 246, 0.2);
          --color-switch-track: #4f46e5;
          --color-switch-icon: #c7d2fe;
          transition: all 0.3s cubic-bezier(.4,0,.2,1);
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
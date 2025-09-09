
import React, { useEffect, useState, useRef } from 'react';
import Navbar from '../components/Navbar';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/router';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// SVG Icons
const LogoIcon = (props) => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M16 3L3 9.75V22.25L16 29L29 22.25V9.75L16 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 17V29" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 9.75L16 17L29 9.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
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

const supabase = typeof window === 'undefined'
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
  : createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Theme definitions
const themes = [
  {
    id: 'light',
    name: 'Light',
    vars: {
      '--color-background': '#f5f5f7',
      '--color-bg-subtle': 'rgba(255, 255, 255, 0.8)',
      '--color-bg-subtle-hover': 'rgba(255, 255, 255, 0.9)',
      '--color-text-primary': '#1d1d1f',
      '--color-text-secondary': '#6e6e73',
      '--color-border': 'rgba(0, 0, 0, 0.1)',
      '--color-brand': '#0071e3',
      '--color-brand-hover': '#005bb5',
      '--color-brand-muted': 'rgba(0, 113, 227, 0.2)',
      '--color-switch-track': '#e5e5ea',
      '--color-switch-icon': '#0071e3',
    },
  },
  {
    id: 'dark',
    name: 'Dark',
    vars: {
      '--color-background': '#1c1c1e',
      '--color-bg-subtle': 'rgba(28, 28, 30, 0.8)',
      '--color-bg-subtle-hover': 'rgba(28, 28, 30, 0.9)',
      '--color-text-primary': '#f5f5f7',
      '--color-text-secondary': '#8e8e93',
      '--color-border': 'rgba(255, 255, 255, 0.2)',
      '--color-brand': '#2997ff',
      '--color-brand-hover': '#0071e3',
      '--color-brand-muted': 'rgba(41, 151, 255, 0.2)',
      '--color-switch-track': '#3c3c3e',
      '--color-switch-icon': '#2997ff',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    vars: {
      '--color-background': '#0f172a',
      '--color-bg-subtle': 'rgba(30, 41, 59, 0.8)',
      '--color-bg-subtle-hover': 'rgba(51, 65, 85, 0.9)',
      '--color-text-primary': '#fff8f1',
      '--color-text-secondary': '#ffd7b3',
      '--color-border': '#fb923c',
      '--color-brand': '#fb923c',
      '--color-brand-hover': '#ea580c',
      '--color-brand-muted': 'rgba(251, 146, 60, 0.2)',
      '--color-switch-track': '#fb923c',
      '--color-switch-icon': '#fff8f1',
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    vars: {
      '--color-background': '#1a201c',
      '--color-bg-subtle': 'rgba(45, 56, 49, 0.8)',
      '--color-bg-subtle-hover': 'rgba(58, 74, 64, 0.9)',
      '--color-text-primary': '#eaffea',
      '--color-text-secondary': '#b6e7b6',
      '--color-border': '#66bb6a',
      '--color-brand': '#66bb6a',
      '--color-brand-hover': '#4caf50',
      '--color-brand-muted': 'rgba(102, 187, 106, 0.2)',
      '--color-switch-track': '#66bb6a',
      '--color-switch-icon': '#eaffea',
    },
  },
];

export default function SharePage() {
  const router = useRouter();
  const { id } = router.query;
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [theme, setTheme] = useState('light');
  const [toastMessage, setToastMessage] = useState('');
  const backgroundRef = useRef(null);

  // Load theme
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      let loadedTheme = 'light';
      if (user) {
        const { data: settings } = await supabase.from('user_settings').select('theme').eq('id', user.id).single();
        if (settings && settings.theme) loadedTheme = settings.theme;
      } else {
        loadedTheme = localStorage.getItem('theme') || 'light';
      }
      setTheme(loadedTheme);
      localStorage.setItem('theme', loadedTheme);
    })();
  }, []);

  useEffect(() => {
    const selectedTheme = themes.find(t => t.id === theme) || themes[0];
    document.documentElement.setAttribute('data-theme', selectedTheme.id);
    Object.entries(selectedTheme.vars).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Fetch note
  useEffect(() => {
    if (!router.isReady) return;
    if (!id) {
      setErrorMessage('No note ID provided.');
      setLoading(false);
      return;
    }
    const fetchNote = async () => {
      try {
        setLoading(true);
        const idValue = Array.isArray(id) ? id[0] : id;
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(idValue)) throw new Error('Invalid note ID format.');
        
        // Fetch note data including username
        const { data: noteData, error: noteError } = await supabase
          .from('shared_notes')
          .select('id, title, content, username')
          .eq('id', idValue)
          .single();
        
        if (noteError) throw noteError;
        if (!noteData) {
          setErrorMessage('Note not found.');
          setLoading(false);
          return;
        }

        setNote({
          ...noteData,
          username: noteData.username || 'Anonymous', // Fallback if username is null
        });
        setToastMessage('Note loaded successfully!');
      } catch (err) {
        setErrorMessage(`Error: ${err.message || 'Failed to load note.'}`);
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [router.isReady, id]);

  // Toast auto-hide
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Error state
  if (errorMessage) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex flex-col items-center justify-center text-[var(--color-text-primary)]">
        <div ref={backgroundRef} className="fixed inset-0 -z-10" />
        <div className="text-center">
          <LogoIcon className="mx-auto mb-4 w-12 h-12 text-[var(--color-brand)] animate-spin" />
          <p className="text-lg font-semibold">{errorMessage}</p>
          <p className="text-sm text-[var(--color-text-secondary)] mt-2">The note may not exist or hasn’t been shared.</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading || !note) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex flex-col items-center justify-center text-[var(--color-text-primary)]">
        <div ref={backgroundRef} className="fixed inset-0 -z-10" />
        <div className="text-center w-full max-w-2xl mx-auto p-4 sm:p-8">
          <LogoIcon className="mx-auto mb-4 w-12 h-12 text-[var(--color-brand)] animate-spin" />
          <div className="skeleton h-8 w-3/4 mx-auto mb-4 rounded-xl"></div>
          <div className="skeleton h-4 w-1/2 mx-auto mb-6 rounded-xl"></div>
          <div className="skeleton h-32 w-full mx-auto rounded-xl"></div>
        </div>
      </div>
    );
  }

  // Main shared note view
  return (
    <div className="min-h-screen bg-[var(--color-background)] transition-colors duration-300 flex flex-col items-center relative overflow-hidden select-none">
      <div ref={backgroundRef} className="fixed inset-0 -z-10" />
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-xs sm:max-w-sm toast">
          <div className="bg-[var(--color-bg-subtle)] text-[var(--color-text-primary)] px-4 sm:px-6 py-2 rounded-full shadow-lg text-sm font-medium backdrop-blur-md border border-[var(--color-border)]">{toastMessage}</div>
        </div>
      )}
      <Navbar
        center={null}
        right={
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            role="switch"
            aria-checked={theme === 'dark'}
            className="relative inline-flex items-center h-8 w-14 rounded-full p-1 transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-brand)] focus:ring-offset-[var(--color-background)] bg-[var(--color-switch-track)] radio"
          >
            <span className="sr-only">Toggle theme</span>
            <span className={`flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`}>
              {theme === 'dark' ? <MoonIcon className="h-4 w-4 text-[var(--color-switch-icon)]" /> : <SunIcon className="h-4 w-4 text-[var(--color-switch-icon)]" />}
            </span>
          </button>
        }
      />
      <div className="h-24"></div> {/* Space to move note down */}
      <main className="w-full max-w-2xl mx-auto p-4 sm:p-8 z-10 bg-[var(--color-bg-subtle)] backdrop-blur-md rounded-2xl shadow-lg border border-[var(--color-border)] mt-16 mb-8 animate-scale-in">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-4 break-words">{note.title}</h1>
        <p className="text-xs sm:text-sm mb-4 sm:mb-6 text-[var(--color-text-secondary)] animate-fade-in-up">
          Shared by {note.username}
        </p>
        <article className="prose prose-sm sm:prose-lg prose-p:my-2 prose-headings:my-3 sm:prose-headings:my-4 prose-li:my-0 max-w-none prose-headings:text-[var(--color-text-primary)] prose-p:text-[var(--color-text-primary)] prose-strong:text-[var(--color-text-primary)] prose-a:text-[var(--color-brand)] prose-blockquote:text-[var(--color-text-secondary)] prose-code:text-[var(--color-text-primary)] prose-li:text-[var(--color-text-primary)]">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{note.content || '*No content available.*'}</ReactMarkdown>
        </article>
        <progress className="w-full h-1 mt-6 rounded-full" indeterminate></progress>
      </main>
      <footer className="w-full text-center p-6 text-sm text-[var(--color-text-secondary)] animate-fade-in-up">
        © {new Date().getFullYear()} Noteify. All rights reserved.
      </footer>
      <style jsx global>{`
        :root {
          --color-background: #f5f5f7;
          --color-bg-subtle: rgba(255, 255, 255, 0.8);
          --color-bg-subtle-hover: rgba(255, 255, 255, 0.9);
          --color-text-primary: #1d1d1f;
          --color-text-secondary: #6e6e73;
          --color-border: rgba(0, 0, 0, 0.1);
          --color-brand: #0071e3;
          --color-brand-hover: #005bb5;
          --color-brand-muted: rgba(0, 113, 227, 0.2);
          --color-switch-track: #e5e5ea;
          --color-switch-icon: #0071e3;
          transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
        }
        .dark {
          --color-background: #1c1c1e;
          --color-bg-subtle: rgba(28, 28, 30, 0.8);
          --color-bg-subtle-hover: rgba(28, 28, 30, 0.9);
          --color-text-primary: #f5f5f7;
          --color-text-secondary: #8e8e93;
          --color-border: rgba(255, 255, 255, 0.2);
          --color-brand: #2997ff;
          --color-brand-hover: #0071e3;
          --color-brand-muted: rgba(41, 151, 255, 0.2);
          --color-switch-track: #3c3c3e;
          --color-switch-icon: #2997ff;
          transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
        }
        @keyframes spin {
          to { transform: rotate(1turn); }
        }
        @keyframes skeleton {
          0% { background-position: 150%; }
          to { background-position: -50%; }
        }
        @keyframes progress {
          50% { background-position-x: -115%; }
        }
        @keyframes radio {
          0%, 40% { filter: brightness(1.05) contrast(1.05); scale: 1.1; }
        }
        @keyframes rating {
          0%, 40% { filter: brightness(1.05) contrast(1.05); scale: 1.1; }
        }
        @keyframes toast {
          0% { opacity: 0; scale: 0.9; }
          to { opacity: 1; scale: 1; }
        }
        @keyframes dropdown {
          0% { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-spin { animation: spin 1s linear infinite; }
        .skeleton {
          background: linear-gradient(90deg, var(--color-bg-subtle) 25%, var(--color-bg-subtle-hover) 50%, var(--color-bg-subtle) 75%);
          background-size: 200% 100%;
          animation: skeleton 1.5s ease-in-out infinite;
        }
        progress:indeterminate {
          background: linear-gradient(90deg, var(--color-brand) 25%, var(--color-brand-muted) 50%, var(--color-brand) 75%);
          background-size: 200% 100%;
          animation: progress 2s ease-in-out infinite;
        }
        .radio { animation: radio .3s ease-out; }
        .rating { animation: rating .3s ease-out; }
        .toast { animation: toast .4s cubic-bezier(0.25, 0.1, 0.25, 1) forwards; }
        .dropdown { animation: dropdown .3s cubic-bezier(0.25, 0.1, 0.25, 1) forwards; }
        .animate-fade-in-up { animation: fade-in-up .6s cubic-bezier(0.25, 0.1, 0.25, 1) forwards; opacity: 0; }
        .animate-scale-in { animation: scale-in .6s cubic-bezier(0.25, 0.1, 0.25, 1) forwards; opacity: 0; }
        .frosted-glass {
          background: var(--color-bg-subtle);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
      `}</style>
    </div>
  );
}

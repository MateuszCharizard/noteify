import React, { useEffect, useState, useRef } from 'react';
import Navbar from '../components/Navbar';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/router';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// --- SVG ICONS (copied from index.js for consistency) ---
const LogoIcon = (props) => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M16 3L3 9.75V22.25L16 29L29 22.25V9.75L16 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 17V29" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 9.75L16 17L29 9.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const SunIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>;
const MoonIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>;

const supabase = typeof window === 'undefined'
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
  : createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Theme definitions (from notes.js)
const themes = [
  { id: 'light', name: 'Light', vars: { '--color-background': '#f9fafb', '--color-bg-subtle': '#f3f4f6', '--color-bg-subtle-hover': '#e5e7eb', '--color-text-primary': '#171717', '--color-text-secondary': '#6b7280', '--color-border': '#e5e7eb', '--color-brand': '#3b82f6' } },
  { id: 'dark', name: 'Dark', vars: { '--color-background': '#0a0a0a', '--color-bg-subtle': '#171717', '--color-bg-subtle-hover': '#262626', '--color-text-primary': '#f5f5f5', '--color-text-secondary': '#a3a3a3', '--color-border': '#262626', '--color-brand': '#3b82f6' } },
  { id: 'sunset', name: 'Sunset', vars: { '--color-background': '#0f172a', '--color-bg-subtle': '#1e293b', '--color-bg-subtle-hover': '#334155', '--color-text-primary': '#fff8f1', '--color-text-secondary': '#ffd7b3', '--color-border': '#fb923c', '--color-brand': '#fb923c' } },
  { id: 'forest', name: 'Forest', vars: { '--color-background': '#1a201c', '--color-bg-subtle': '#2d3831', '--color-bg-subtle-hover': '#3a4a40', '--color-text-primary': '#eaffea', '--color-text-secondary': '#b6e7b6', '--color-border': '#66bb6a', '--color-brand': '#66bb6a' } },
];

export default function SharePage() {
  const router = useRouter();
  const { id } = router.query;
  const [note, setNote] = useState(null);
  // Removed loading state for seamless transitions
  const [errorMessage, setErrorMessage] = useState(null);
  const [theme, setTheme] = useState('light');
  const backgroundRef = useRef(null);
  // Toast message
  const [toastMessage, setToastMessage] = useState('');

  // Load theme from Supabase or localStorage on mount
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      let loadedTheme = 'light';
      if (user) {
        const { data: settings } = await supabase.from('user_settings').select('theme').eq('id', user.id).single();
        if (settings && settings.theme) {
          loadedTheme = settings.theme;
        }
      } else {
        const savedTheme = localStorage.getItem('theme');
        loadedTheme = savedTheme || 'light';
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

  // Fetch note logic
  useEffect(() => {
    if (!router.isReady) return;
    if (!id) {
      setErrorMessage('No note ID provided.');
      return;
    }
    const fetchNote = async () => {
      try {
        const idValue = Array.isArray(id) ? id[0] : id;
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(idValue)) throw new Error('Invalid note ID format.');
        const { data, error } = await supabase
          .from('shared_notes')
          .select('*')
          .eq('id', idValue)
          .limit(1);
        if (error) throw error;
        if (!data || data.length === 0) {
          setErrorMessage('Note not found in shared_notes.');
          return;
        }
        setNote(data[0]);
      } catch (err) {
        setErrorMessage(`Error: ${err.message || 'Failed to load note.'}`);
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
  if (errorMessage || !note) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex flex-col items-center justify-center text-[var(--color-text-primary)]">
        <div ref={backgroundRef} className="fixed inset-0 -z-10" />
        <div className="text-center">
          <LogoIcon className="mx-auto mb-4 w-12 h-12 text-[var(--color-brand)]" />
          <p className="text-lg font-semibold">{errorMessage || 'Note not found.'}</p>
          <p className="text-sm text-[var(--color-text-secondary)] mt-2">The note may not exist or hasn’t been shared.</p>
        </div>
      </div>
    );
  }

  // Main shared note view
  return (
    <div
      className="min-h-screen bg-[var(--color-background)] transition-colors duration-500 flex flex-col items-center relative overflow-hidden select-none"
      style={{ color: ['sunset','forest'].includes(theme) ? '#111' : 'var(--color-text-primary)' }}
    >
      <div ref={backgroundRef} className="fixed inset-0 -z-10" />
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 max-w-xs sm:max-w-sm opacity-100 translate-y-0">
          <div className="bg-neutral-800 text-white px-4 sm:px-6 py-2 rounded-full shadow-lg text-xs sm:text-sm font-medium">{toastMessage}</div>
        </div>
      )}
      <Navbar
        center={null}
        right={
          <>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              role="switch"
              aria-checked={theme === 'dark'}
              className="relative inline-flex items-center h-8 w-14 rounded-full p-1 transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-brand)] focus:ring-offset-[var(--color-background)] bg-[var(--color-switch-track)]"
            >
              <span className="sr-only">Toggle theme</span>
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`}
              >
                {theme === 'dark' ? <MoonIcon className="h-4 w-4 text-[var(--color-switch-icon)]" /> : <SunIcon className="h-4 w-4 text-[var(--color-switch-icon)]" />}
              </span>
            </button>
          </>
        }
      />
      <main className="w-full max-w-2xl mx-auto p-4 sm:p-8 z-10 bg-[var(--color-bg-subtle-translucent)] backdrop-blur-md rounded-2xl shadow-lg border border-[var(--color-border)] mt-6 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-4 break-words" style={{color: ['sunset','forest'].includes(theme) ? '#111' : 'var(--color-text-primary)'}}>{note.title}</h1>
        <p className="text-xs sm:text-sm mb-4 sm:mb-6" style={{color: ['sunset','forest'].includes(theme) ? '#111' : 'var(--color-text-secondary)'}}>Shared by {note.owner_username}</p>
        <article
          className="prose prose-sm sm:prose-lg prose-p:my-2 prose-headings:my-3 sm:prose-headings:my-4 prose-li:my-0 max-w-none prose-headings:text-[var(--color-text-primary)] prose-p:text-[var(--color-text-primary)] prose-strong:text-[var(--color-text-primary)] prose-a:text-[var(--color-brand)] prose-blockquote:text-[var(--color-text-secondary)] prose-code:text-[var(--color-text-primary)] prose-li:text-[var(--color-text-primary)]"
          style={{color: ['sunset','forest'].includes(theme) ? '#111' : 'var(--color-text-primary)'}}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{note.content || '*No content available.*'}</ReactMarkdown>
        </article>
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
      `}</style>
    </div>
  );
}
import React, { useState, useEffect, Suspense, lazy } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import Navbar from '../components/Navbar';
const Avatar = lazy(() => import('../components/Avatar'));

// --- Theme Definitions ---
const themes = [
  {
    id: 'light',
    name: 'Light',
    vars: {
      '--color-background': '#f9fafb',
      '--color-bg-sidebar': 'rgba(249, 250, 251, 0.8)',
      '--color-bg-subtle': '#f3f4f6',
      '--color-bg-subtle-hover': '#e5e7eb',
      '--color-text-primary': '#171717',
      '--color-text-secondary': '#6b7280',
      '--color-border': '#e5e7eb',
      '--color-brand': '#3b82f6',
      '--color-brand-hover': '#2563eb',
    },
  },
  {
    id: 'dark',
    name: 'Dark',
    vars: {
      '--color-background': '#0a0a0a',
      '--color-bg-sidebar': 'rgba(10, 10, 10, 0.8)',
      '--color-bg-subtle': '#171717',
      '--color-bg-subtle-hover': '#262626',
      '--color-text-primary': '#f5f5f5',
      '--color-text-secondary': '#a3a3a3',
      '--color-border': '#262626',
      '--color-brand': '#3b82f6',
      '--color-brand-hover': '#60a5fa',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    vars: {
      '--color-background': '#0f172a',
      '--color-bg-sidebar': 'rgba(15, 23, 42, 0.8)',
      '--color-bg-subtle': '#1e293b',
      '--color-bg-subtle-hover': '#334155',
      '--color-text-primary': '#f1f5f9',
      '--color-text-secondary': '#94a3b8',
      '--color-border': '#334155',
      '--color-brand': '#fb923c',
      '--color-brand-hover': '#f97316',
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    vars: {
      '--color-background': '#1a201c',
      '--color-bg-sidebar': 'rgba(26, 32, 28, 0.8)',
      '--color-bg-subtle': '#2d3831',
      '--color-bg-subtle-hover': '#3a4a40',
      '--color-text-primary': '#e8f5e9',
      '--color-text-secondary': '#a5d6a7',
      '--color-border': '#3a4a40',
      '--color-brand': '#66bb6a',
      '--color-brand-hover': '#4caf50',
    },
  },
];

// --- Theme Application Utility ---
const applyTheme = (theme, themeLoaded) => {
  if (!themeLoaded) return;
  const selectedTheme = themes.find(t => t.id === theme) || themes[1]; // Default to 'dark'
  document.documentElement.setAttribute('data-theme', selectedTheme.id);
  Object.entries(selectedTheme.vars).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });
  localStorage.setItem('theme', theme);
};

// --- Supabase Client ---
const supabaseUrl = typeof window === 'undefined' ? process.env.SUPABASE_URL : process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = typeof window === 'undefined' ? process.env.SUPABASE_ANON_KEY : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- Icon Components ---
const LogOutIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

export default function SettingsPage() {
  const [theme, setTheme] = useState('dark');
  const [themeLoaded, setThemeLoaded] = useState(false);
  const [profile, setProfile] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [activeSettingsTab, setActiveSettingsTab] = useState('personalisation');
  const [accountForm, setAccountForm] = useState({ full_name: '', username: '' });
  const router = useRouter();

  // Load theme and profile data
  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }
      let loadedTheme = 'dark';
      const { data: settings } = await supabase.from('user_settings').select('theme').eq('id', user.id).single();
      if (settings && settings.theme) {
        loadedTheme = settings.theme;
      } else {
        const savedTheme = localStorage.getItem('theme');
        loadedTheme = savedTheme || 'dark';
      }
      setTheme(loadedTheme);
      setThemeLoaded(true);

      const { data: profileData, error: profileError } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (profileError && profileError.code !== 'PGRST116') {
        setToastMessage('Error: Could not load profile.');
        return;
      }
      setProfile(profileData);
      setAccountForm({
        full_name: profileData?.full_name || '',
        username: profileData?.username || ''
      });
    };
    fetchInitialData();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session?.user) router.push('/auth');
    });
    return () => subscription?.unsubscribe();
  }, [router]);

  // Apply theme
  useEffect(() => {
    applyTheme(theme, themeLoaded);
  }, [theme, themeLoaded]);

  // Update account form when profile changes
  useEffect(() => {
    if (profile) {
      setAccountForm({ full_name: profile.full_name || '', username: profile.username || '' });
    }
  }, [profile]);

  // Handle toast message timeout
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Handle theme and profile updates
  const handleSettingsUpdate = async (settings) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (settings.theme) {
      const { error } = await supabase.from('user_settings').upsert({ id: user.id, theme: settings.theme, updated_at: new Date().toISOString() });
      if (error) {
        setToastMessage('Error saving settings.');
        console.error(error);
        return;
      }
      setTheme(settings.theme);
      setProfile(prev => prev ? { ...prev, theme: settings.theme } : prev);
      setToastMessage('Settings saved!');
    }

    const profileFields = {};
    if (settings.avatar_url) {
      setProfile(p => ({ ...p, avatar_url: settings.avatar_url }));
      profileFields.avatar_url = settings.avatar_url;
    }
    if (Object.keys(profileFields).length > 0) {
      const { error } = await supabase.from('profiles').update(profileFields).eq('id', user.id);
      if (error) {
        setToastMessage('Error saving settings.');
        console.error(error);
      } else {
        setToastMessage('Settings saved!');
      }
    }
  };

  const handleAccountUpdate = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const updates = { id: user.id, ...accountForm, updated_at: new Date() };
    const { error } = await supabase.from('profiles').upsert(updates);
    if (error) {
      setToastMessage('Error updating profile.');
    } else {
      setProfile(prev => ({ ...prev, ...accountForm }));
      setToastMessage('Profile updated!');
    }
  };

  return (
    <>
      <Head><title>Noteify - Settings</title></Head>
      <Navbar />
      <div className="min-h-screen font-sans bg-[var(--color-background)] text-[var(--color-text-primary)] transition-colors duration-300 flex flex-col">
        {toastMessage && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 max-w-xs sm:max-w-sm opacity-100 translate-y-0 animate-scale-in" style={{ animationDelay: '0s' }}>
            <div className="bg-neutral-800 text-white px-4 sm:px-6 py-2 rounded-full shadow-lg text-xs sm:text-sm font-medium">{toastMessage}</div>
          </div>
        )}
        <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
          <div className="w-full max-w-xs sm:max-w-2xl bg-[#f8f9fa] dark:bg-[#1e293b]/80 border border-[var(--color-border)] rounded-3xl shadow-2xl text-[var(--color-text-primary)] flex flex-col max-h-[90vh] backdrop-blur-2xl animate-scale-in-up" style={{ boxShadow: '0 8px 32px 0 rgba(31,38,135,0.25)', animationDelay: '0.1s' }}>
            <div className="p-4 border-b border-[var(--color-border)] flex-shrink-0 flex items-center gap-4">
              <div className="flex gap-2 sm:gap-4">
                <button
                  onClick={() => setActiveSettingsTab('personalisation')}
                  className={`px-3 py-1 text-sm font-semibold rounded-full transition-all duration-200 animate-scale-in ${activeSettingsTab === 'personalisation' ? 'bg-[var(--color-brand)] text-white shadow-md' : 'bg-[#f0f1f2] dark:bg-[#334155]/60 text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle-hover)]'}`}
                  style={{ animationDelay: '0.2s' }}
                >
                  Personalisation
                </button>
                <button
                  onClick={() => setActiveSettingsTab('account')}
                  className={`px-3 py-1 text-sm font-semibold rounded-full transition-all duration-200 animate-scale-in ${activeSettingsTab === 'account' ? 'bg-[var(--color-brand)] text-white shadow-md' : 'bg-[#f0f1f2] dark:bg-[#334155]/60 text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle-hover)]'}`}
                  style={{ animationDelay: '0.3s' }}
                >
                  Account
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {activeSettingsTab === 'personalisation' && (
                <div className="space-y-10">
                  <div>
                    <h3 className="font-semibold text-base mb-4 tracking-wide animate-fade-in-up" style={{ animationDelay: '0.4s' }}>Color Theme</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {themes.map((t, i) => (
                        <div key={t.id} className="flex flex-col items-center animate-scale-in" style={{ animationDelay: `${0.5 + 0.1 * (i + 1)}s` }}>
                          <button
                            onClick={() => handleSettingsUpdate({ theme: t.id })}
                            className={`w-14 h-14 sm:w-20 sm:h-20 rounded-2xl border-2 transition-all duration-200 flex items-center justify-center shadow-md ${theme === t.id ? 'border-[var(--color-brand)] scale-105 ring-2 ring-[var(--color-brand)]' : 'border-[var(--color-border)] hover:scale-105'}`}
                            style={{ background: t.vars['--color-background'], color: t.vars['--color-text-primary'] }}
                          >
                            <span className="block w-7 h-7 sm:w-10 sm:h-10 rounded-full" style={{ background: t.vars['--color-brand'] }}></span>
                          </button>
                          <p className="text-center text-xs sm:text-sm mt-2 font-medium opacity-80">{t.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {activeSettingsTab === 'account' && profile && (
                <form onSubmit={handleAccountUpdate} className="space-y-8">
                  <div>
                    <h3 className="font-semibold text-base mb-4 tracking-wide animate-fade-in-up" style={{ animationDelay: '0.4s' }}>Profile Picture</h3>
                    <div className="flex items-center gap-4 animate-scale-in" style={{ animationDelay: '0.5s' }}>
                      <Suspense fallback={<div className="w-16 h-16 rounded-full bg-[var(--color-bg-subtle)] animate-pulse"></div>}>
                        <Avatar url={profile.avatar_url} onUpload={(base64Str) => handleSettingsUpdate({ avatar_url: base64Str })} />
                      </Suspense>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                      <label htmlFor="fullName" className="block text-sm font-medium mb-1">Full Name</label>
                      <input
                        type="text"
                        id="fullName"
                        value={accountForm.full_name}
                        onChange={e => setAccountForm({ ...accountForm, full_name: e.target.value })}
                        className="w-full p-3 text-sm bg-[#f8f9fa] dark:bg-[#1e293b]/70 rounded-xl focus:ring-2 focus:ring-[var(--color-brand)] border border-[var(--color-border)] outline-none shadow-sm"
                      />
                    </div>
                    <div className="animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
                      <label htmlFor="username" className="block text-sm font-medium mb-1">Username</label>
                      <input
                        type="text"
                        id="username"
                        value={accountForm.username}
                        onChange={e => setAccountForm({ ...accountForm, username: e.target.value })}
                        className="w-full p-3 text-sm bg-[#f8f9fa] dark:bg-[#1e293b]/70 rounded-xl focus:ring-2 focus:ring-[var(--color-brand)] border border-[var(--color-border)] outline-none shadow-sm"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <button type="submit" className="px-6 py-2 text-sm font-semibold bg-[var(--color-brand)] text-white rounded-full shadow-md hover:opacity-90 transition-opacity animate-scale-in" style={{ animationDelay: '0.8s' }}>
                      Save Changes
                    </button>
                  </div>
                </form>
              )}
            </div>
            <div className="p-4 border-t border-[var(--color-border)] flex-shrink-0 flex justify-between items-center gap-4">
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  setToastMessage('Logging out...');
                  router.push('/auth');
                }}
                className="flex items-center gap-2 text-sm text-red-500 hover:text-red-400 font-semibold px-4 py-2 rounded-full bg-[#f0f1f2] dark:bg-[#334155]/60 shadow-sm transition-all animate-scale-in"
                style={{ animationDelay: '0.9s' }}
              >
                <LogOutIcon className="w-5 h-5" /> Log Out
              </button>
              <button
                onClick={() => router.push('/notes')}
                className="px-4 py-2 text-sm font-semibold bg-[var(--color-bg-subtle-hover)] text-[var(--color-text-primary)] rounded-full shadow-sm hover:opacity-90 transition-all animate-scale-in"
                style={{ animationDelay: '1.0s' }}
              >
                Back to Notes
              </button>
            </div>
          </div>
        </main>
        <style jsx global>{`
          :root {
            --color-background: #f9fafb;
            --color-bg-sidebar: rgba(249, 250, 251, 0.8);
            --color-bg-subtle: #f3f4f6;
            --color-bg-subtle-hover: #e5e7eb;
            --color-text-primary: #171717;
            --color-text-secondary: #6b7280;
            --color-border: #e5e7eb;
            --color-brand: #3b82f6;
            --color-brand-hover: #2563eb;
            transition: all 0.3s cubic-bezier(.4,0,.2,1);
          }
          .dark {
            --color-background: #0a0a0a;
            --color-bg-sidebar: rgba(10, 10, 10, 0.8);
            --color-bg-subtle: #171717;
            --color-bg-subtle-hover: #262626;
            --color-text-primary: #f5f5f5;
            --color-text-secondary: #a3a3a3;
            --color-border: #262626;
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
          .dark .prose-headings, .dark .prose-p, .dark .prose-strong, .dark .prose-li, .dark .prose-code { color: var(--color-text-primary); }
          .dark .prose-blockquote { color: var(--color-text-secondary); }
          .dark .prose-a { color: var(--color-brand); }
        `}</style>
      </div>
    </>
  );
}
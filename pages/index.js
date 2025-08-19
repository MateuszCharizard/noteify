import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/router';
import confetti from 'canvas-confetti';
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
const CogIcon = (props) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"></path><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path><path d="M12 2v2"></path><path d="M12 22v-2"></path><path d="m17 20.66-1-1.73"></path><path d="m8 4.07 1 1.73"></path><path d="m22 12h-2"></path><path d="m4 12H2"></path><path d="m20.66 7-1.73-1"></path><path d="m4.07 16 1.73 1"></path></svg>);
const BrainIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a4.5 4.5 0 0 0-4.5 4.5c0 1.54.83 2.9 2.06 3.73a4.5 4.5 0 0 0-1.8 3.53v.5a2.5 2.5 0 0 0 2.5 2.5h3.5a2.5 2.5 0 0 0 2.5-2.5v-.5a4.5 4.5 0 0 0-1.8-3.53c1.23-.83 2.06-2.19 2.06-3.73A4.5 4.5 0 0 0 12 2Z"/><path d="M12 16.5V22"/><path d="M12 2v.5"/><path d="M16.5 6.5a4.5 4.5 0 0 0-4.26-4.49"/><path d="M7.5 6.5a4.5 4.5 0 0 1 4.26-4.49"/></svg>;
const CloudIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10Z"/></svg>;
const FilesIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><path d="M16 11h.01"/></svg>;

const supabase = typeof window === 'undefined'
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
  : createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const themes = [
  { id: 'light', name: 'Light', vars: { '--color-background': '#f9fafb', '--color-bg-subtle': '#f3f4f6', '--color-bg-subtle-hover': '#e5e7eb', '--color-text-primary': '#171717', '--color-text-secondary': '#6b7280', '--color-border': '#e5e7eb', '--color-brand': '#3b82f6' } },
  { id: 'dark', name: 'Dark', vars: { '--color-background': '#0a0a0a', '--color-bg-subtle': '#171717', '--color-bg-subtle-hover': '#262626', '--color-text-primary': '#f5f5f5', '--color-text-secondary': '#a3a3a3', '--color-border': '#262626', '--color-brand': '#3b82f6' } },
  { id: 'sunset', name: 'Sunset', vars: { '--color-background': '#0f172a', '--color-bg-subtle': '#1e293b', '--color-bg-subtle-hover': '#334155', '--color-text-primary': '#fff8f1', '--color-text-secondary': '#ffd7b3', '--color-border': '#fb923c', '--color-brand': '#fb923c' } },
  { id: 'forest', name: 'Forest', vars: { '--color-background': '#1a201c', '--color-bg-subtle': '#2d3831', '--color-bg-subtle-hover': '#3a4a40', '--color-text-primary': '#eaffea', '--color-text-secondary': '#b6e7b6', '--color-border': '#66bb6a', '--color-brand': '#66bb6a' } },
];

export default function Landing() {

  const router = useRouter();
  const [theme, setTheme] = useState('light');
  const [themeLoaded, setThemeLoaded] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  // Removed animated background and star settings

  // Unified theme loading logic
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      let loadedTheme = 'light';
      if (user) {
        const { data: settings } = await supabase.from('user_settings').select('theme').eq('id', user.id).single();
        if (settings) {
          loadedTheme = settings.theme || 'light';
        }
      } else {
        const savedTheme = localStorage.getItem('theme');
        loadedTheme = savedTheme || 'light';
      }
      setTheme(loadedTheme);
      setThemeLoaded(true);
      localStorage.setItem('theme', loadedTheme);
    })();
  }, []);

  // Save theme to Supabase and localStorage when changed
  useEffect(() => {
    if (!themeLoaded) return;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase.from('user_settings').upsert({
          id: user.id,
          theme,
          updated_at: new Date().toISOString()
        });
        if (error) {
          alert('Error saving settings: ' + error.message);
        }
      }
      localStorage.setItem('theme', theme);
    })();
  }, [theme, themeLoaded]);

  // Apply theme vars when theme changes
  useEffect(() => {
    if (!themeLoaded) return;
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
  }, [theme, themeLoaded]);





  const handleLogoClick = () => {
    confetti({
      particleCount: 150, spread: 120, origin: { y: 0.1 },
      colors: theme === 'dark' ? ['#ffffff', '#9ca3af', '#6b7280'] : ['#000000', '#4b5563', '#6b7280'],
    });
  };



  const features = [
    { icon: <BrainIcon />, title: "AI Insights", description: "Get smart summaries and suggestions from your notes instantly." },
    { icon: <FilesIcon />, title: "Intelligent Organization", description: "Automatically sort and tag your notes with powerful AI." },
    { icon: <CloudIcon />, title: "Cross-Device Sync", description: "Access your notes seamlessly and securely on any device." },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)] transition-colors duration-500 flex flex-col items-center relative overflow-hidden select-none">
      <Head>
        <title>Noteify - Your Smart Note-Taking App</title>
      </Head>



      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex justify-between items-center z-20">
        <div
          className="flex items-center gap-3 cursor-pointer text-[var(--color-text-primary)]"
          onClick={handleLogoClick}
          title="Click for a surprise!"
        >
          <LogoIcon className="w-10 h-10" />
          <span className="font-semibold text-2xl tracking-tight">Noteify</span>
        </div>
        <button
          onClick={() => setShowSettingsModal(true)}
          aria-label="Open settings"
          className="p-2 rounded-full text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle-hover)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
        >
          <CogIcon className="w-7 h-7" />
        </button>
      </header>
      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-[6px]" onClick={() => setShowSettingsModal(false)}></div>
          <div
            role="dialog"
            className={`relative z-10 border border-[var(--color-border)] rounded-3xl w-full max-w-xs sm:max-w-xl shadow-2xl flex flex-col max-h-[90vh] backdrop-blur-2xl ${theme === 'dark' ? 'bg-[#1e293b]/90' : 'bg-white/95'}`}
            style={{boxShadow:'0 8px 32px 0 rgba(31,38,135,0.25)', color: theme === 'dark' ? '#fff' : '#111'}}
          >
            <div className="p-4 border-b border-[var(--color-border)] flex-shrink-0 flex items-center gap-4">
              <span className="text-lg font-semibold">Personalisation</span>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-10">
                <div>
                  <h3 className="font-semibold text-base mb-4 tracking-wide">Color Theme</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {themes.map(t => {
                      // Use a darker preview for sunset/forest theme cards in the settings modal
                      const isDarkPreview = ['sunset','forest'].includes(t.id);
                      return (
                        <div key={t.id} className="flex flex-col items-center">
                          <button
                            onClick={() => setTheme(t.id)}
                            className={`w-14 h-14 sm:w-20 sm:h-20 rounded-2xl border-2 transition-all duration-200 flex items-center justify-center shadow-md ${theme === t.id ? 'border-[var(--color-brand)] scale-105 ring-2 ring-[var(--color-brand)]' : 'border-[var(--color-border)] hover:scale-105'}`}
                            style={{
                              background: isDarkPreview ? 'rgba(30,41,59,0.85)' : t.vars['--color-background'],
                              color: theme === 'dark' ? '#fff' : '#111'
                            }}
                          >
                            <span className="block w-7 h-7 sm:w-10 sm:h-10 rounded-full" style={{ background: t.vars['--color-brand'] }}></span>
                          </button>
                          <p className="text-center text-xs sm:text-sm mt-2 font-medium opacity-80" style={{color: theme === 'dark' ? '#fff' : '#111'}}>{t.name}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
            <div className="p-4 border-t border-[var(--color-border)] flex-shrink-0 flex justify-end items-center gap-4">
              <button onClick={() => setShowSettingsModal(false)} className="px-4 py-2 text-sm font-semibold bg-[var(--color-bg-subtle-hover)] text-[var(--color-text-primary)] rounded-full shadow-sm hover:opacity-90 transition-all">Close</button>
            </div>
          </div>
        </div>
      )}

      <main className="text-center relative z-10 flex flex-col items-center justify-center min-h-[60vh] px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl animate-fade-in-up">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold mb-6 text-[var(--color-text-primary)] leading-tight">
            Your second brain for the AI era
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl max-w-xl mx-auto mb-10 text-[var(--color-text-secondary)]">
            Effortlessly capture, organize, and rediscover your ideas. Noteify brings clarity and creativity together with a beautiful, AI-powered workspace.
          </p>
          <div className="flex justify-center mt-10">
            <Link href="/auth">
              <button
                className="px-8 py-4 rounded-full bg-[var(--color-brand)] text-white text-xl font-bold shadow-lg hover:bg-[var(--color-brand-hover)] transition-colors focus:outline-none focus:ring-4 focus:ring-[var(--color-brand)] focus:ring-opacity-50"
                style={{ minWidth: '200px' }}
              >
                Start Now
              </button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-16 sm:mt-20 md:mt-24">
          {features.map((feature, i) => {
            const isDark = ['sunset','forest','dark'].includes(theme);
            const textPrimary = isDark ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-primary)]';
            const textSecondary = isDark ? 'text-[var(--color-text-secondary)]' : 'text-[var(--color-text-secondary)]';
            return (
              <div
                key={feature.title}
                className={`p-8 rounded-2xl border border-[var(--color-border)] animate-fade-in-up transition-transform hover:-translate-y-2 feature-card shadow-lg ${textPrimary}`}
                style={{
                  animationDelay: `${0.2 * (i + 1)}s`,
                  background: isDark
                    ? 'rgba(30, 41, 59, 0.85)'
                    : 'rgba(243, 244, 246, 0.7)'
                }}
              >
                <div className="flex items-center justify-center w-14 h-14 bg-[var(--color-brand-muted)] rounded-lg mb-5 text-[var(--color-brand)]">
                  {feature.icon}
                </div>
                <h3 className={`text-xl font-semibold mb-2 ${textPrimary}`}>{feature.title}</h3>
                <p className={`text-base ${textSecondary}`}>{feature.description}</p>
              </div>
            );
          })}
        </div>
          <div className="max-w-4xl mx-auto mt-20 mb-8 animate-fade-in-up">
            <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
              <div
                className={`rounded-2xl shadow-lg border border-[var(--color-border)] p-6 flex-1 min-w-[260px] text-[var(--color-text-primary)]`}
                style={{
                  background: ['sunset','forest','dark'].includes(theme)
                    ? 'rgba(30, 41, 59, 0.85)'
                    : 'rgba(255,255,255,0.8)'
                }}
              >
                <p className={`text-lg font-medium mb-3 text-[var(--color-text-primary)]`}>“Noteify is the first note app that feels truly smart and delightful to use.”</p>
                <div className="flex items-center gap-3">
                  <img src="/file.svg" alt="User" className="w-10 h-10 rounded-full bg-[var(--color-bg-subtle)]" />
                  <span className={`font-semibold text-[var(--color-text-primary)]`}>Alex P.</span>
                  <span className={`text-xs text-[var(--color-text-secondary)]`}>Product Designer</span>
                </div>
              </div>
              <div
                className={`rounded-2xl shadow-lg border border-[var(--color-border)] p-6 flex-1 min-w-[260px] text-[var(--color-text-primary)]`}
                style={{
                  background: ['sunset','forest','dark'].includes(theme)
                    ? 'rgba(30, 41, 59, 0.85)'
                    : 'rgba(255,255,255,0.8)'
                }}
              >
                <p className={`text-lg font-medium mb-3 text-[var(--color-text-primary)]`}>“The AI features are a game changer. I never lose track of my ideas now.”</p>
                <div className="flex items-center gap-3">
                  <img src="/globe.svg" alt="User" className="w-10 h-10 rounded-full bg-[var(--color-bg-subtle)]" />
                  <span className={`font-semibold text-[var(--color-text-primary)]`}>Jamie L.</span>
                  <span className={`text-xs text-[var(--color-text-secondary)]`}>Startup Founder</span>
                </div>
              </div>
            </div>
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

        .feature-card {
          min-height: 220px;
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
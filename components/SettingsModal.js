
import React, { useState, useEffect } from 'react';
import Avatar from './Avatar';
import { createClient } from '@supabase/supabase-js';

const supabase = typeof window === 'undefined'
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
  : createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const themes = [
  { id: 'light', name: 'Light', vars: { '--color-background': '#f9fafb', '--color-bg-sidebar': 'rgba(249, 250, 251, 0.8)', '--color-bg-subtle': '#f3f4f6', '--color-bg-subtle-hover': '#e5e7eb', '--color-text-primary': '#171717', '--color-text-secondary': '#6b7280', '--color-border': '#e5e7eb', '--color-brand': '#3b82f6' } },
  { id: 'dark', name: 'Dark', vars: { '--color-background': '#0a0a0a', '--color-bg-sidebar': 'rgba(10, 10, 10, 0.8)', '--color-bg-subtle': '#171717', '--color-bg-subtle-hover': '#262626', '--color-text-primary': '#f5f5f5', '--color-text-secondary': '#a3a3a3', '--color-border': '#262626', '--color-brand': '#3b82f6' } },
  { id: 'sunset', name: 'Sunset', vars: { '--color-background': '#0f172a', '--color-bg-sidebar': 'rgba(15, 23, 42, 0.8)', '--color-bg-subtle': '#1e293b', '--color-bg-subtle-hover': '#334155', '--color-text-primary': '#f1f5f9', '--color-text-secondary': '#94a3b8', '--color-border': '#334155', '--color-brand': '#fb923c' } },
  { id: 'forest', name: 'Forest', vars: { '--color-background': '#1a201c', '--color-bg-sidebar': 'rgba(26, 32, 28, 0.8)', '--color-bg-subtle': '#2d3831', '--color-bg-subtle-hover': '#3a4a40', '--color-text-primary': '#e8f5e9', '--color-text-secondary': '#a5d6a7', '--color-border': '#3a4a40', '--color-brand': '#66bb6a' } },
];

export default function SettingsModal({ open, onClose }) {
  const [profile, setProfile] = useState(null);
  const [theme, setTheme] = useState('dark');
  useEffect(() => {
    const updateTheme = () => {
      const t = document.documentElement.getAttribute('data-theme') || 'dark';
      setTheme(t);
    };
    updateTheme();
    window.addEventListener('storage', updateTheme);
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => {
      window.removeEventListener('storage', updateTheme);
      observer.disconnect();
    };
  }, []);
  const [accountForm, setAccountForm] = useState({ full_name: '', username: '' });
  const [activeTab, setActiveTab] = useState('personalisation');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!open) return;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(profileData);
      setTheme(profileData?.theme || 'dark');
      setAccountForm({
        full_name: profileData?.full_name || '',
        username: profileData?.username || ''
      });
    })();
  }, [open]);

  const handleSavePersonalisation = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const updates = {
      id: user.id,
      theme,
      updated_at: new Date()
    };
    const { error } = await supabase.from('profiles').upsert(updates);
    if (error) {
      setToast('Error saving personalisation.');
    } else {
      setToast('Personalisation saved!');
    }
    setSaving(false);
    setTimeout(() => setToast(''), 2000);
  };

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const updates = { id: user.id, ...accountForm, updated_at: new Date() };
    const { error } = await supabase.from('profiles').upsert(updates);
    if (error) {
      setToast('Error saving account.');
    } else {
      setToast('Account saved!');
    }
    setSaving(false);
    setTimeout(() => setToast(''), 2000);
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[6px]" onClick={onClose}></div>
      <div role="dialog" className="relative z-10 bg-white/70 dark:bg-[#1e293b]/80 border border-[var(--color-border)] rounded-3xl w-full max-w-xs sm:max-w-2xl shadow-2xl text-[var(--color-text-primary)] flex flex-col max-h-[90vh] backdrop-blur-2xl" style={{boxShadow:'0 8px 32px 0 rgba(31,38,135,0.25)'}}>
        <div className="p-4 border-b border-[var(--color-border)] flex-shrink-0 flex items-center gap-4">
          <button onClick={() => setActiveTab('personalisation')} className={`px-3 py-1 text-sm font-semibold rounded-full transition-all duration-200 ${activeTab === 'personalisation' ? 'bg-[var(--color-brand)] text-white shadow-md' : 'bg-white/60 dark:bg-[#334155]/60 text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle-hover)]'}`}>Personalisation</button>
          <button onClick={() => setActiveTab('account')} className={`px-3 py-1 text-sm font-semibold rounded-full transition-all duration-200 ${activeTab === 'account' ? 'bg-[var(--color-brand)] text-white shadow-md' : 'bg-white/60 dark:bg-[#334155]/60 text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle-hover)]'}`}>Account</button>
          <button onClick={onClose} className="ml-auto px-4 py-2 text-sm font-semibold bg-[var(--color-bg-subtle-hover)] text-[var(--color-text-primary)] rounded-full shadow-sm hover:opacity-90 transition-all">Close</button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'personalisation' && (
            <div className="space-y-10">
              <div>
                <h3 className="font-semibold text-base mb-4 tracking-wide">Color Theme</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {themes.map(t => (
                    <div key={t.id} className="flex flex-col items-center">
                      <button onClick={() => setTheme(t.id)} className={`w-14 h-14 sm:w-20 sm:h-20 rounded-2xl border-2 transition-all duration-200 flex items-center justify-center shadow-md ${theme === t.id ? 'border-[var(--color-brand)] scale-105 ring-2 ring-[var(--color-brand)]' : 'border-[var(--color-border)] hover:scale-105'}`} style={{ background: t.vars['--color-background'], color: t.vars['--color-text-primary'] }}>
                        <span className="block w-7 h-7 sm:w-10 sm:h-10 rounded-full" style={{ background: t.vars['--color-brand'] }}></span>
                      </button>
                      <p className="text-center text-xs sm:text-sm mt-2 font-medium opacity-80">{t.name}</p>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={handleSavePersonalisation} disabled={saving} className="w-full py-2 rounded bg-[var(--color-brand)] text-white font-semibold shadow-sm hover:opacity-90 transition-all">{saving ? 'Saving...' : 'Save Personalisation'}</button>
            </div>
          )}
          {activeTab === 'account' && profile && (
            <form onSubmit={handleSaveAccount} className="space-y-8">
              <div>
                <h3 className="font-semibold text-base mb-4 tracking-wide">Profile Picture</h3>
                <Avatar url={profile.avatar_url} onUpload={() => {}} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium mb-1">Full Name</label>
                  <input type="text" id="fullName" value={accountForm.full_name} onChange={e => setAccountForm({...accountForm, full_name: e.target.value})} className="w-full p-3 text-sm bg-white/70 dark:bg-[#1e293b]/70 rounded-xl focus:ring-2 focus:ring-[var(--color-brand)] border border-[var(--color-border)] outline-none shadow-sm" />
                </div>
                <div>
                  <label htmlFor="username" className="block text-sm font-medium mb-1">Username</label>
                  <input type="text" id="username" value={accountForm.username} onChange={e => setAccountForm({...accountForm, username: e.target.value})} className="w-full p-3 text-sm bg-white/70 dark:bg-[#1e293b]/70 rounded-xl focus:ring-2 focus:ring-[var(--color-brand)] border border-[var(--color-border)] outline-none shadow-sm" />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button type="submit" className="px-6 py-2 text-sm font-semibold bg-[var(--color-brand)] text-white rounded-full shadow-md hover:opacity-90 transition-opacity">Save Changes</button>
              </div>
            </form>
          )}
          {toast && <div className="text-center text-sm text-[var(--color-brand)] mt-2">{toast}</div>}
        </div>
      </div>
    </div>
  );
}

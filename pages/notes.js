import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Head from 'next/head';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Avatar from '../components/Avatar';

// Supabase Client
const supabaseUrl = typeof window === 'undefined' ? process.env.SUPABASE_URL : process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = typeof window === 'undefined' ? process.env.SUPABASE_ANON_KEY : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- Icon Components ---
const SunIcon = ({ className }) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>);
const MoonIcon = ({ className }) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>);
const PlusIcon = ({ className }) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>);
const TrashIcon = ({ className }) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>);
const SearchIcon = ({ className }) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>);
const FileTextIcon = (props) => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M16 3L3 9.75V22.25L16 29L29 22.25V9.75L16 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 17V29" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 9.75L16 17L29 9.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const MenuIcon = ({ className }) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>);
const CloseIcon = ({ className }) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);
const CogIcon = ({ className }) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"></path><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path><path d="M12 2v2"></path><path d="M12 22v-2"></path><path d="m17 20.66-1-1.73"></path><path d="m8 4.07 1 1.73"></path><path d="m22 12h-2"></path><path d="m4 12H2"></path><path d="m20.66 7-1.73-1"></path><path d="m4.07 16 1.73 1"></path></svg>);
const LogOutIcon = ({ className }) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>);
const ExploreIcon = ({ className }) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>);

// --- Theme Definitions ---
const themes = [
  { id: 'light', name: 'Light', vars: { '--color-background': '#f9fafb', '--color-bg-sidebar': 'rgba(249, 250, 251, 0.8)', '--color-bg-subtle': '#f3f4f6', '--color-bg-subtle-hover': '#e5e7eb', '--color-text-primary': '#171717', '--color-text-secondary': '#6b7280', '--color-border': '#e5e7eb', '--color-brand': '#3b82f6' } },
  { id: 'dark', name: 'Dark', vars: { '--color-background': '#0a0a0a', '--color-bg-sidebar': 'rgba(10, 10, 10, 0.8)', '--color-bg-subtle': '#171717', '--color-bg-subtle-hover': '#262626', '--color-text-primary': '#f5f5f5', '--color-text-secondary': '#a3a3a3', '--color-border': '#262626', '--color-brand': '#3b82f6' } },
  { id: 'sunset', name: 'Sunset', vars: { '--color-background': '#0f172a', '--color-bg-sidebar': 'rgba(15, 23, 42, 0.8)', '--color-bg-subtle': '#1e293b', '--color-bg-subtle-hover': '#334155', '--color-text-primary': '#f1f5f9', '--color-text-secondary': '#94a3b8', '--color-border': '#334155', '--color-brand': '#fb923c' } },
  { id: 'forest', name: 'Forest', vars: { '--color-background': '#1a201c', '--color-bg-sidebar': 'rgba(26, 32, 28, 0.8)', '--color-bg-subtle': '#2d3831', '--color-bg-subtle-hover': '#3a4a40', '--color-text-primary': '#e8f5e9', '--color-text-secondary': '#a5d6a7', '--color-border': '#3a4a40', '--color-brand': '#66bb6a' } },
];

export default function NotesPage() {
  // --- State Definitions ---
  const [theme, setTheme] = useState('dark');
  // Track if theme is loaded from Supabase
  const [themeLoaded, setThemeLoaded] = useState(false);
  // Removed animated background and star settings
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState('personalisation');
  const [accountForm, setAccountForm] = useState({ full_name: '', username: '' });
  const [isPublic, setIsPublic] = useState(false);

  // --- Refs ---
  const debounceTimeout = React.useRef(null);

  // --- Effects ---
  // Load theme from Supabase or localStorage on mount
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      let loadedTheme = 'dark';
      if (user) {
        // Always load from user_settings if available
        const { data: settings } = await supabase.from('user_settings').select('theme').eq('id', user.id).single();
        if (settings && settings.theme) {
          loadedTheme = settings.theme;
        }
      } else {
        // Only use localStorage if not logged in
        const savedTheme = localStorage.getItem('theme');
        loadedTheme = savedTheme || 'dark';
      }
      setTheme(loadedTheme);
      setThemeLoaded(true);
    })();
  }, []);

  // Apply theme vars when theme changes
  useEffect(() => {
    if (!themeLoaded) return;
    const selectedTheme = themes.find(t => t.id === theme) || themes[1];
    document.documentElement.setAttribute('data-theme', selectedTheme.id);
    Object.entries(selectedTheme.vars).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
    localStorage.setItem('theme', theme);
  }, [theme, themeLoaded]);



  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) await fetchData(user);
      else window.location.href = '/auth';
    };
    fetchInitialData();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session?.user) window.location.href = '/auth';
    });
    return () => subscription?.unsubscribe();
  }, []);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  useEffect(() => {
    if (showSettingsModal && profile) {
      setAccountForm({ full_name: profile.full_name || '', username: profile.username || '' });
    }
  }, [showSettingsModal, profile]);

  useEffect(() => {
    // When activeNote changes, check if it's public
    const checkPublic = async () => {
      setIsPublic(false);
      if (!activeNote || !activeNote.id) return;
      const { data, error } = await supabase
        .from('shared_notes')
        .select('is_public')
        .eq('note_id', activeNote.id)
        .single();
      if (data && data.is_public) setIsPublic(true);
    };
    checkPublic();
  }, [activeNote]);

  // --- Data & Handler Functions ---
  const fetchData = async (user) => {
    setLoading(true);
    try {
      const { data: notesData, error: notesError } = await supabase.from('notes').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (notesError) throw notesError;
      const { data: profileData, error: profileError } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (profileError && profileError.code !== 'PGRST116') throw profileError;
      setNotes(notesData || []);
      if (notesData?.length > 0) setActiveNote(notesData[0]);
      setProfile(profileData);
      // Only set theme from profile if it exists and is valid
      if (profileData?.theme && themes.some(t => t.id === profileData.theme)) {
        setTheme(profileData.theme);
      }
      setAnimatedBg(profileData?.animated_bg ?? true);
      setStarCount(profileData?.star_count || 500);
      setStarSpeed(profileData?.star_speed || 0.0002);
      setAccountForm({
        full_name: profileData?.full_name || '',
        username: profileData?.username || ''
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      setToastMessage('Error: Could not load your data.');
    } finally {
      setLoading(false);
    }
  };

  // --- Note Creation Modal ---
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNoteForm, setNewNoteForm] = useState({ title: '', subject: '', tags: '', content: '' });

  const handleCreateNote = () => {
    setNewNoteForm({ title: '', subject: '', tags: '', content: '' });
    setShowCreateModal(true);
  };

  const handleCreateNoteSubmit = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const newNote = {
      title: newNoteForm.title || 'Untitled',
      content: newNoteForm.content || '',
      user_id: user.id,
      subject: newNoteForm.subject || 'General',
      tags: newNoteForm.tags.split(',').map(t => t.trim()).filter(Boolean),
    };
    try {
      const { data, error } = await supabase.from('notes').insert(newNote).select().single();
      if (error) throw error;
      setNotes((prev) => [data, ...prev]);
      setActiveNote(data);
      setToastMessage('Note created!');
      setSidebarOpen(false);
      setShowCreateModal(false);
    } catch (error) {
      setToastMessage('Error: Could not create note.');
    }
  };

  const handleUpdateNote = (field, value) => {
    if (!activeNote) return;
    setIsSaving(true);
    let updatedValue = value;
    if (field === 'tags' && typeof value === 'string') {
      updatedValue = value.split(',').map(tag => tag.trim()).filter(Boolean);
    }
    const updatedNote = { ...activeNote, [field]: updatedValue };
    setActiveNote(updatedNote);
    setNotes((prev) => prev.map((n) => (n.id === activeNote.id ? updatedNote : n)));
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(async () => {
      const { error } = await supabase.from('notes').update({ [field]: updatedValue }).eq('id', activeNote.id);
      if (error) {
        console.error("Update error:", error);
        setToastMessage('Error: Failed to save.');
      }
      setIsSaving(false);
    }, 800);
  };

  const handleDeleteNote = async (noteId) => {
    if (!noteId) return;
    try {
      await supabase.from('notes').delete().eq('id', noteId);
      const remainingNotes = notes.filter((note) => note.id !== noteId);
      setNotes(remainingNotes);
      if (activeNote?.id === noteId) {
        setActiveNote(remainingNotes[0] || null);
      }
      setToastMessage('Note deleted.');
    } catch (error) {
      console.error("Delete error:", error);
      setToastMessage('Error: Could not delete note.');
    } finally {
      setShowDeleteModal(false);
      setNoteToDelete(null);
    }
  };

  const handleSettingsUpdate = async (settings) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Handle theme update
    if (settings.theme) {
      // Save to DB first
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

    // Handle animated background settings
    if (settings.animated_bg !== undefined) setAnimatedBg(settings.animated_bg);
    if (settings.star_count) setStarCount(settings.star_count);
    if (settings.star_speed) setStarSpeed(settings.star_speed);

    // Handle avatar update (and other profile fields)
    const profileFields = {};
    if (settings.avatar_url) {
      setProfile(p => ({...p, avatar_url: settings.avatar_url}));
      profileFields.avatar_url = settings.avatar_url;
    }
    // Add more profile fields here if needed

    // Only update profiles if there are valid fields
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

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const avatarSrc = profile?.avatar_url || `https://avatar.vercel.sh/${profile?.username || 'A'}.png?size=32`;

  const filteredNotes = notes.filter(note =>
    (note.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (note.content?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (note.subject?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (note.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[var(--color-bg-subtle)]">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-[var(--color-text-primary)]"></div>
      </div>
    );
  }

  return (
    <div className="h-screen font-sans bg-[var(--color-background)] text-[var(--color-text-primary)] transition-colors duration-300 flex overflow-hidden">
      <Head><title>Noteify - Your Notes</title></Head>



      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 max-w-xs sm:max-w-sm opacity-100 translate-y-0">
          <div className="bg-neutral-800 text-white px-4 sm:px-6 py-2 rounded-full shadow-lg text-xs sm:text-sm font-medium">{toastMessage}</div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)}></div>
          <div role="dialog" className="relative z-10 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg p-4 sm:p-6 w-full max-w-xs sm:max-w-sm shadow-xl">
            <h3 className="text-base sm:text-lg font-semibold text-[var(--color-text-primary)]">Delete Note</h3>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-2">Are you sure? This action cannot be undone.</p>
            <div className="flex justify-end gap-3 sm:gap-4 mt-4 sm:mt-6">
              <button onClick={() => setShowDeleteModal(false)} className="px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-semibold bg-[var(--color-bg-subtle)] text-[var(--color-text-primary)] rounded-md hover:bg-[var(--color-bg-subtle-hover)] transition-colors">Cancel</button>
              <button onClick={() => handleDeleteNote(noteToDelete)} className="px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-semibold bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-[6px]" onClick={() => setShowSettingsModal(false)}></div>
          <div role="dialog" className="relative z-10 bg-white/70 dark:bg-[#1e293b]/80 border border-[var(--color-border)] rounded-3xl w-full max-w-xs sm:max-w-2xl shadow-2xl text-[var(--color-text-primary)] flex flex-col max-h-[90vh] backdrop-blur-2xl" style={{boxShadow:'0 8px 32px 0 rgba(31,38,135,0.25)'}}>
            <div className="p-4 border-b border-[var(--color-border)] flex-shrink-0 flex items-center gap-4">
              <div className="flex gap-2 sm:gap-4">
                <button onClick={() => setActiveSettingsTab('personalisation')} className={`px-3 py-1 text-sm font-semibold rounded-full transition-all duration-200 ${activeSettingsTab === 'personalisation' ? 'bg-[var(--color-brand)] text-white shadow-md' : 'bg-white/60 dark:bg-[#334155]/60 text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle-hover)]'}`}>Personalisation</button>
                <button onClick={() => setActiveSettingsTab('account')} className={`px-3 py-1 text-sm font-semibold rounded-full transition-all duration-200 ${activeSettingsTab === 'account' ? 'bg-[var(--color-brand)] text-white shadow-md' : 'bg-white/60 dark:bg-[#334155]/60 text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle-hover)]'}`}>Account</button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {activeSettingsTab === 'personalisation' && (
                <div className="space-y-10">
                  <div>
                    <h3 className="font-semibold text-base mb-4 tracking-wide">Color Theme</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {themes.map(t => (
                        <div key={t.id} className="flex flex-col items-center">
                          <button onClick={() => handleSettingsUpdate({ theme: t.id })} className={`w-14 h-14 sm:w-20 sm:h-20 rounded-2xl border-2 transition-all duration-200 flex items-center justify-center shadow-md ${theme === t.id ? 'border-[var(--color-brand)] scale-105 ring-2 ring-[var(--color-brand)]' : 'border-[var(--color-border)] hover:scale-105'}`} style={{ background: t.vars['--color-background'], color: t.vars['--color-text-primary'] }}>
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
                    <h3 className="font-semibold text-base mb-4 tracking-wide">Profile Picture</h3>
                    <div className="flex items-center gap-4">
                      <Avatar url={profile.avatar_url} onUpload={(base64Str) => handleSettingsUpdate({ avatar_url: base64Str })} />
                    </div>
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
            </div>
            <div className="p-4 border-t border-[var(--color-border)] flex-shrink-0 flex justify-between items-center gap-4">
              <button onClick={async () => { await supabase.auth.signOut(); setToastMessage('Logging out...'); }} className="flex items-center gap-2 text-sm text-red-500 hover:text-red-400 font-semibold px-4 py-2 rounded-full bg-white/60 dark:bg-[#334155]/60 shadow-sm transition-all"><LogOutIcon className="w-5 h-5"/> Log Out</button>
              <button onClick={() => setShowSettingsModal(false)} className="px-4 py-2 text-sm font-semibold bg-[var(--color-bg-subtle-hover)] text-[var(--color-text-primary)] rounded-full shadow-sm hover:opacity-90 transition-all">Close</button>
            </div>
          </div>
        </div>
      )}

      <aside className={`fixed lg:static z-30 w-64 sm:w-72 min-h-screen bg-[var(--color-bg-sidebar)] backdrop-blur-sm border-r border-[var(--color-border)] flex flex-col transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-3 sm:p-4 flex-shrink-0 border-b border-[var(--color-border)] flex items-center justify-between">
          <Link href="/notes" className="flex items-center gap-2 group">
            <FileTextIcon className="w-5 sm:w-6 h-5 sm:h-6 text-[var(--color-brand)] group-hover:scale-110 transition-transform" />
            <h1 className="font-bold text-lg sm:text-xl text-[var(--color-text-primary)]">Noteify</h1>
          </Link>
          <button onClick={toggleSidebar} className="lg:hidden p-2 rounded-md text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle-hover)] transition-colors"><CloseIcon className="w-4 sm:w-5 h-4 sm:h-5" /></button>
        </div>
        <div className="p-3 sm:p-4 flex-shrink-0">
          <button onClick={handleCreateNote} className="w-full flex items-center justify-center gap-2 py-1 sm:py-2 px-2 sm:px-3 bg-[var(--color-brand)] text-white rounded-md hover:opacity-90 transition-colors font-semibold text-xs sm:text-sm"><PlusIcon className="w-4 h-4" /> New Note</button>
        </div>
        {/* Note Creation Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreateModal(false)}></div>
            <form onSubmit={handleCreateNoteSubmit} className="relative z-10 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg p-6 w-full max-w-md shadow-xl flex flex-col gap-4">
              <h3 className="text-lg font-semibold mb-2">Create New Note</h3>
              <input type="text" placeholder="Title" value={newNoteForm.title} onChange={e => setNewNoteForm(f => ({...f, title: e.target.value}))} className="w-full p-2 rounded border border-[var(--color-border)] bg-[var(--color-bg-subtle)]" required />
              <input type="text" placeholder="Subject (e.g., Work, Personal)" value={newNoteForm.subject} onChange={e => setNewNoteForm(f => ({...f, subject: e.target.value}))} className="w-full p-2 rounded border border-[var(--color-border)] bg-[var(--color-bg-subtle)]" />
              <input type="text" placeholder="Tags (comma separated)" value={newNoteForm.tags} onChange={e => setNewNoteForm(f => ({...f, tags: e.target.value}))} className="w-full p-2 rounded border border-[var(--color-border)] bg-[var(--color-bg-subtle)]" />
              <textarea placeholder="Start writing..." value={newNoteForm.content} onChange={e => setNewNoteForm(f => ({...f, content: e.target.value}))} className="w-full p-2 rounded border border-[var(--color-border)] bg-[var(--color-bg-subtle)] min-h-[120px]" />
              <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 rounded bg-[var(--color-bg-subtle-hover)] text-[var(--color-text-primary)]">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded bg-[var(--color-brand)] text-white font-semibold">Create</button>
              </div>
            </form>
          </div>
        )}
        <div className="px-3 sm:px-4 pb-3 sm:pb-4 flex-shrink-0">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)]" />
            <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-2 pl-10 text-xs sm:text-sm bg-[var(--color-bg-subtle)] text-[var(--color-text-primary)] rounded-md focus:ring-2 focus:ring-[var(--color-brand)] border-none outline-none transition-colors" />
          </div>
        </div>
        <nav className="flex-grow overflow-y-auto p-3 sm:p-4 space-y-2">
          <Link href="/explore" className="flex items-center gap-2 p-2 sm:p-3 rounded-md hover:bg-[var(--color-bg-subtle-hover)] transition-colors">
            <ExploreIcon className="w-4 sm:w-5 h-4 sm:h-5 text-[var(--color-text-primary)]" />
            <span className="text-xs sm:text-sm font-semibold text-[var(--color-text-primary)]">Explore</span>
          </Link>
          {filteredNotes.length > 0 ? (
            filteredNotes.map(note => (
              <div key={note.id} className={`flex items-center rounded-md transition-colors duration-150 ${activeNote?.id === note.id ? 'bg-[var(--color-brand)] text-white' : 'hover:bg-[var(--color-bg-subtle-hover)]'}`}>
                <a onClick={() => { setActiveNote(note); setSidebarOpen(false); }} className={`flex-grow p-2 sm:p-3 rounded-l-md cursor-pointer ${activeNote?.id === note.id ? 'text-white' : ''}`}>
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-xs sm:text-sm truncate">{note.title || 'Untitled'}</h3>
                    {note.subject && (<span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${activeNote?.id === note.id ? 'bg-white/20' : 'bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)]'}`}>{note.subject}</span>)}
                  </div>
                  <p className={`text-xs mt-1 ${activeNote?.id === note.id ? 'text-blue-100' : 'text-[var(--color-text-secondary)]'}`}>
                    Last active: {new Date(note.updated_at || note.created_at).toLocaleDateString()}
                  </p>
                </a>
                <button onClick={(e) => { e.stopPropagation(); setNoteToDelete(note.id); setShowDeleteModal(true); }} className={`flex-shrink-0 self-stretch px-2 sm:px-3 rounded-r-md transition-colors duration-150 ${activeNote?.id === note.id ? 'hover:bg-white/20' : 'hover:bg-red-500/20'}`} aria-label="Delete note">
                  <TrashIcon className={`w-4 h-4 ${activeNote?.id === note.id ? 'text-white' : 'text-[var(--color-text-secondary)] hover:text-red-500'}`} />
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-8 sm:py-10 text-[var(--color-text-secondary)] text-xs sm:text-sm"><FileTextIcon className="w-8 sm:w-10 h-8 sm:h-10 mx-auto opacity-50 mb-2" /> No notes found.</div>
          )}
        </nav>
        <div className="p-3 sm:p-4 flex-shrink-0 border-t border-[var(--color-border)] flex items-center justify-between gap-2">
          <Link href="/profile" className="flex-1 flex items-center gap-2 sm:gap-3 group p-1 rounded-md min-w-0">
            <img src={avatarSrc} alt="Profile" className="w-6 sm:w-8 h-6 sm:h-8 rounded-full object-cover border-2 border-[var(--color-border)] group-hover:border-[var(--color-brand)] transition-colors flex-shrink-0" />
            <div className="truncate"><span className="font-semibold text-xs sm:text-sm text-[var(--color-text-primary)] group-hover:text-[var(--color-brand)] transition-colors truncate">{profile?.full_name || profile?.username || 'User'}</span></div>
          </Link>
          <button onClick={() => setShowSettingsModal(true)} aria-label="Open settings" className="p-2 rounded-md text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle-hover)] transition-colors">
            <CogIcon className="w-4 sm:w-5 h-4 sm:h-5" />
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative z-10">
        <header className="flex-shrink-0 p-3 sm:p-4 border-b border-[var(--color-border)] flex items-center justify-between">
          <button onClick={toggleSidebar} className="p-2 rounded-md hover:bg-[var(--color-bg-subtle-hover)] transition-colors lg:hidden"><MenuIcon className="w-4 sm:w-5 h-4 sm:h-5" /></button>
          <div className="flex items-center justify-center gap-1 sm:gap-2">
            {activeNote && (
              <>
                {/* Removed write/preview toggle */}
                <div className="flex items-center space-x-2">
                  {/* Sleek toggle for public/private */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isPublic}
                      onClick={async () => {
                        const newPublic = !isPublic;
                        // Bad words list (simple, can be expanded)
                        const badWords = [
                          'fuck', 'shit', 'bitch', 'asshole', 'cunt', 'nigger', 'fag', 'dick', 'cock', 'pussy', 'bastard', 'slut', 'whore', 'retard', 'faggot', 'nigga', 'twat', 'wank', 'cum', 'suck', 'rape', 'penis', 'vagina', 'anus', 'bollock', 'bugger', 'crap', 'damn', 'dyke', 'goddamn', 'hell', 'homo', 'jerk', 'motherfucker', 'prick', 'shithead', 'spastic', 'tosser', 'tit', 'arse', 'bollocks', 'shag', 'sod', 'arsehole', 'bloody', 'bollocking', 'bullshit', 'clit', 'cockhead', 'cocksucker', 'dildo', 'douche', 'dyke', 'fanny', 'flaps', 'gash', 'knob', 'minge', 'muff', 'piss', 'pissed', 'pissing', 'poop', 'queer', 'scrote', 'shag', 'shite', 'shitface', 'shitfaced', 'skank', 'slag', 'smeg', 'spunk', 'tosser', 'turd', 'twat', 'wank', 'wanker', 'waz', 'wazzer', 'wop', 'yid'
                        ];
                        const fieldsToCheck = [activeNote?.title, activeNote?.subject, activeNote?.content];
                        const containsBadWord = fieldsToCheck.some(field =>
                          typeof field === 'string' && badWords.some(bw => field.toLowerCase().includes(bw))
                        );
                        if (newPublic && containsBadWord) {
                          setToastMessage('Cannot make public: note contains inappropriate language.');
                          return;
                        }
                        setIsPublic(newPublic);
                        if (!activeNote || !activeNote.id) return;
                        const { data: { user } } = await supabase.auth.getUser();
                        if (!user) return;
                        if (newPublic) {
                          const username = profile?.username || profile?.full_name || 'Anonymous';
                          const sharedNote = {
                            note_id: parseInt(activeNote.id),
                            title: activeNote.title || 'Untitled',
                            content: activeNote.content || '',
                            username,
                            created_at: activeNote.created_at || new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                            user_id: user.id,
                            is_public: true,
                          };
                          await supabase.from('shared_notes').upsert(sharedNote, { onConflict: ['note_id'] });
                          setToastMessage('Note is now public.');
                        } else {
                          await supabase.from('shared_notes').delete().eq('note_id', activeNote.id);
                          setToastMessage('Note is no longer public.');
                        }
                      }}
                      className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors duration-200 focus:outline-none border-2 ${isPublic ? 'bg-[var(--color-brand)] border-[var(--color-brand)]' : 'bg-[var(--color-bg-subtle-hover)] border-[var(--color-border)]'}`}
                      style={{ boxShadow: isPublic ? '0 0 0 2px var(--color-brand)' : '0 0 0 1px var(--color-border)' }}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${isPublic ? 'translate-x-6' : 'translate-x-1'}`}
                        style={{ boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)' }}
                      />
                    </button>
                    <span className="text-xs font-medium text-[var(--color-text-secondary)] select-none">Public</span>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        if (!activeNote || !activeNote.id) {
                          setToastMessage('Error: No note selected.');
                          return;
                        }
                        if (!profile || (!profile.username && !profile.full_name)) {
                          setToastMessage('Error: Profile information missing.');
                          return;
                        }
                        const { data: { user } } = await supabase.auth.getUser();
                        if (!user) {
                          setToastMessage('Error: User not authenticated.');
                          return;
                        }
                        const username = profile.username || profile.full_name || 'Anonymous';
                        const sharedNote = {
                          note_id: parseInt(activeNote.id),
                          title: activeNote.title || 'Untitled',
                          content: activeNote.content || '',
                          username,
                          created_at: activeNote.created_at || new Date().toISOString(),
                          updated_at: new Date().toISOString(),
                          user_id: user.id,
                          is_public: isPublic,
                        };
                        console.log('Attempting to upsert shared note:', sharedNote);
                        const { data, error } = await supabase
                          .from('shared_notes')
                          .upsert(sharedNote, { onConflict: ['note_id'] })
                          .select('id')
                          .single();
                        if (error) {
                          console.error('Supabase upsert error:', {
                            message: error.message,
                            details: error.details,
                            hint: error.hint,
                            code: error.code
                          });
                          setToastMessage(`Error sharing note: ${error.message}`);
                          return;
                        }
                        console.log('Upsert successful, shared note ID:', data.id);
                        const url = `${window.location.origin}/share?id=${data.id}`; // Use shared_notes.id (UUID)
                        console.log('Generated share URL:', url);
                        await navigator.clipboard.writeText(url);
                        setToastMessage('Share link copied!');
                      } catch (err) {
                        console.error('Unexpected error sharing note:', err);
                        setToastMessage('Unexpected error sharing note.');
                      }
                    }}
                    className="px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold rounded-md bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-hover)] transition-colors"
                    title="Copy shareable link to clipboard"
                  >
                    Share Note
                  </button>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs text-[var(--color-text-secondary)] transition-opacity duration-300 ${isSaving ? 'opacity-100' : 'opacity-0'}`}>Saving...</span>
          </div>
        </header>
        <div className="flex-grow overflow-y-auto">
          {activeNote ? (
            <div className="max-w-3xl sm:max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
              <input type="text" value={activeNote.title} onChange={(e) => handleUpdateNote('title', e.target.value)} className="text-xl sm:text-2xl md:text-3xl font-bold bg-transparent w-full focus:outline-none placeholder:text-[var(--color-text-secondary)] mb-3 sm:mb-4" placeholder="Note Title" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <input type="text" value={activeNote.subject || ''} onChange={(e) => handleUpdateNote('subject', e.target.value)} placeholder="Subject (e.g., Work, Personal)" className="w-full p-2 text-xs sm:text-sm bg-[var(--color-bg-subtle)] rounded-md focus:ring-2 focus:ring-[var(--color-brand)] border-none outline-none" />
                <input type="text" value={activeNote.tags?.join(', ') || ''} onChange={(e) => handleUpdateNote('tags', e.target.value)} placeholder="Add tags, comma-separated..." className="w-full p-2 text-xs sm:text-sm bg-[var(--color-bg-subtle)] rounded-md focus:ring-2 focus:ring-[var(--color-brand)] border-none outline-none" />
              </div>
              <textarea value={activeNote.content} onChange={(e) => handleUpdateNote('content', e.target.value)} className="w-full mt-2 min-h-[50vh] bg-transparent text-xs sm:text-base focus:outline-none placeholder:text-[var(--color-text-secondary)] leading-relaxed resize-none font-mono" placeholder="Start writing..." onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = `${e.target.scrollHeight}px`; }} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-[var(--color-text-secondary)] p-6 sm:p-8 gap-3 sm:gap-4">
              <FileTextIcon className="w-12 sm:w-16 h-12 sm:h-16 mb-2 opacity-50" />
              <h2 className="text-base sm:text-xl font-semibold text-[var(--color-text-primary)]">{notes.length > 0 ? 'Select a Note' : 'Welcome to Noteify'}</h2>
              <p className="max-w-xs text-xs sm:text-base">{notes.length > 0 ? 'Choose a note to view or edit.' : 'Create your first note to get started.'}</p>
            </div>
          )}
        </div>
      </main>

      <style jsx global>{`
        .dark .prose-headings, .dark .prose-p, .dark .prose-strong, .dark .prose-li, .dark .prose-code { color: var(--color-text-primary); }
        .dark .prose-blockquote { color: var(--color-text-secondary); }
        .dark .prose-a { color: var(--color-brand); }
      `}</style>
    </div>
  );
}
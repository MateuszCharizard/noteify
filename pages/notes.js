import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import * as THREE from 'three';
import Head from 'next/head';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- Icon Components ---
const SunIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path>
  </svg>
);
const MoonIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
  </svg>
);
const PlusIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);
const TrashIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);
const SearchIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);
const FileTextIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);
const MenuIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);
const CloseIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

// --- Main App Component ---
export default function NotesPage() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    const savedTheme = localStorage.getItem('theme');
    const userPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return savedTheme || (userPrefersDark ? 'dark' : 'light');
  });

  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const backgroundRef = useRef(null);
  const debounceTimeout = useRef(null);
  const [isSaving, setIsSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (typeof window === 'undefined' || !backgroundRef.current) return;
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
  }, [theme]);

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

  const fetchData = async (user) => {
    setLoading(true);
    try {
      const { data: notesData, error: notesError } = await supabase.from('notes').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (notesError) throw notesError;
      const { data: profileData, error: profileError } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (profileError) throw profileError;
      setNotes(notesData || []);
      if (notesData?.length > 0) setActiveNote(notesData[0]);
      setProfile(profileData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setToastMessage('Error: Could not load your notes.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const newNote = { title: 'New Note', content: '', user_id: user.id, subject: 'General', tags: [] };
    try {
      const { data, error } = await supabase.from('notes').insert(newNote).select().single();
      if (error) throw error;
      setNotes((prev) => [data, ...prev]);
      setActiveNote(data);
      setToastMessage('Note created!');
      setSidebarOpen(false);
      setPreviewMode(false);
    } catch (error) {
      console.error("Create error:", error);
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

  const handleDeleteNote = async () => {
    if (!noteToDelete) return;
    try {
      await supabase.from('notes').delete().eq('id', noteToDelete);
      const remainingNotes = notes.filter((note) => note.id !== noteToDelete);
      setNotes(remainingNotes);
      if (activeNote?.id === noteToDelete) {
        setActiveNote(remainingNotes[0] || null);
      }
      setToastMessage('Note deleted.');
    } catch (error) {
      console.error("Delete error:", error);
      setToastMessage('Error: Could not delete note.');
    } finally {
      closeDeleteModal();
    }
  };

  const openDeleteModal = (noteId) => { setNoteToDelete(noteId); setShowDeleteModal(true); };
  const closeDeleteModal = () => { setShowDeleteModal(false); setNoteToDelete(null); };
  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const filteredNotes = notes.filter(note =>
    (note.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (note.content?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (note.subject?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (note.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[var(--color-bg-subtle)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-text-primary)]"></div>
      </div>
    );
  }

  const avatarSrc = profile?.avatar_url || `https://avatar.vercel.sh/${profile?.username || 'A'}.png?size=32`;

  return (
    <div className="h-screen font-sans bg-[var(--color-background)] text-[var(--color-text-primary)] transition-colors duration-300 flex overflow-hidden">
      <Head>
        <title>Noteify - Your Notes</title>
      </Head>

      <div id="background" ref={backgroundRef} className="fixed inset-0 z-0 opacity-50"></div>

      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 max-w-xs ${toastMessage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="bg-neutral-800 text-white px-6 py-2 rounded-full shadow-lg text-sm font-medium">{toastMessage}</div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeDeleteModal}></div>
          <div role="dialog" className="relative z-10 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg p-4 sm:p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Delete Note</h3>
            <p className="text-sm text-[var(--color-text-secondary)] mt-2">Are you sure? This action cannot be undone.</p>
            <div className="flex justify-end gap-4 mt-6">
              <button onClick={closeDeleteModal} className="px-4 py-2 text-sm font-semibold bg-[var(--color-bg-subtle)] text-[var(--color-text-primary)] rounded-md hover:bg-[var(--color-bg-subtle-hover)] transition-colors">Cancel</button>
              <button onClick={handleDeleteNote} className="px-4 py-2 text-sm font-semibold bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      <aside className={`fixed lg:static z-30 w-72 min-h-screen bg-[var(--color-bg-sidebar)] backdrop-blur-sm border-r border-[var(--color-border)] flex flex-col transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-4 flex-shrink-0 border-b border-[var(--color-border)] flex items-center justify-between">
          <h1 className="font-bold text-xl text-[var(--color-text-primary)]">Noteify</h1>
          <button onClick={toggleSidebar} className="lg:hidden p-2 rounded-md text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle-hover)] transition-colors"><CloseIcon className="w-5 h-5" /></button>
        </div>
        <div className="p-4 flex-shrink-0">
          <button onClick={handleCreateNote} className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[var(--color-brand)] text-white rounded-md hover:bg-[var(--color-brand-hover)] transition-colors font-semibold text-sm"><PlusIcon className="w-4 h-4" /> New Note</button>
        </div>
        <div className="px-4 pb-4 flex-shrink-0">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-placeholder)]" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 pl-10 text-sm bg-[var(--color-bg-subtle)] text-[var(--color-text-primary)] rounded-md focus:ring-2 focus:ring-[var(--color-brand)] border-none outline-none transition-colors"
            />
          </div>
        </div>
        <nav className="flex-grow overflow-y-auto p-4 space-y-2">
          {filteredNotes.length > 0 ? (
            filteredNotes.map(note => (
              <div key={note.id} className={`flex items-center rounded-md transition-colors duration-150 ${activeNote?.id === note.id ? 'bg-[var(--color-brand)]' : 'hover:bg-[var(--color-bg-subtle-hover)]'}`}>
                <a
                  onClick={() => { setActiveNote(note); setSidebarOpen(false); setPreviewMode(false); }}
                  className={`flex-grow p-3 rounded-l-md cursor-pointer ${activeNote?.id === note.id ? 'text-white' : ''}`}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-sm truncate">{note.title || 'Untitled'}</h3>
                    {note.subject && (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${activeNote?.id === note.id ? 'bg-white/20 text-white' : 'bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)]'}`}>
                        {note.subject}
                      </span>
                    )}
                  </div>
                  <p className={`text-xs mt-1 ${activeNote?.id === note.id ? 'text-blue-100' : 'text-[var(--color-text-secondary)]'}`}>
                    Last active: {new Date(note.updated_at || note.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                  </p>
                </a>
                <button
                  onClick={(e) => { e.stopPropagation(); openDeleteModal(note.id); }}
                  className={`flex-shrink-0 self-stretch px-3 rounded-r-md transition-colors duration-150 ${activeNote?.id === note.id ? 'hover:bg-white/20' : 'hover:bg-[var(--color-destructive-hover)]'}`}
                  aria-label="Delete note"
                >
                  <TrashIcon className={`w-4 h-4 ${activeNote?.id === note.id ? 'text-white' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-destructive)]'}`} />
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-[var(--color-text-secondary)] text-sm"><FileTextIcon className="w-10 h-10 mx-auto opacity-50 mb-2" /> No notes found.</div>
          )}
        </nav>
        <div className="p-4 flex-shrink-0 border-t border-[var(--color-border)] flex items-center justify-between gap-4">
          <Link href="/profile" className="flex items-center gap-3 group p-1 rounded-md">
            <img src={avatarSrc} alt="Profile" className="w-8 h-8 rounded-full object-cover border-2 border-[var(--color-border)] group-hover:border-[var(--color-brand)] transition-colors" />
            <div><span className="font-semibold text-sm text-[var(--color-text-primary)] group-hover:text-[var(--color-brand)] transition-colors">{profile?.full_name || profile?.username || 'User'}</span></div>
          </Link>
          <button
            onClick={toggleTheme}
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
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative z-10">
        <header className="flex-shrink-0 p-4 border-b border-[var(--color-border)] flex items-center justify-between">
          <button onClick={toggleSidebar} className="p-2 rounded-md hover:bg-[var(--color-bg-subtle-hover)] transition-colors lg:hidden"><MenuIcon className="w-5 h-5" /></button>
          <div className="flex items-center justify-center gap-1">
            {activeNote && (
              <div className="flex items-center p-0.5 bg-[var(--color-bg-subtle)] rounded-lg">
                <button onClick={() => setPreviewMode(false)} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${!previewMode ? 'bg-[var(--color-background)] shadow-sm' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle-hover)]'}`}>Write</button>
                <button onClick={() => setPreviewMode(true)} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${previewMode ? 'bg-[var(--color-background)] shadow-sm' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle-hover)]'}`}>Preview</button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs text-[var(--color-text-secondary)] transition-opacity duration-300 ${isSaving ? 'opacity-100' : 'opacity-0'}`}>Saving...</span>
          </div>
        </header>
        <div className="flex-grow overflow-y-auto">
          {activeNote ? (
            <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
              <input
                type="text"
                value={activeNote.title}
                onChange={(e) => handleUpdateNote('title', e.target.value)}
                className="text-2xl sm:text-3xl font-bold bg-transparent w-full focus:outline-none placeholder:text-[var(--color-text-placeholder)] mb-4"
                placeholder="Note Title"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <input
                  type="text"
                  value={activeNote.subject || ''}
                  onChange={(e) => handleUpdateNote('subject', e.target.value)}
                  placeholder="Subject (e.g., Work, Personal)"
                  className="w-full p-2 text-sm bg-[var(--color-bg-subtle)] rounded-md focus:ring-2 focus:ring-[var(--color-brand)] border-none outline-none"
                />
                <input
                  type="text"
                  value={activeNote.tags?.join(', ') || ''}
                  onChange={(e) => handleUpdateNote('tags', e.target.value)}
                  placeholder="Add tags, comma-separated..."
                  className="w-full p-2 text-sm bg-[var(--color-bg-subtle)] rounded-md focus:ring-2 focus:ring-[var(--color-brand)] border-none outline-none"
                />
              </div>
              {previewMode ? (
                <article className="prose prose-lg prose-p:my-2 prose-headings:my-4 prose-li:my-0 max-w-none prose-headings:text-[var(--color-text-primary)] prose-p:text-[var(--color-text-primary)] prose-strong:text-[var(--color-text-primary)] prose-a:text-[var(--color-brand)] prose-blockquote:text-[var(--color-text-secondary)] prose-code:text-[var(--color-text-primary)] prose-li:text-[var(--color-text-primary)]">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{activeNote.content || '*Nothing to preview...*'}</ReactMarkdown>
                </article>
              ) : (
                <textarea
                  value={activeNote.content}
                  onChange={(e) => handleUpdateNote('content', e.target.value)}
                  className="w-full mt-2 min-h-[50vh] bg-transparent text-base focus:outline-none placeholder:text-[var(--color-text-placeholder)] leading-relaxed resize-none font-mono"
                  placeholder="Start writing..."
                  onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = `${e.target.scrollHeight}px`; }}
                />
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-[var(--color-text-secondary)] p-8 gap-4">
              <FileTextIcon className="w-16 h-16 mb-2 opacity-50" />
              <h2 className="text-lg sm:text-xl font-semibold text-[var(--color-text-primary)]">{notes.length > 0 ? 'Select a Note' : 'Welcome to Noteify'}</h2>
              <p className="max-w-xs text-sm sm:text-base">{notes.length > 0 ? 'Choose a note to view or edit.' : 'Create your first note to get started.'}</p>
            </div>
          )}
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
          --color-text-placeholder: #a1a1aa;
          --color-border: #e5e7eb;
          --color-brand: #3b82f6;
          --color-brand-hover: #2563eb;
          --color-destructive: #ef4444;
          --color-destructive-hover: rgba(239, 68, 68, 0.1);
          --color-switch-track: #fcd34d;
          --color-switch-icon: #f59e0b;
          transition: all 0.3s ease;
        }

        .dark {
          --color-background: #0a0a0a;
          --color-bg-sidebar: rgba(10, 10, 10, 0.8);
          --color-bg-subtle: #171717;
          --color-bg-subtle-hover: #262626;
          --color-text-primary: #f5f5f5;
          --color-text-secondary: #a3a3a3;
          --color-text-placeholder: #525252;
          --color-border: #262626;
          --color-brand: #3b82f6;
          --color-brand-hover: #60a5fa;
          --color-destructive: #ef4444;
          --color-destructive-hover: rgba(239, 68, 68, 0.2);
          --color-switch-track: #4f46e5;
          --color-switch-icon: #c7d2fe;
          transition: all 0.3s ease;
        }

        .dark .prose-headings, .dark .prose-p, .dark .prose-strong, .dark .prose-li, .dark .prose-code { color: var(--color-text-primary); }
        .dark .prose-blockquote { color: var(--color-text-secondary); }
        .dark .prose-a { color: var(--color-brand); }
      `}</style>
    </div>
  );
}
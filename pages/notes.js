import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import * as THREE from 'three';

// --- Helper Components ---
const Head = ({ children }) => {
  useEffect(() => {
    const childrenArray = React.Children.toArray(children);
    const title = childrenArray.find(c => c.type === 'title')?.props.children;
    if (title) document.title = title;
  }, [children]);
  return null;
};

const Link = ({ href, children, ...props }) => <a href={href} {...props}>{children}</a>;

// --- Icon Components (Lucide-React inspired) ---
const SunIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>;
const MoonIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>;
const PlusSquareIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M8 12h8"></path><path d="M12 8v8"></path></svg>;
const TrashIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const SearchIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>;
const FileTextIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path></svg>;

// --- Supabase Client ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- Main App Component ---
export default function Notes({ session }) {
  const router = useRouter();
  const [theme, setTheme] = useState('light');
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const backgroundRef = useRef(null);
  const debounceTimeout = useRef(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedStatus, setSavedStatus] = useState(true); // true = saved, false = unsaved changes

  // --- Effects ---
  useEffect(() => {
    // Redirect non-authenticated users to auth page
    if (!session) {
      router.push('/auth');
      return;
    }

    fetchData(session.user);
  }, [session, router]);

  useEffect(() => {
    // 3D background effect
    if (typeof window === 'undefined' || !backgroundRef.current || !session) return;
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Clear previous content
    backgroundRef.current.innerHTML = '';
    backgroundRef.current.appendChild(renderer.domElement);
    
    const stars = new THREE.Group();
    const starGeometry = new THREE.SphereGeometry(0.06, 16, 16);
    const starMaterial = new THREE.MeshBasicMaterial({ color: theme === 'dark' ? 0xaaaaaa : 0x555555 });
    
    for (let i = 0; i < 1500; i++) {
      const star = new THREE.Mesh(starGeometry, starMaterial);
      star.position.set(
        (Math.random() - 0.5) * 120, 
        (Math.random() - 0.5) * 120, 
        (Math.random() - 0.5) * 120
      );
      stars.add(star);
    }
    scene.add(stars);
    camera.position.z = 10;
    
    let mouseX = 0, mouseY = 0;
    const onMouseMove = (e) => {
      mouseX = (e.clientX - window.innerWidth / 2) * 0.002;
      mouseY = (e.clientY - window.innerHeight / 2) * 0.002;
    };
    window.addEventListener('mousemove', onMouseMove);
    
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      stars.rotation.y += 0.0002;
      camera.position.x += (mouseX - camera.position.x) * 0.02;
      camera.position.y += (-mouseY - camera.position.y) * 0.02;
      camera.lookAt(scene.position);
      renderer.render(scene, camera);
    };
    animate();
    
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme, session]);

  // --- Data Fetching ---
  const fetchData = async (user) => {
    setLoading(true);
    
    try {
      const [notesRes, profileRes] = await Promise.all([
        supabase.from('notes').select('*').eq('user_id', user.id).order('updated_at', { ascending: false }),
        supabase.from('profiles').select('avatar_url, username, full_name').eq('id', user.id).single()
      ]);
      
      if (notesRes.error) {
        console.error('Error fetching notes:', notesRes.error);
      } else {
        setNotes(notesRes.data || []);
        if (notesRes.data?.length > 0) {
          setActiveNote(notesRes.data[0]);
        }
      }

      if (profileRes.error) {
        console.error('Error fetching profile:', profileRes.error);
      } else {
        setProfile(profileRes.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- Note Handlers ---
  const handleCreateNote = async () => {
    if (!session?.user) return;

    try {
      const { data, error } = await supabase
        .from('notes')
        .insert({ 
          title: 'Untitled', 
          content: '', 
          user_id: session.user.id, 
          updated_at: new Date().toISOString() 
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error creating note:', error);
      } else {
        const newNotes = [data, ...notes];
        setNotes(newNotes);
        setActiveNote(data);
      }
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const handleUpdateNote = (field, value) => {
    if (!activeNote) return;
    
    setIsSaving(true);
    setSavedStatus(false);
    const updatedNote = { ...activeNote, [field]: value, updated_at: new Date().toISOString() };
    setActiveNote(updatedNote);
    
    const updatedNotes = notes.map(note => note.id === activeNote.id ? updatedNote : note);
    setNotes(updatedNotes.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)));

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(async () => {
      try {
        const { error } = await supabase
          .from('notes')
          .update({ [field]: value, updated_at: new Date().toISOString() })
          .eq('id', activeNote.id);
          
        if (error) {
          console.error('Error updating note:', error);
        }
      } catch (error) {
        console.error('Error updating note:', error);
      } finally {
        setIsSaving(false);
        setSavedStatus(true);
      }
    }, 1500);
  };
  
  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Are you sure you want to permanently delete this note?')) {
      try {
        const { error } = await supabase.from('notes').delete().eq('id', noteId);
        
        if (error) {
          console.error('Error deleting note:', error);
        } else {
          const remainingNotes = notes.filter(note => note.id !== noteId);
          setNotes(remainingNotes);
          setActiveNote(remainingNotes[0] || null);
        }
      } catch (error) {
        console.error('Error deleting note:', error);
      }
    }
  };

  // --- UI Handlers ---
  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  
  const filteredNotes = notes.filter(note => 
    (note.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (note.content?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  // Don't render if user is not authenticated (will redirect)
  if (!session) {
    return null;
  }

  // --- Render ---
  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading Noteify...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${theme} h-screen font-sans select-none ${theme === 'dark' ? 'bg-gray-900 text-gray-300' : 'bg-white text-gray-800'} transition-colors duration-500 flex flex-col relative overflow-hidden`}>
      <Head>
        <title>Noteify - Your Notes</title>
      </Head>
      
      <div id="background" ref={backgroundRef} className="absolute inset-0 z-0 opacity-20 dark:opacity-30"></div>
      
      <div className="flex flex-grow overflow-hidden relative z-10">
        <aside className="w-[280px] h-full bg-gray-100/80 dark:bg-gray-950/80 backdrop-blur-md border-r border-gray-200 dark:border-gray-800 flex flex-col flex-shrink-0">
          <div className="p-4">
            <Link href="/profile" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-200/60 dark:hover:bg-gray-800/60 transition-colors">
              <img 
                src={profile?.avatar_url || `https://placehold.co/36x36/e2e8f0/4a5568?text=${profile?.username?.charAt(0)?.toUpperCase() || 'A'}`} 
                alt="Profile" 
                className="w-8 h-8 rounded-full object-cover" 
              />
              <span className="font-semibold text-sm">{profile?.full_name || profile?.username || 'User'}</span>
            </Link>
          </div>

          <div className="px-4 pb-2">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 pl-9 text-sm bg-gray-200/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex-grow overflow-y-auto px-2">
            {filteredNotes.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                {searchTerm ? 'No notes found' : 'No notes yet'}
              </div>
            ) : (
              filteredNotes.map(note => (
                <div 
                  key={note.id} 
                  onClick={() => setActiveNote(note)}
                  className={`flex items-start gap-3 p-2 my-1 cursor-pointer rounded-lg transition-colors duration-200 ${
                    activeNote?.id === note.id 
                      ? 'bg-blue-500/20 border border-blue-500/30' 
                      : 'hover:bg-gray-200/50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <FileTextIcon className="w-5 h-5 mt-1 text-gray-400 flex-shrink-0" />
                  <div className="flex-grow overflow-hidden">
                    <h3 className="font-medium text-sm truncate">{note.title || 'Untitled'}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate h-4">
                      {note.content || 'No additional content'}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {new Date(note.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="p-3 border-t border-gray-200 dark:border-gray-800">
            <button 
              onClick={handleCreateNote} 
              className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-blue-500 text-white rounded-md font-semibold transition-all duration-200 hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/20"
            >
              <PlusSquareIcon className="w-5 h-5" /> New Note
            </button>
          </div>
        </aside>

        <main className="flex-1 h-full flex flex-col">
          <header className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-800 bg-white/30 dark:bg-gray-900/30 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Link 
                href="/landing" 
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                ← Back to Landing
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <span className={`text-xs text-gray-400 transition-opacity duration-300 ${isSaving ? 'opacity-100' : 'opacity-0'}`}>
                Saving...
              </span>
              <span className={`text-xs text-green-500 transition-opacity duration-300 ${savedStatus && !isSaving ? 'opacity-100' : 'opacity-0'}`}>
                Saved
              </span>
              {activeNote && (
                <button 
                  onClick={() => handleDeleteNote(activeNote.id)} 
                  className="p-2 rounded-full text-gray-500 dark:text-gray-400 transition-colors duration-200 hover:bg-red-500/20 hover:text-red-500"
                  title="Delete note"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              )}
              <button 
                onClick={toggleTheme} 
                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 transition-colors" 
                aria-label="Toggle theme"
              >
                {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
              </button>
            </div>
          </header>
          
          <div className="flex-grow overflow-y-auto">
            {activeNote ? (
              <div key={activeNote.id} className="max-w-4xl mx-auto py-8 px-6 md:px-12 animate-fade-in h-full">
                <input 
                  type="text"
                  value={activeNote.title || ''}
                  onChange={(e) => handleUpdateNote('title', e.target.value)}
                  className="text-3xl md:text-5xl font-bold bg-transparent w-full focus:outline-none mb-6 placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="Untitled"
                />
                <textarea
                  value={activeNote.content || ''}
                  onChange={(e) => handleUpdateNote('content', e.target.value)}
                  className="w-full h-[calc(100%-120px)] bg-transparent text-base resize-none focus:outline-none leading-relaxed placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="Start writing your note here..."
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 animate-fade-in px-4">
                <FileTextIcon className="w-24 h-24 mb-4" />
                <h2 className="text-2xl font-semibold mb-2 text-center">
                  {notes.length > 0 ? 'Select a Note' : 'Your notebook is empty'}
                </h2>
                <p className="text-center max-w-md">
                  {notes.length > 0 
                    ? 'Choose a note from the sidebar to view or edit its content.' 
                    : 'Click the "New Note" button to create your first masterpiece!'
                  }
                </p>
                {notes.length === 0 && (
                  <button 
                    onClick={handleCreateNote}
                    className="mt-6 px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold transition-all duration-200 hover:bg-blue-600 hover:scale-105"
                  >
                    Create Your First Note
                  </button>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

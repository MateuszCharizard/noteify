import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '../components/Navbar';
const ProfileBox = dynamic(() => import('../components/ProfileBox'), { ssr: false });
import { fetchProfileById } from '../components/fetchProfile';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import Head from 'next/head';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Icons
const SunIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="4"></circle>
    <path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path>
    <path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path>
  </svg>
);
const MoonIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
  </svg>
);
const BoxIcon = (props) => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M16 3L3 9.75V22.25L16 29L29 22.25V9.75L16 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 17V29" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 9.75L16 17L29 9.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const FileTextIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);
const HeartIcon = ({ className, filled }) => (
  <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>
);
const BookmarkIcon = ({ className, filled }) => (
  <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
  </svg>
);
const CommentIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
  </svg>
);

// Themes
const themes = [
  { id: 'light', name: 'Light', vars: { '--color-background': '#f9fafb', '--color-bg-sidebar': 'rgba(249, 250, 251, 0.8)', '--color-bg-subtle': '#f3f4f6', '--color-bg-subtle-hover': '#e5e7eb', '--color-text-primary': '#171717', '--color-text-secondary': '#6b7280', '--color-border': '#e5e7eb', '--color-brand': '#3b82f6' } },
  { id: 'dark', name: 'Dark', vars: { '--color-background': '#0a0a0a', '--color-bg-sidebar': 'rgba(10, 10, 10, 0.8)', '--color-bg-subtle': '#171717', '--color-bg-subtle-hover': '#262626', '--color-text-primary': '#f5f5f5', '--color-text-secondary': '#a3a3b8', '--color-border': '#262626', '--color-brand': '#3b82f6' } },
  { id: 'sunset', name: 'Sunset', vars: { '--color-background': '#0f172a', '--color-bg-sidebar': 'rgba(15, 23, 42, 0.8)', '--color-bg-subtle': '#1e293b', '--color-bg-subtle-hover': '#334155', '--color-text-primary': '#f1f5f9', '--color-text-secondary': '#94a3b8', '--color-border': '#334155', '--color-brand': '#fb923c' } },
  { id: 'forest', name: 'Forest', vars: { '--color-background': '#1a201c', '--color-bg-sidebar': 'rgba(26, 32, 28, 0.8)', '--color-bg-subtle': '#2d3831', '--color-bg-subtle-hover': '#3a4a40', '--color-text-primary': '#e8f5e9', '--color-text-secondary': '#a5d6a7', '--color-border': '#3a4a40', '--color-brand': '#66bb6a' } },
];

const supabase = typeof window === 'undefined'
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
  : createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function ExplorePage() {
  const [notes, setNotes] = useState([]);
  const [comments, setComments] = useState({});
  const [likes, setLikes] = useState({});
  const [savedNotes, setSavedNotes] = useState({});
  const [newComments, setNewComments] = useState({});
  const [showComments, setShowComments] = useState({});
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('dark');
  const [themeLoaded, setThemeLoaded] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [profilePopup, setProfilePopup] = useState({ open: false, profile: null, loading: false, error: null });
  const [showEmptySkeleton, setShowEmptySkeleton] = useState(true);

  // Unified theme loading logic
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      let loadedTheme = 'dark';
      if (user) {
        const { data: settings } = await supabase.from('user_settings').select('theme').eq('id', user.id).single();
        if (settings) {
          loadedTheme = settings.theme || 'dark';
        }
      } else {
        const savedTheme = localStorage.getItem('theme');
        loadedTheme = savedTheme || 'dark';
      }
      setTheme(loadedTheme);
      setThemeLoaded(true);
      localStorage.setItem('theme', loadedTheme);
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
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme, themeLoaded]);

  // Show profile popup for a username
  const handleShowProfile = async (userId) => {
    if (!userId) return;
    setProfilePopup({ open: true, profile: null, loading: true, error: null });
    try {
      const profile = await fetchProfileById(userId);
      setProfilePopup({ open: true, profile, loading: false, error: null });
    } catch (err) {
      setProfilePopup({ open: true, profile: null, loading: false, error: 'Profile not found' });
    }
  };

  // Toggle comments visibility
  const toggleComments = (noteId) => {
    setShowComments((prev) => ({
      ...prev,
      [noteId]: !prev[noteId],
    }));
  };

  // Load user, notes, comments, likes, saved notes
  const loadData = async () => {
    try {
      // Get user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('Auth error:', userError);
        throw userError;
      }
      setUser(user);
      console.log('Authenticated user:', user ? user.id : 'null');

      // Fetch shared_notes
      const { data: notesData, error: notesError } = await supabase
        .from('shared_notes')
        .select('id, note_id, title, content, username, created_at, updated_at, user_id, is_public')
        .eq('is_public', true)
        .order('created_at', { ascending: false });
      if (notesError) {
        console.error('Notes query error:', notesError);
        throw notesError;
      }
      console.log('Shared notes fetched:', notesData);
      notesData.forEach(note => {
        console.log(`Note ID: ${note.note_id}, Username: ${note.username || 'null'}, User ID: ${note.user_id}, Public: ${note.is_public}`);
      });
      setNotes(notesData || []);

      // Fetch comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .order('created_at', { ascending: true });
      if (commentsError) {
        console.error('Comments query error:', commentsError);
        throw commentsError;
      }
      const commentsByNote = commentsData.reduce((acc, comment) => {
        acc[comment.note_id] = acc[comment.note_id] || [];
        acc[comment.note_id].push(comment);
        return acc;
      }, {});
      setComments(commentsByNote);

      // Fetch likes
      const { data: likesData, error: likesError } = await supabase
        .from('likes')
        .select('*');
      if (likesError) {
        console.error('Likes query error:', likesError);
        throw likesError;
      }
      const likesByNote = likesData.reduce((acc, like) => {
        acc[like.note_id] = acc[like.note_id] || [];
        acc[like.note_id].push(like);
        return acc;
      }, {});
      setLikes(likesByNote);

      // Fetch saved notes
      if (user) {
        const { data: savedData, error: savedError } = await supabase
          .from('saved_notes')
          .select('*')
          .eq('user_id', user.id);
        if (savedError) {
          console.error('Saved notes query error:', savedError);
          throw savedError;
        }
        const savedByNote = savedData.reduce((acc, save) => {
          acc[save.note_id] = save;
          return acc;
        }, {});
        setSavedNotes(savedByNote);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setToastMessage('Error loading notes: ' + err.message);
    }
  };

  // Run loadData on mount
  React.useEffect(() => {
    loadData();

    // Real-time comments subscription
    const commentSubscription = supabase
      .channel('public:comments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, (payload) => {
        setComments((prev) => {
          const noteId = payload.new?.note_id || payload.old?.note_id;
          const newComments = { ...prev };
          if (payload.eventType === 'INSERT') {
            newComments[noteId] = newComments[noteId] || [];
            newComments[noteId].push(payload.new);
          } else if (payload.eventType === 'UPDATE') {
            newComments[noteId] = newComments[noteId].map(c => c.id === payload.new.id ? payload.new : c);
          } else if (payload.eventType === 'DELETE') {
            newComments[noteId] = newComments[noteId].filter(c => c.id !== payload.old.id);
          }
          return newComments;
        });
      })
      .subscribe();

    // Real-time likes subscription
    const likeSubscription = supabase
      .channel('public:likes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'likes' }, (payload) => {
        setLikes((prev) => {
          const noteId = payload.new?.note_id || payload.old?.note_id;
          const newLikes = { ...prev };
          newLikes[noteId] = newLikes[noteId] || [];
          if (payload.eventType === 'INSERT') {
            newLikes[noteId].push(payload.new);
          } else if (payload.eventType === 'DELETE') {
            newLikes[noteId] = newLikes[noteId].filter(l => l.id !== payload.old.id);
          }
          return newLikes;
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(commentSubscription);
      supabase.removeChannel(likeSubscription);
    };
  }, []);

  // Handle comment submission
  const handleComment = async (noteId) => {
    if (!user) {
      setToastMessage('Please sign in to comment.');
      return;
    }
    const content = newComments[noteId]?.trim();
    if (!content) {
      setToastMessage('Comment cannot be empty.');
      return;
    }
    try {
      const { error } = await supabase
        .from('comments')
        .insert({ note_id: noteId, user_id: user.id, content });
      if (error) throw error;
      setNewComments((prev) => ({ ...prev, [noteId]: '' }));
      setToastMessage('Comment posted!');
    } catch (err) {
      console.error('Error posting comment:', err);
      setToastMessage('Error posting comment.');
    }
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Handle like/unlike
  const handleLike = async (noteId) => {
    if (!user) {
      setToastMessage('Please sign in to like.');
      return;
    }
    try {
      const userLike = likes[noteId]?.find(l => l.user_id === user.id);
      if (userLike) {
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('id', userLike.id);
        if (error) throw error;
        setToastMessage('Like removed.');
      } else {
        const { error } = await supabase
          .from('likes')
          .insert({ note_id: noteId, user_id: user.id });
        if (error) throw error;
        setToastMessage('Note liked!');
      }
    } catch (err) {
      console.error('Error toggling like:', err);
      setToastMessage('Error toggling like.');
    }
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Handle save/unsave
  const handleSave = async (noteId) => {
    if (!user) {
      setToastMessage('Please sign in to save.');
      return;
    }
    try {
      const userSave = savedNotes[noteId];
      if (userSave) {
        const { error } = await supabase
          .from('saved_notes')
          .delete()
          .eq('id', userSave.id);
        if (error) throw error;
        setSavedNotes((prev) => {
          const newSaved = { ...prev };
          delete newSaved[noteId];
          return newSaved;
        });
        setToastMessage('Note unsaved.');
      } else {
        const { data, error } = await supabase
          .from('saved_notes')
          .insert({ note_id: noteId, user_id: user.id })
          .select()
          .single();
        if (error) throw error;
        setSavedNotes((prev) => ({ ...prev, [noteId]: data }));
        setToastMessage('Note saved!');
      }
    } catch (err) {
      console.error('Error toggling save:', err);
      setToastMessage('Error toggling save.');
    }
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Skeleton loader for lazy loading empty state messages
  function EmptyStateSkeleton({ lines = 2 }) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 animate-pulse py-8 sm:py-10">
        <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-gray-200 dark:bg-gray-700 mb-2" />
        {[...Array(lines)].map((_, i) => (
          <div key={i} className="h-4 w-40 sm:w-64 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
        ))}
      </div>
    );
  }

  useEffect(() => {
    if (notes.length === 0) {
      setShowEmptySkeleton(true);
      const t = setTimeout(() => setShowEmptySkeleton(false), 700);
      return () => clearTimeout(t);
    } else {
      setShowEmptySkeleton(false);
    }
  }, [notes.length]);

  return (
    <>
      <Head>
        <title>Explore | NoteShare</title>
      </Head>
      <Navbar />
      <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)] flex flex-col">
        {/* Main Content */}
        <main className="mt-12 flex-grow max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              {['Public', 'Notes'].map((word, i) => (
                <span key={i} className="inline-block" style={{ animationDelay: `${0.1 + 0.1 * (i + 1)}s` }}>
                  {word}&nbsp;
                </span>
              ))}
            </h1>
          </div>
          <div className="space-y-6 sm:space-y-8 min-h-[60vh] flex flex-col justify-start">
            {notes.length === 0 ? (
              showEmptySkeleton ? (
                <div className="flex-1 flex items-center justify-center">
                  <EmptyStateSkeleton lines={1} />
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                  <p className="text-lg sm:text-xl text-[var(--color-text-secondary)]">No public notes found.</p>
                </div>
              )
            ) : (
              notes.map((note, index) => (
                <div
                  key={note.note_id}
                  className="bg-[var(--color-bg-subtle)] rounded-lg shadow-lg p-4 sm:p-6 animate-scale-in-up"
                  style={{
                    animationDelay: `${0.5 + 0.2 * (index + 1)}s`,
                    transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
                    transition: 'transform 400ms cubic-bezier(0.03, 0.98, 0.52, 0.99)'
                  }}
                >
                  <div className="mb-4">
                    <Link href={`/share?id=${note.id}`}>
                      <h2 className="text-lg sm:text-xl font-semibold hover:text-[var(--color-brand)] transition-colors animate-fade-in-up" style={{ animationDelay: `${0.6 + 0.2 * (index + 1)}s` }}>
                        {note.title}
                      </h2>
                    </Link>
                    <p className="text-sm sm:text-base text-[var(--color-text-secondary)] mt-1 animate-fade-in-up" style={{ animationDelay: `${0.7 + 0.2 * (index + 1)}s` }}>
                      By{' '}
                      <button
                        className="font-semibold hover:underline text-[var(--color-brand)] focus:outline-none"
                        onClick={() => handleShowProfile(note.user_id)}
                        type="button"
                      >
                        {note.username || 'Anonymous'}
                      </button>{' '}
                      • {new Date(note.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div
                    className="prose prose-sm sm:prose-base max-w-none prose-p:my-2 prose-headings:my-3 prose-li:my-0 prose-headings:text-[var(--color-text-primary)] prose-p:text-[var(--color-text-primary)] prose-strong:text-[var(--color-text-primary)] prose-a:text-[var(--color-brand)] prose-blockquote:text-[var(--color-text-secondary)] prose-code:text-[var(--color-text-primary)] prose-li:text-[var(--color-text-primary)] animate-fade-in-up"
                    style={{ animationDelay: `${0.8 + 0.2 * (index + 1)}s` }}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {note.content.slice(0, 200) + (note.content.length > 200 ? '...' : '')}
                    </ReactMarkdown>
                  </div>
                  <div className="flex items-center space-x-4 mt-4">
                    <button
                      onClick={() => handleLike(note.note_id)}
                      className="flex items-center space-x-1 text-sm sm:text-base text-[var(--color-text-secondary)] hover:text-[var(--color-brand)] transition-colors animate-scale-in"
                      title={user && likes[note.note_id]?.find((l) => l.user_id === user.id) ? 'Unlike' : 'Like'}
                      aria-label={user && likes[note.note_id]?.find((l) => l.user_id === user.id) ? 'Unlike' : 'Like'}
                      style={{ animationDelay: `${0.9 + 0.2 * (index + 1)}s` }}
                    >
                      <HeartIcon
                        className="w-5 h-5 sm:w-6 sm:h-6"
                        filled={user && likes[note.note_id]?.find((l) => l.user_id === user.id)}
                      />
                      <span>{likes[note.note_id]?.length || 0}</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowComments((prev) => ({ ...prev, [note.note_id]: true }));
                        setTimeout(() => document.getElementById(`comment-input-${note.note_id}`).focus(), 0);
                      }}
                      className="flex items-center space-x-1 text-sm sm:text-base text-[var(--color-text-secondary)] hover:text-[var(--color-brand)] transition-colors animate-scale-in"
                      title="Comment"
                      aria-label="Comment"
                      style={{ animationDelay: `${1.0 + 0.2 * (index + 1)}s` }}
                    >
                      <CommentIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                      <span>{comments[note.note_id]?.length || 0}</span>
                    </button>
                    <button
                      onClick={() => handleSave(note.note_id)}
                      className="flex items-center space-x-1 text-sm sm:text-base text-[var(--color-text-secondary)] hover:text-[var(--color-brand)] transition-colors animate-scale-in"
                      title={user && savedNotes[note.note_id] ? 'Unsave' : 'Save'}
                      aria-label={user && savedNotes[note.note_id] ? 'Unsave' : 'Save'}
                      style={{ animationDelay: `${1.1 + 0.2 * (index + 1)}s` }}
                    >
                      <BookmarkIcon
                        className="w-5 h-5 sm:w-6 sm:h-6"
                        filled={user && savedNotes[note.note_id]}
                      />
                      <span>{user && savedNotes[note.note_id] ? 'Saved' : 'Save'}</span>
                    </button>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2 animate-fade-in-up" style={{ animationDelay: `${1.2 + 0.2 * (index + 1)}s` }}>
                      <h3 className="text-base sm:text-lg font-semibold">Comments</h3>
                      <button
                        onClick={() => toggleComments(note.note_id)}
                        className="text-sm sm:text-base text-[var(--color-brand)] hover:underline transition-colors"
                        aria-label={showComments[note.note_id] ? 'Hide comments' : 'Show comments'}
                      >
                        {showComments[note.note_id] ? 'Hide Comments' : 'Show Comments'}
                      </button>
                    </div>
                    {showComments[note.note_id] && (
                      <>
                        {comments[note.note_id]?.length > 0 ? (
                          comments[note.note_id].map((comment, cIndex) => (
                            <div
                              key={comment.id}
                              className="bg-[var(--color-background)] rounded-md p-3 sm:p-4 mb-2 animate-scale-in-up"
                              style={{ animationDelay: `${1.3 + 0.2 * (index + 1) + 0.1 * (cIndex + 1)}s` }}
                            >
                              <p className="text-sm sm:text-base">{comment.content}</p>
                              <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1">
                                By {comment.user_id === user?.id ? 'You' : 'User'} • {new Date(comment.created_at).toLocaleString()}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm sm:text-base text-[var(--color-text-secondary)] animate-fade-in-up" style={{ animationDelay: `${1.3 + 0.2 * (index + 1)}s` }}>
                            No comments yet.
                          </p>
                        )}
                        <div className="mt-4 flex flex-col sm:flex-row gap-2 animate-fade-in-up" style={{ animationDelay: `${1.4 + 0.2 * (index + 1)}s` }}>
                          <textarea
                            id={`comment-input-${note.note_id}`}
                            value={newComments[note.note_id] || ''}
                            onChange={(e) => setNewComments((prev) => ({ ...prev, [note.note_id]: e.target.value }))}
                            placeholder="Add a comment..."
                            className="px-3 sm:px-4 py-1 sm:py-2 text-sm sm:text-base rounded-md bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] w-full h-20 resize-y"
                            aria-label="Comment input"
                          />
                          <button
                            onClick={() => handleComment(note.note_id)}
                            className="px-3 sm:px-4 py-1 sm:py-2 text-sm sm:text-base font-semibold rounded-md bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-hover)] transition-colors animate-scale-in"
                            aria-label="Post comment"
                            style={{ animationDelay: `${1.5 + 0.2 * (index + 1)}s` }}
                          >
                            Post
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
            {/* Profile Popup */}
            {profilePopup.open && (
              <>
                {profilePopup.loading ? (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in" style={{ animationDelay: '0s' }}>
                    <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl p-8 text-center text-lg font-semibold text-[var(--color-text-primary)] animate-scale-in-up" style={{ animationDelay: '0.1s' }}>
                      Loading...
                    </div>
                  </div>
                ) : profilePopup.profile ? (
                  <ProfileBox
                    profile={profilePopup.profile}
                    onClose={() => setProfilePopup({ open: false, profile: null, loading: false, error: null })}
                    currentUserId={user?.id}
                  />
                ) : (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in"
                    onClick={() => setProfilePopup({ open: false, profile: null, loading: false, error: null })}
                    style={{ animationDelay: '0s' }}
                  >
                    <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl p-8 text-center text-lg font-semibold text-[var(--color-text-primary)] animate-scale-in-up" style={{ animationDelay: '0.1s' }}>
                      {profilePopup.error || 'Profile not found'}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
        {/* Toast */}
        {toastMessage && (
          <div className="fixed bottom-4 right-4 bg-[var(--color-bg-subtle)] text-[var(--color-text-primary)] px-4 py-2 rounded-md shadow-lg text-sm sm:text-base animate-scale-in" style={{ animationDelay: '0s' }}>
            {toastMessage}
          </div>
        )}
      </div>
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
          --color-text-secondary: #a3a3b8;
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
      `}</style>
    </>
  );
}
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import '../styles/globals.css';
import dynamic from 'next/dynamic';
import { useEffect as useEffect2, useState as useState2 } from 'react';
import ChatBox from '../components/ChatBox';
const DMButton = dynamic(() => import('../components/DMButton'), { ssr: false });
const ProfileBox = dynamic(() => import('../components/ProfileBox'), { ssr: false });
import { fetchConversations, fetchMessages, sendMessage } from '../components/chatApi';
import { fetchProfileById, fetchProfileByUsername } from '../components/fetchProfile';

import { startConversation } from '../components/chatApi';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
const supabaseRealtime = typeof window === 'undefined'
  ? createSupabaseClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
  : createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

function MessagesPopup({ open, onClose, userId }) {
  const [conversations, setConversations] = useState2([]);
  const [conversationProfiles, setConversationProfiles] = useState2({});
  const [selected, setSelected] = useState2(null);
  const [messages, setMessages] = useState2([]);
  const [input, setInput] = useState2('');
  const [loading, setLoading] = useState2(false);
  const [searchUsername, setSearchUsername] = useState2('');
  const [searchResult, setSearchResult] = useState2(null);
  const [searchError, setSearchError] = useState2(null);
  const [theme, setTheme] = useState2('dark');
  const [themeLoaded, setThemeLoaded] = useState2(false);

  // Theme definitions (copied from index.js)
  const themes = [
    { id: 'light', name: 'Light', vars: { '--color-background': '#f9fafb', '--color-bg-subtle': '#f3f4f6', '--color-bg-subtle-hover': '#e5e7eb', '--color-text-primary': '#171717', '--color-text-secondary': '#6b7280', '--color-border': '#e5e7eb', '--color-brand': '#3b82f6' } },
    { id: 'dark', name: 'Dark', vars: { '--color-background': '#0a0a0a', '--color-bg-subtle': '#171717', '--color-bg-subtle-hover': '#262626', '--color-text-primary': '#f5f5f5', '--color-text-secondary': '#a3a3a3', '--color-border': '#262626', '--color-brand': '#3b82f6' } },
    { id: 'sunset', name: 'Sunset', vars: { '--color-background': '#0f172a', '--color-bg-subtle': '#1e293b', '--color-bg-subtle-hover': '#334155', '--color-text-primary': '#fff8f1', '--color-text-secondary': '#ffd7b3', '--color-border': '#fb923c', '--color-brand': '#fb923c' } },
    { id: 'forest', name: 'Forest', vars: { '--color-background': '#1a201c', '--color-bg-subtle': '#2d3831', '--color-bg-subtle-hover': '#3a4a40', '--color-text-primary': '#eaffea', '--color-text-secondary': '#b6e7b6', '--color-border': '#66bb6a', '--color-brand': '#66bb6a' } },
  ];

  // Load theme from localStorage or default
  useEffect2(() => {
    let loadedTheme = 'light';
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      loadedTheme = savedTheme || 'light';
    }
    setTheme(loadedTheme);
    setThemeLoaded(true);
  }, []);

  // Apply theme vars when theme changes
  useEffect2(() => {
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
    localStorage.setItem('theme', theme);
  }, [theme, themeLoaded]);
  useEffect2(() => {
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
  useEffect2(() => {
    if (open && userId) {
      fetchConversations(userId).then(async (convs) => {
        setConversations(convs);
        // Fetch profiles for all participants (except self)
        const ids = Array.from(new Set(convs.flatMap(c => c.participant_ids).filter(id => id !== userId)));
        const profiles = {};
        await Promise.all(ids.map(async id => {
          try {
            profiles[id] = await fetchProfileById(id);
          } catch {}
        }));
        setConversationProfiles(profiles);
      });
    }
  }, [open, userId]);
  // Fetch messages when conversation selected
  useEffect2(() => {
    if (selected) {
      fetchMessages(selected.id).then(setMessages);
    }
  }, [selected]);
  // Realtime subscription for messages
  useEffect2(() => {
    if (!selected) return;
    const channel = supabaseRealtime
      .channel('public:messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `conversation_id=eq.${selected.id}` }, (payload) => {
        fetchMessages(selected.id).then(setMessages);
      })
      .subscribe();
    return () => {
      supabaseRealtime.removeChannel(channel);
    };
  }, [selected]);
  // Realtime subscription for conversations
  useEffect2(() => {
    if (!userId) return;
    const channel = supabaseRealtime
      .channel('public:conversations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, (payload) => {
        fetchConversations(userId).then(setConversations);
      })
      .subscribe();
    return () => {
      supabaseRealtime.removeChannel(channel);
    };
  }, [userId]);
  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim() || !selected) return;
    setLoading(true);
    await sendMessage(selected.id, userId, input.trim());
    setInput('');
    setLoading(false);
  }
  async function handleSearchUsername(e) {
    e.preventDefault();
    setSearchResult(null);
    setSearchError(null);
    if (!searchUsername.trim()) return;
    setLoading(true);
    try {
      const profile = await fetchProfileByUsername(searchUsername.trim());
      if (!profile || profile.id === userId) {
        setSearchError('User not found or cannot message yourself.');
        setSearchResult(null);
      } else {
        setSearchResult(profile);
      }
    } catch {
      setSearchError('User not found.');
      setSearchResult(null);
    }
    setLoading(false);
  }
  async function handleStartConversationWithUser(user) {
    if (!user || user.id === userId) return;
    setLoading(true);
    try {
      const convo = await startConversation(userId, user.id);
      setSelected(convo);
      setSearchUsername('');
      setSearchResult(null);
      fetchConversations(userId).then(setConversations);
    } finally {
      setLoading(false);
    }
  }
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="relative bg-[var(--color-background)] rounded-2xl shadow-2xl border border-[var(--color-border)] w-full max-w-3xl p-0 flex flex-col h-[80vh]"
        style={{ background: 'rgba(30,41,59,0.98)' }}
        onClick={e => e.stopPropagation()}
      >
        <button className="absolute top-3 right-3 text-xl text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] z-10" onClick={onClose}>&times;</button>
        <div className="flex h-full">
          {/* Sidebar */}
          
          {/* Main chat area */}
          <ChatBox
            messages={messages}
            onSend={handleSend}
            input={input}
            setInput={setInput}
            loading={loading}
            theme={theme}
            userId={userId}
            conversationProfiles={conversationProfiles}
            selected={selected}
          />
        </div>
      </div>
    </div>
  );
}

// Initialize Supabase client
const supabaseUrl = typeof window === 'undefined' ? process.env.SUPABASE_URL : process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = typeof window === 'undefined' ? process.env.SUPABASE_ANON_KEY : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function MyApp({ Component, pageProps }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        // Handle redirects based on auth state
        if (event === 'SIGNED_IN') {
          if (router.pathname === '/auth') {
            router.push('/notes');
          }
        } else if (event === 'SIGNED_OUT') {
          if (router.pathname !== '/' && router.pathname !== '/auth' && router.pathname !== '/landing') {
            router.push('/auth');
          }
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, [router]);

  // Global notification for new messages
  useEffect(() => {
    if (!session?.user?.id) return;
    const channel = supabaseRealtime
      .channel('global:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        // If the user is a participant in the conversation and not the sender, show notification
        const { conversation_id, sender_id } = payload.new;
        fetchConversations(session.user.id).then(convs => {
          if (convs.some(c => c.id === conversation_id) && sender_id !== session.user.id) {
            setHasNewMessage(true);
          }
        });
      })
      .subscribe();
    return () => {
      supabaseRealtime.removeChannel(channel);
    };
  }, [session?.user?.id]);

  // Clear notification when opening messages
  useEffect(() => {
    if (messagesOpen) setHasNewMessage(false);
  }, [messagesOpen]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading Noteify...</p>
        </div>
      </div>
    );
  }

  // Hide DM UI on /share and / (index) routes
  const hideDM = router.pathname === '/share' || router.pathname === '/';
  return (
    <>
      <Component {...pageProps} session={session} />
      {!hideDM && <DMButton onClick={() => setMessagesOpen(true)} hasNotification={hasNewMessage} />}
      {!hideDM && <MessagesPopup open={messagesOpen} onClose={() => setMessagesOpen(false)} userId={session?.user?.id} />}
    </>
  );
}

export default MyApp;
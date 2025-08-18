import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import '../styles/globals.css';
import dynamic from 'next/dynamic';
import { useEffect as useEffect2, useState as useState2 } from 'react';
const DMButton = dynamic(() => import('../components/DMButton'), { ssr: false });
const ProfileBox = dynamic(() => import('../components/ProfileBox'), { ssr: false });
import { fetchConversations, fetchMessages, sendMessage } from '../components/chatApi';
import { fetchProfileById, fetchProfileByUsername } from '../components/fetchProfile';

import { startConversation } from '../components/chatApi';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
const supabaseRealtime = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

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
  // Fetch conversations on open
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
          <div className="w-80 min-w-[18rem] border-r border-[var(--color-border)] bg-black/20 flex flex-col">
            <div className="font-bold text-xl text-white px-6 py-4 border-b border-[var(--color-border)]">Chats</div>
            <form className="flex gap-2 px-4 py-3" onSubmit={handleSearchUsername}>
              <input className="flex-1 rounded bg-black/30 border border-[var(--color-border)] px-3 py-2 text-white placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Search username..." value={searchUsername} onChange={e => setSearchUsername(e.target.value)} disabled={loading} />
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50" disabled={loading || !searchUsername.trim()}>Search</button>
            </form>
            {searchError && <div className="text-red-400 text-xs px-6 mb-2">{searchError}</div>}
            {searchResult && (
              <div className="flex items-center gap-2 mb-2 bg-black/20 rounded p-2 mx-4">
                <img src={searchResult.avatar_url || `https://avatar.vercel.sh/${searchResult.username}.png?size=32`} alt="avatar" className="w-8 h-8 rounded-full" />
                <div className="flex-1">
                  <div className="font-semibold text-white">{searchResult.full_name || searchResult.username}</div>
                  <div className="text-xs text-[var(--color-text-secondary)]">@{searchResult.username}</div>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded disabled:opacity-50" disabled={loading} onClick={() => handleStartConversationWithUser(searchResult)}>Start Chat</button>
              </div>
            )}
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 && <div className="text-[var(--color-text-secondary)] text-center mt-8">No conversations</div>}
              {conversations.map(conv => {
                const otherId = conv.participant_ids.find(id => id !== userId);
                const profile = conversationProfiles[otherId];
                return (
                  <div key={conv.id} className={`p-3 cursor-pointer hover:bg-black/30 ${selected && selected.id === conv.id ? 'bg-black/40' : ''} flex items-center gap-3`} onClick={() => setSelected(conv)}>
                    <img src={profile?.avatar_url || `https://avatar.vercel.sh/${profile?.username || 'U'}.png?size=32`} alt="avatar" className="w-9 h-9 rounded-full" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white truncate">{profile?.full_name || profile?.username || 'User'}</div>
                      <div className="text-xs text-[var(--color-text-secondary)] truncate">{conv.last_message || 'No messages yet'}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Main chat area */}
          <div className="flex-1 flex flex-col">
            {selected ? (
              <>
                <div className="flex items-center gap-3 border-b border-[var(--color-border)] px-6 py-4 bg-black/10">
                  <img src={(() => { const otherId = selected.participant_ids.find(id => id !== userId); const p = conversationProfiles[otherId]; return p?.avatar_url || `https://avatar.vercel.sh/${p?.username || 'U'}.png?size=32`; })()} alt="avatar" className="w-9 h-9 rounded-full" />
                  <div className="font-semibold text-white text-lg">{(() => { const otherId = selected.participant_ids.find(id => id !== userId); const p = conversationProfiles[otherId]; return p?.full_name || p?.username || 'User'; })()}</div>
                </div>
                <div className="flex-1 overflow-y-auto p-6 bg-black/5">
                  {messages.map(msg => (
                    <div key={msg.id} className={`mb-3 flex ${msg.sender_id === userId ? 'justify-end' : 'justify-start'}`}>
                      <div className={`rounded-2xl px-4 py-2 max-w-lg ${msg.sender_id === userId ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white'}`}>{msg.content}</div>
                    </div>
                  ))}
                </div>
                <form className="flex gap-2 p-4 border-t border-[var(--color-border)] bg-black/10" onSubmit={handleSend}>
                  <input className="flex-1 rounded bg-black/30 border border-[var(--color-border)] px-3 py-2 text-white placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Type a message..." value={input} onChange={e => setInput(e.target.value)} disabled={loading} />
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50" disabled={loading || !input.trim()}>Send</button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-[var(--color-text-secondary)] text-lg">Select a chat</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
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

  return (
    <>
      <Component {...pageProps} session={session} />
      <DMButton onClick={() => setMessagesOpen(true)} hasNotification={hasNewMessage} />
      <MessagesPopup open={messagesOpen} onClose={() => setMessagesOpen(false)} userId={session?.user?.id} />
    </>
  );
}

export default MyApp;
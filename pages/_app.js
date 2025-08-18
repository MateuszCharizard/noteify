import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import '../styles/globals.css';
import dynamic from 'next/dynamic';
import { useEffect as useEffect2, useState as useState2 } from 'react';
const DMButton = dynamic(() => import('../components/DMButton'), { ssr: false });
const ProfileBox = dynamic(() => import('../components/ProfileBox'), { ssr: false });
import { fetchConversations, fetchMessages, sendMessage } from '../components/chatApi';

function MessagesPopup({ open, onClose, userId }) {
  const [conversations, setConversations] = useState2([]);
  const [selected, setSelected] = useState2(null);
  const [messages, setMessages] = useState2([]);
  const [input, setInput] = useState2('');
  const [loading, setLoading] = useState2(false);
  useEffect2(() => {
    if (open && userId) {
      fetchConversations(userId).then(setConversations);
    }
  }, [open, userId]);
  useEffect2(() => {
    if (selected) {
      fetchMessages(selected.id).then(setMessages);
    }
  }, [selected]);
  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim() || !selected) return;
    setLoading(true);
    await sendMessage(selected.id, userId, input.trim());
    setInput('');
    fetchMessages(selected.id).then(setMessages);
    setLoading(false);
  }
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end bg-black/30" onClick={onClose}>
      <div
        className="relative bg-[var(--color-background)] rounded-t-2xl shadow-2xl border border-[var(--color-border)] w-full max-w-md p-4 flex flex-col h-[70vh] mr-6 mb-20"
        style={{ background: 'rgba(30,41,59,0.98)' }}
        onClick={e => e.stopPropagation()}
      >
        <button className="absolute top-3 right-3 text-xl text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]" onClick={onClose}>&times;</button>
        <div className="font-bold text-lg text-white mb-2">Direct Messages</div>
        <div className="flex-1 flex overflow-hidden">
          <div className="w-1/3 border-r border-[var(--color-border)] overflow-y-auto">
            {conversations.length === 0 && <div className="text-[var(--color-text-secondary)] text-center mt-8">No conversations</div>}
            {conversations.map(conv => (
              <div key={conv.id} className={`p-2 cursor-pointer hover:bg-black/20 ${selected && selected.id === conv.id ? 'bg-black/30' : ''}`} onClick={() => setSelected(conv)}>
                <div className="font-semibold text-white">{conv.participants?.find(u => u.id !== userId)?.username || 'User'}</div>
                <div className="text-xs text-[var(--color-text-secondary)] truncate">{conv.last_message || 'No messages yet'}</div>
              </div>
            ))}
          </div>
          <div className="flex-1 flex flex-col">
            {selected ? (
              <>
                <div className="flex-1 overflow-y-auto p-2">
                  {messages.map(msg => (
                    <div key={msg.id} className={`mb-2 flex ${msg.sender_id === userId ? 'justify-end' : 'justify-start'}`}>
                      <div className={`rounded-lg px-3 py-2 max-w-xs ${msg.sender_id === userId ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white'}`}>{msg.content}</div>
                    </div>
                  ))}
                </div>
                <form className="flex gap-2 mt-2" onSubmit={handleSend}>
                  <input className="flex-1 rounded bg-black/30 border border-[var(--color-border)] px-3 py-2 text-white placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Type a message..." value={input} onChange={e => setInput(e.target.value)} disabled={loading} />
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50" disabled={loading || !input.trim()}>Send</button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-[var(--color-text-secondary)]">Select a conversation</div>
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

  // Show loading screen while checking auth
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
      <DMButton onClick={() => setMessagesOpen(true)} />
      <MessagesPopup open={messagesOpen} onClose={() => setMessagesOpen(false)} userId={session?.user?.id} />
    </>
  );
}

export default MyApp;
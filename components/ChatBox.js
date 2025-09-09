import React, { useRef, useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Fetch conversations for a user
async function fetchConversations(userId) {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('id, participant_ids, created_at')
      .contains('participant_ids', [userId])
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw new Error('Failed to fetch conversations');
  }
}

// Fetch messages for a conversation
async function fetchMessages(conversationId) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('id, conversation_id, sender_id, content, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw new Error('Failed to fetch messages');
  }
}

// Fetch profiles by IDs
async function fetchProfileById(userIds) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url')
      .in('id', userIds);
    if (error) throw error;
    return Object.fromEntries(data.map(profile => [profile.id, profile]));
  } catch (error) {
    console.error('Error fetching profiles:', error);
    throw new Error('Failed to fetch profiles');
  }
}

// Send a message
async function sendMessage(conversationId, senderId, content) {
  try {
    const { error } = await supabase
      .from('messages')
      .insert({ conversation_id: conversationId, sender_id: senderId, content });
    if (error) throw error;
  } catch (error) {
    console.error('Error sending message:', error);
    throw new Error('Failed to send message');
  }
}

export default function ChatBox(props) {
  const {
    messages: controlledMessages,
    onSend: controlledOnSend,
    input: controlledInput,
    setInput: controlledSetInput,
    loading: controlledLoading,
    theme = 'dark',
    userId,
    conversationProfiles: controlledProfiles,
    selected: controlledSelected,
    conversations: controlledConversations,
    onSelectConversation: controlledOnSelectConversation
  } = props;

  const isControlled = controlledMessages !== undefined && controlledOnSend !== undefined;
  const isDark = theme === 'dark' || theme === 'sunset' || theme === 'forest';
  const messagesEndRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // State for uncontrolled mode
  const [conversations, setConversations] = useState([]);
  const [conversationProfiles, setConversationProfiles] = useState({});
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Theme variables (aligned with NotesPage)
  const themes = useMemo(
    () => ({
      light: {
        '--color-background': '#f9fafb',
        '--color-bg-sidebar': 'rgba(249, 250, 251, 0.8)',
        '--color-bg-subtle': '#f3f4f6',
        '--color-bg-subtle-hover': '#e5e7eb',
        '--color-text-primary': '#171717',
        '--color-text-secondary': '#6b7280',
        '--color-border': '#e5e7eb',
        '--color-brand': '#3b82f6',
        '--color-brand-hover': '#2563eb'
      },
      dark: {
        '--color-background': '#0a0a0a',
        '--color-bg-sidebar': 'rgba(10, 10, 10, 0.8)',
        '--color-bg-subtle': '#171717',
        '--color-bg-subtle-hover': '#262626',
        '--color-text-primary': '#f5f5f5',
        '--color-text-secondary': '#a3a3a3',
        '--color-border': '#262626',
        '--color-brand': '#3b82f6',
        '--color-brand-hover': '#2563eb'
      },
      sunset: {
        '--color-background': '#0f172a',
        '--color-bg-sidebar': 'rgba(15, 23, 42, 0.8)',
        '--color-bg-subtle': '#1e293b',
        '--color-bg-subtle-hover': '#334155',
        '--color-text-primary': '#f1f5f9',
        '--color-text-secondary': '#94a3b8',
        '--color-border': '#334155',
        '--color-brand': '#fb923c',
        '--color-brand-hover': '#f97316'
      },
      forest: {
        '--color-background': '#1a201c',
        '--color-bg-sidebar': 'rgba(26, 32, 28, 0.8)',
        '--color-bg-subtle': '#2d3831',
        '--color-bg-subtle-hover': '#3a4a40',
        '--color-text-primary': '#e8f5e9',
        '--color-text-secondary': '#a5d6a7',
        '--color-border': '#3a4a40',
        '--color-brand': '#66bb6a',
        '--color-brand-hover': '#4caf50'
      }
    }),
    []
  );

  // Apply theme
  useEffect(() => {
    const selectedTheme = themes[theme] || themes.dark;
    document.documentElement.setAttribute('data-theme', theme);
    Object.entries(selectedTheme).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
  }, [theme, themes]);

  // Fetch conversations and profiles
  useEffect(() => {
    if (!userId || isControlled) return;
    setLoading(true);
    fetchConversations(userId)
      .then(async (convs) => {
        setConversations(convs);
        const ids = Array.from(new Set(convs.flatMap(c => c.participant_ids).filter(id => id !== userId)));
        if (ids.length > 0) {
          const profiles = await fetchProfileById(ids);
          setConversationProfiles(profiles);
        }
        if (convs.length > 0 && !selected) {
          setSelected(convs[0]);
        }
      })
      .catch((error) => {
        setToastMessage(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userId, isControlled, selected]);

  // Fetch messages when conversation selected
  useEffect(() => {
    if (!userId || isControlled || !selected) return;
    fetchMessages(selected.id)
      .then(setMessages)
      .catch((error) => {
        setToastMessage(error.message);
      });
  }, [selected, userId, isControlled]);

  // Realtime subscription for messages
  useEffect(() => {
    if (!userId || isControlled || !selected) return;
    const channel = supabase
      .channel(`messages:${selected.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selected.id}`
        },
        () => {
          fetchMessages(selected.id)
            .then(setMessages)
            .catch((error) => setToastMessage(error.message));
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [selected, userId, isControlled]);

  // Realtime subscription for conversations
  useEffect(() => {
    if (!userId || isControlled) return;
    const channel = supabase
      .channel('conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `participant_ids=cs.{${userId}}`
        },
        () => {
          fetchConversations(userId)
            .then((convs) => {
              setConversations(convs);
              if (!selected && convs.length > 0) {
                setSelected(convs[0]);
              }
            })
            .catch((error) => setToastMessage(error.message));
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, isControlled, selected]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isControlled ? controlledMessages : messages]);

  // Send message handler
  async function handleSend(e) {
    e.preventDefault();
    const currentInput = isControlled ? controlledInput : input;
    if (!currentInput.trim() || !(isControlled ? controlledSelected : selected)) return;
    if (isControlled) {
      controlledOnSend(e);
      return;
    }
    setLoading(true);
    try {
      await sendMessage(selected.id, userId, currentInput.trim());
      setInput('');
      setToastMessage('Message sent!');
    } catch (error) {
      setToastMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  // Toast auto-dismiss
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Render
  const convs = isControlled ? (controlledConversations || []) : conversations;
  const profiles = isControlled ? (controlledProfiles || {}) : conversationProfiles;
  const sel = isControlled ? controlledSelected : selected;
  const msgs = isControlled ? (controlledMessages || []) : messages;
  const inp = isControlled ? controlledInput : input;
  const setInp = isControlled ? controlledSetInput : setInput;
  const load = isControlled ? controlledLoading : loading;
  const selectConv = isControlled ? controlledOnSelectConversation : setSelected;

  return (
    <div
      className="flex h-full w-full rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-lg transition-colors duration-300 animate-fade-in"
      style={{ background: 'var(--color-background)' }}
    >
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-xs sm:max-w-sm animate-toast-in">
          <div className="bg-neutral-800 text-white px-4 sm:px-6 py-2 rounded-full shadow-lg text-xs sm:text-sm font-medium">
            {toastMessage}
          </div>
        </div>
      )}

      <aside
        className={`fixed lg:static z-30 w-72 flex-shrink-0 h-full border-r border-[var(--color-border)] bg-[var(--color-bg-sidebar)] backdrop-blur-sm flex flex-col transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 lg:translate-x-0 lg:opacity-100'
        }`}
      >
        <div className="p-5 font-bold text-xl border-b border-[var(--color-border)] tracking-wide text-[var(--color-text-primary)] flex items-center justify-between">
          <span>Chats</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle-hover)] transition-transform duration-200 hover:scale-105"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 sm:w-5 h-4 sm:h-5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <ul className="overflow-y-auto flex-1">
          {convs.length === 0 && (
            <li className="p-6 text-[var(--color-text-secondary)] text-center animate-fade-in">No conversations</li>
          )}
          {convs.map((conv, index) => {
            const otherId = conv.participant_ids.find(id => id !== userId);
            const p = profiles[otherId] || {};
            const isSelected = sel && conv.id === sel.id;
            return (
              <li
                key={conv.id}
                className={`flex items-center gap-3 px-5 py-4 cursor-pointer transition-all rounded-xl mb-1 animate-slide-in ${
                  isSelected ? 'bg-[var(--color-bg-subtle-hover)]' : 'hover:bg-[var(--color-bg-subtle)] hover:scale-[1.02]'
                }`}
                style={{ color: 'var(--color-text-primary)', animationDelay: `${index * 50}ms` }}
                onClick={() => {
                  selectConv(conv);
                  setSidebarOpen(false);
                }}
              >
                <img
                  src={p.avatar_url || `https://avatar.vercel.sh/${p.username || 'U'}.png?size=40`}
                  alt="avatar"
                  className="w-11 h-11 rounded-full object-cover border-2 border-[var(--color-border)] transition-transform duration-200 hover:scale-110"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{p.full_name || p.username || 'User'}</div>
                  <div className="text-xs text-[var(--color-text-secondary)] truncate">
                    {conv.last_message?.content?.slice(0, 40) || 'No messages yet'}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </aside>

      <div className="flex-1 flex flex-col bg-[var(--color-background)]">
        <header className="flex-shrink-0 p-3 sm:p-4 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)] animate-fade-in">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md hover:bg-[var(--color-bg-subtle-hover)] transition-transform duration-200 hover:scale-105 lg:hidden"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 sm:w-5 h-4 sm:h-5">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          {sel && (
            <div className="flex items-center gap-4">
              <img
                src={(() => {
                  const otherId = sel.participant_ids.find(id => id !== userId);
                  const p = profiles[otherId] || {};
                  return p.avatar_url || `https://avatar.vercel.sh/${p.username || 'U'}.png?size=40`;
                })()}
                alt="avatar"
                className="w-11 h-11 rounded-full object-cover border-2 border-[var(--color-border)] transition-transform duration-200 hover:scale-110"
              />
              <div className="font-semibold text-lg" style={{ color: 'var(--color-text-primary)' }}>
                {(() => {
                  const otherId = sel.participant_ids.find(id => id !== userId);
                  const p = profiles[otherId] || {};
                  return p.full_name || p.username || 'User';
                })()}
              </div>
            </div>
          )}
        </header>
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-3 bg-[var(--color-background)] animate-message-area-in">
          {sel ? (
            msgs.length === 0 ? (
              <div className="text-center text-[var(--color-text-secondary)] mt-10 animate-fade-in">
                No messages yet. Say hi!
              </div>
            ) : (
              msgs.map((msg, index) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_id === userId ? 'justify-end' : 'justify-start'} animate-message-in`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div
                    className={`rounded-2xl px-5 py-3 max-w-xl shadow-md ${
                      msg.sender_id === userId
                        ? isDark
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-500 text-white'
                        : isDark
                        ? 'bg-gray-700 text-white'
                        : 'bg-gray-200 text-gray-900'
                    } break-words transition-all duration-200 hover:scale-[1.02]`}
                    style={{ fontSize: '1rem', lineHeight: '1.5' }}
                  >
                    {msg.content}
                  </div>
                </div>
              ))
            )
          ) : (
            <div className="flex-1 flex items-center justify-center text-lg text-[var(--color-text-secondary)] animate-fade-in">
              Select a chat
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        {sel && (
          <form
            className="flex gap-3 p-6 border-t border-[var(--color-border)] bg-[var(--color-bg-subtle)] animate-slide-up"
            onSubmit={handleSend}
          >
            <input
              className="flex-1 rounded-full border border-[var(--color-border)] px-5 py-3 bg-[var(--color-background)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] transition-transform duration-200 hover:scale-[1.02]"
              placeholder="Type a message..."
              value={inp}
              onChange={(e) => setInp(e.target.value)}
              disabled={load}
              autoComplete="off"
            />
            <button
              className="px-6 py-3 rounded-full font-semibold bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white shadow-md transition-transform duration-200 hover:scale-105 disabled:opacity-50"
              disabled={load || !inp.trim()}
              type="submit"
            >
              Send
            </button>
          </form>
        )}
      </div>

      <style jsx global>{`
        .dark .prose-headings,
        .dark .prose-p,
        .dark .prose-strong,
        .dark .prose-li,
        .dark .prose-code {
          color: var(--color-text-primary);
        }
        .dark .prose-blockquote {
          color: var(--color-text-secondary);
        }
        .dark .prose-a {
          color: var(--color-brand);
        }

        /* Sidebar Animation */
        aside {
          transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms ease-in-out;
        }

        /* Animations */
        .animate-fade-in {
          animation: fade-in 300ms ease-out forwards;
        }
        .animate-slide-in {
          animation: slide-in 300ms ease-out forwards;
          opacity: 0;
          transform: translateX(-20px);
        }
        .animate-message-in {
          animation: message-in 300ms ease-out forwards;
          opacity: 0;
          transform: translateY(10px);
        }
        .animate-message-area-in {
          animation: fade-in 300ms ease-out forwards;
        }
        .animate-slide-up {
          animation: slide-up 300ms ease-out forwards;
        }
        .animate-toast-in {
          animation: toast-in 300ms ease-out forwards;
        }
        .animate-toast-in:not(:hover) {
          animation: toast-in 300ms ease-out, toast-out 300ms ease-in 2700ms forwards;
        }

        /* Keyframes */
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes message-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes toast-in {
          from { opacity: 0; transform: translate(-50%, 20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes toast-out {
          from { opacity: 1; transform: translate(-50%, 0); }
          to { opacity: 0; transform: translate(-50%, 20px); }
        }
      `}</style>
    </div>
  );
}
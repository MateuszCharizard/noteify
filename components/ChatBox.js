
import React, { useRef, useEffect, useState } from 'react';
import { fetchConversations, fetchMessages, sendMessage } from './chatApi';
import { fetchProfileById } from './fetchProfile';
import { createClient } from '@supabase/supabase-js';


// Now supports sidebar theming


// If userId is provided and no controlled props, fetch all chat data from Supabase
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

  // Uncontrolled state (fetch from Supabase)
  const [conversations, setConversations] = useState([]);
  const [conversationProfiles, setConversationProfiles] = useState({});
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Supabase realtime
  const supabase = React.useMemo(() => {
    return typeof window === 'undefined'
      ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
      : createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  }, []);

  // Fetch conversations and profiles
  useEffect(() => {
    if (!userId || isControlled) return;
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
  }, [userId, isControlled]);

  // Fetch messages when conversation selected
  useEffect(() => {
    if (!userId || isControlled) return;
    if (selected) {
      fetchMessages(selected.id).then(setMessages);
    }
  }, [selected, userId, isControlled]);

  // Realtime subscription for messages
  useEffect(() => {
    if (!userId || isControlled) return;
    if (!selected) return;
    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `conversation_id=eq.${selected.id}` }, (payload) => {
        fetchMessages(selected.id).then(setMessages);
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [selected, userId, isControlled, supabase]);

  // Realtime subscription for conversations
  useEffect(() => {
    if (!userId || isControlled) return;
    const channel = supabase
      .channel('public:conversations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, (payload) => {
        fetchConversations(userId).then(setConversations);
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, isControlled, supabase]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isControlled ? controlledMessages : messages, isControlled ? controlledSelected : selected]);

  // Send message handler
  async function handleSend(e) {
    e.preventDefault();
    if (!(isControlled ? controlledInput : input).trim() || !(isControlled ? controlledSelected : selected)) return;
    if (isControlled) {
      controlledOnSend(e);
      return;
    }
    setLoading(true);
    await sendMessage((selected).id, userId, input.trim());
    setInput('');
    setLoading(false);
  }

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
    <div className="flex h-full w-full rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-lg" style={{background: 'var(--color-background)'}}>
      {/* Sidebar: list of people/conversations */}
      <aside
        className="w-72 flex-shrink-0 h-full border-r border-[var(--color-border)] bg-[var(--color-bg-sidebar)] flex flex-col"
      >
        <div className="p-5 font-bold text-xl border-b border-[var(--color-border)] tracking-wide">Chats</div>
        <ul className="overflow-y-auto flex-1">
          {convs.length === 0 && (
            <li className="p-6 text-[var(--color-text-secondary)] text-center">No conversations</li>
          )}
          {convs.map(conv => {
            const otherId = conv.participant_ids.find(id => id !== userId);
            const p = profiles[otherId];
            const isSelected = sel && conv.id === sel.id;
            return (
              <li
                key={conv.id}
                className={`flex items-center gap-3 px-5 py-4 cursor-pointer transition-all rounded-xl mb-1 ${isSelected ? 'bg-[var(--color-bg-subtle-hover)]' : 'hover:bg-[var(--color-bg-subtle)]'}`}
                style={{ color: 'var(--color-text-primary)' }}
                onClick={() => selectConv(conv)}
              >
                <img
                  src={p?.avatar_url || `https://avatar.vercel.sh/${p?.username || 'U'}.png?size=40`}
                  alt="avatar"
                  className="w-11 h-11 rounded-full object-cover border-2 border-[var(--color-border)]"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{p?.full_name || p?.username || 'User'}</div>
                  <div className="text-xs text-[var(--color-text-secondary)] truncate">{conv.last_message?.content?.slice(0, 40) || 'No messages yet'}</div>
                </div>
              </li>
            );
          })}
        </ul>
      </aside>
      {/* Chat area */}
      <div className="flex-1 flex flex-col bg-[var(--color-background)]">
        {sel ? (
          <>
            <div className="flex items-center gap-4 border-b border-[var(--color-border)] px-8 py-5 bg-[var(--color-bg-subtle)]">
              <img src={(() => { const otherId = sel.participant_ids.find(id => id !== userId); const p = profiles[otherId]; return p?.avatar_url || `https://avatar.vercel.sh/${p?.username || 'U'}.png?size=40`; })()} alt="avatar" className="w-11 h-11 rounded-full object-cover border-2 border-[var(--color-border)]" />
              <div className="font-semibold text-lg" style={{color: 'var(--color-text-primary)'}}>{(() => { const otherId = sel.participant_ids.find(id => id !== userId); const p = profiles[otherId]; return p?.full_name || p?.username || 'User'; })()}</div>
            </div>
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-3 bg-[var(--color-background)]">
              {msgs.length === 0 && (
                <div className="text-center text-[var(--color-text-secondary)] mt-10">No messages yet. Say hi!</div>
              )}
              {msgs.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender_id === userId ? 'justify-end' : 'justify-start'}`}>
                  <div className={`rounded-2xl px-5 py-3 max-w-xl shadow-md ${msg.sender_id === userId ? (isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white') : (isDark ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-900')} break-words`} style={{fontSize: '1rem', lineHeight: '1.5'}}>{msg.content}</div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form className="flex gap-3 p-6 border-t border-[var(--color-border)] bg-[var(--color-bg-subtle)]" onSubmit={handleSend}>
              <input
                className={`flex-1 rounded-full border border-[var(--color-border)] px-5 py-3 bg-[var(--color-background)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]`}
                placeholder="Type a message..."
                value={inp}
                onChange={e => setInp(e.target.value)}
                disabled={load}
                autoComplete="off"
              />
              <button
                className={`px-6 py-3 rounded-full font-semibold bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white shadow-md transition-all disabled:opacity-50`}
                disabled={load || !inp.trim()}
                type="submit"
              >
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-lg text-[var(--color-text-secondary)]">Select a chat</div>
        )}
      </div>
    </div>
  );
}

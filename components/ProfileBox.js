import React, { useState, useEffect } from 'react';
import { startConversation, sendMessage } from './chatApi';

/**
 * ProfileBox - A Discord-style profile popup component.
 * Props:
 *   - profile: { avatar_url, full_name, username, id, badges, bio, role }
 *   - onClose: function to close the box
 */
export default function ProfileBox({ profile, onClose, currentUserId }) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
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
  if (!profile) return null;
  const isSelf = currentUserId === profile.id;

  const badgeMap = {
    'Bug Hunter': { img: 'https://i.imgur.com/fe4vkds.png', label: 'Bug Hunter' },
    'Premium': { img: 'https://i.imgur.com/Z05yrUp.png', label: 'Premium' },
    'Staff': { img: 'https://i.imgur.com/fapDrDU.png', label: 'Staff' },
    'Partner': { img: 'https://i.imgur.com/F5JLVzH.png', label: 'Partner' },
    'CEO': { img: 'https://i.imgur.com/UrBm8WI.png', label: 'CEO' },
  };
  const badgeList = Array.isArray(profile.badges)
    ? profile.badges
    : (profile.badges || '').split(',').map(b => b.trim()).filter(Boolean);
  const avatarSrc = profile.avatar_url || `https://avatar.vercel.sh/${profile.username || 'A'}.png?size=128`;

  async function handleSendMessage(e) {
    e.preventDefault();
    if (!message.trim() || sending) return;
    setSending(true);
    setError(null);
    try {
      // Start or get conversation
      const convo = await startConversation(currentUserId, profile.id);
      await sendMessage(convo.id, currentUserId, message.trim());
      setSent(true);
      setMessage('');
    } catch (err) {
      setError('Failed to send message.');
    } finally {
      setSending(false);
    }
  }
  const isDark = theme === 'dark' || theme === 'sunset' || theme === 'forest';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className={`relative rounded-2xl shadow-2xl w-80 max-w-full p-6 flex flex-col items-center text-center ${isDark ? 'bg-[#232a36]' : 'bg-white'}`}
        style={{ background: isDark ? 'rgba(30,41,59,0.98)' : '#fff' }}
        onClick={e => e.stopPropagation()}
      >
        <button className="absolute top-3 right-3 text-xl text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]" onClick={onClose}>&times;</button>
        <img
          src={avatarSrc}
          alt="Profile"
          className="w-24 h-24 rounded-full object-cover mb-3"
        />
        <div className={`font-bold text-xl flex items-center gap-2 justify-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {profile.full_name || profile.username || 'User'}
        </div>
        <div className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{profile.username && `@${profile.username}`}</div>
        <div className="flex flex-wrap gap-2 justify-center mb-2">
          {badgeList.map(badge => badgeMap[badge] && (
            <span key={badge} className="relative group">
              <img
                src={badgeMap[badge].img}
                alt={badgeMap[badge].label}
                className="w-7 h-7 rounded-md  bg-transparent shadow"
              />
              <span className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute left-1/2 -translate-x-1/2 top-full mt-2 px-2 py-1 text-xs rounded bg-black text-white whitespace-nowrap z-20 shadow-lg">
                {badgeMap[badge].label}
              </span>
            </span>
          ))}
        </div>
        {profile.role && (
          <div className="mb-2">
            <span className="inline-block px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-semibold ">{profile.role}</span>
          </div>
        )}
  <div className={`text-sm mb-2 min-h-[2rem] ${isDark ? 'text-white' : 'text-gray-900'}`}>{profile.bio || 'No bio yet.'}</div>
        <form className="w-full mt-2 flex gap-2" onSubmit={handleSendMessage}>
          <input
            className={`flex-1 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-black/30 text-white placeholder:text-gray-400' : 'bg-gray-100 text-gray-900 placeholder:text-gray-400'}`}
            placeholder={isSelf ? 'You cannot message yourself' : `Message @${profile.username || ''}`}
            value={message}
            onChange={e => { setMessage(e.target.value); setSent(false); setError(null); }}
            disabled={sending || isSelf}
            maxLength={500}
            autoFocus
          />
          <button
            type="submit"
            className={`px-4 py-2 rounded font-semibold disabled:opacity-50 ${isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
            disabled={sending || !message.trim() || isSelf}
          >Send</button>
        </form>
  {isSelf && <div className="text-yellow-400 text-xs mt-1">You cannot message yourself.</div>}
  {sent && <div className="text-green-400 text-xs mt-1">Message sent!</div>}
  {error && <div className="text-red-400 text-xs mt-1">{error}</div>}
      </div>
      <style jsx global>{`
        .group:hover .group-hover\:opacity-100 {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
}

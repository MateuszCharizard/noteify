import React, { useEffect, useRef, useState } from 'react';

export default function DMButton({ onClick, hasNotification }) {
  const buttonRef = useRef(null);
  const [theme, setTheme] = useState('dark');
  useEffect(() => {
    // Listen for theme changes
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
  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg p-4 flex items-center justify-center focus:outline-none focus:ring-2"
      aria-label="Chats"
      style={{
        background: 'var(--color-brand)',
        color: '#fff',
        boxShadow: '0 4px 24px 0 rgba(0,0,0,0.18)',
        border: 'none',
        outline: 'none',
      }}
      onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 4px var(--color-brand)'}
      onBlur={e => e.currentTarget.style.boxShadow = '0 4px 24px 0 rgba(0,0,0,0.18)'}
    >
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
        <path d="M21 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5v-11A2.5 2.5 0 0 1 5.5 4h13A2.5 2.5 0 0 1 21 6.5Zm-2.5-1h-13A1.5 1.5 0 0 0 4 6.5v11A1.5 1.5 0 0 0 5.5 19h13a1.5 1.5 0 0 0 1.5-1.5v-11A1.5 1.5 0 0 0 18.5 5.5Zm-1.7 5.2a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0l-3.25-3.25a.75.75 0 1 1 1.06-1.06l2.72 2.72 2.72-2.72a.75.75 0 0 1 1.06 0Z" fill="currentColor"/>
      </svg>
      {hasNotification && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold animate-pulse">!</span>
      )}
    </button>
  );
}

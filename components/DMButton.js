import React, { useEffect, useRef } from 'react';

export default function DMButton({ onClick }) {
  const buttonRef = useRef(null);

  useEffect(() => {
    // Optional: focus or animation logic
  }, []);

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-400"
      aria-label="Direct Messages"
      style={{ boxShadow: '0 4px 24px 0 rgba(0,0,0,0.18)' }}
    >
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
        <path d="M21 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5v-11A2.5 2.5 0 0 1 5.5 4h13A2.5 2.5 0 0 1 21 6.5Zm-2.5-1h-13A1.5 1.5 0 0 0 4 6.5v11A1.5 1.5 0 0 0 5.5 19h13a1.5 1.5 0 0 0 1.5-1.5v-11A1.5 1.5 0 0 0 18.5 5.5Zm-1.7 5.2a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0l-3.25-3.25a.75.75 0 1 1 1.06-1.06l2.72 2.72 2.72-2.72a.75.75 0 0 1 1.06 0Z" fill="currentColor"/>
      </svg>
    </button>
  );
}

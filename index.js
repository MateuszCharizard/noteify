import { createClient } from '@supabase/supabase-js';
import { showLogin, showNotes, showSettings } from './ui';
import { getUser } from './login';

const supabaseUrl = 'https://YOUR_SUPABASE_URL.supabase.co';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
export const supabase = createClient(supabaseUrl, supabaseKey);

export function animateIn(element) {
  // ...existing code...
  element.style.opacity = 0;
  element.style.transform = 'translateY(20px)';
  requestAnimationFrame(() => {
    element.style.transition = 'all 0.4s cubic-bezier(.4,0,.2,1)';
    element.style.opacity = 1;
    element.style.transform = 'translateY(0)';
  });
}

// Only run routing and DOM code in the browser
if (typeof window !== 'undefined') {
  function route() {
    const hash = window.location.hash;
    if (!getUser()) {
      showLogin();
      return;
    }
    if (hash.startsWith('#settings')) {
      showSettings();
    } else {
      showNotes();
    }
  }

  window.addEventListener('hashchange', route);
  window.addEventListener('DOMContentLoaded', route);
}
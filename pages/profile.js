import React, { useEffect, useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import * as THREE from 'three';

// This is a stand-in for Next.js's Head component for this environment.
const Head = ({ children }) => {
  useEffect(() => {
    const childrenArray = React.Children.toArray(children);
    const title = childrenArray.find(c => c.type === 'title')?.props.children;
    if (title) document.title = title;
  }, [children]);
  return null;
};

// This is a stand-in for Next.js's Link component for this environment.
const Link = ({ href, children, ...props }) => <a href={href} {...props}>{children}</a>;

// Initialize Supabase with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- SVG ICONS ---
const SunIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>;
const MoonIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>;
const CameraIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>
);
const SpinnerIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin" {...props}><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
);


export default function ProfilePage() {
  const [theme, setTheme] = useState('light');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [updateMessage, setUpdateMessage] = useState({ text: '', type: 'success' });
  const backgroundRef = useRef(null);

  // States for form inputs
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');

  // Theme Management
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const userPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (userPrefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  // Profile Data Fetching
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/auth';
        return;
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) {
        console.error('Error fetching profile:', error);
      } else if (data) {
        setProfile(data);
        setUsername(data.username || '');
        setFullName(data.full_name || '');
        setBio(data.bio || '');
        if (!data.username) {
          setIsEditing(true);
          setUpdateMessage({ text: "Welcome! Please complete your profile.", type: 'success' });
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  // Three.js background effect
  useEffect(() => {
    // ... (3D background code remains the same)
  }, [theme]);

  // Handlers
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const updates = { id: user.id, username, full_name: fullName, bio, updated_at: new Date() };
      const { data: updatedProfile, error } = await supabase.from('profiles').upsert(updates).eq('id', user.id).select().single();
      if (error) {
        setUpdateMessage({ text: `Error: ${error.message}`, type: 'error' });
      } else {
        setProfile(updatedProfile);
        setUpdateMessage({ text: 'Profile updated successfully!', type: 'success' });
        setIsEditing(false);
      }
      setIsSubmitting(false);
      setTimeout(() => setUpdateMessage({ text: '', type: 'success' }), 3000);
    }
  };
  
  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 1 * 1024 * 1024) {
      setUpdateMessage({ text: "File is too large (max 1MB).", type: 'error' });
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setIsSubmitting(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64String = reader.result;
      const { error } = await supabase.from('profiles').update({ avatar_url: base64String }).eq('id', user.id);
      if (error) {
        setUpdateMessage({ text: `Error: ${error.message}`, type: 'error' });
      } else {
        setProfile(prevProfile => ({ ...prevProfile, avatar_url: base64String }));
        setUpdateMessage({ text: 'Avatar updated!', type: 'success' });
      }
      setIsSubmitting(false);
      setTimeout(() => setUpdateMessage({ text: '', type: 'success' }), 3000);
    };
    reader.onerror = () => {
      setUpdateMessage({ text: "Could not read the selected file.", type: 'error' });
      setIsSubmitting(false);
    };
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/auth';
  };
  
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  if (loading) {
    return <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center"><SpinnerIcon /></div>;
  }

  const avatarSrc = profile?.avatar_url || `https://avatar.vercel.sh/${username || 'A'}.png?size=128`;

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)] transition-colors duration-300 flex flex-col items-center relative overflow-hidden font-sans">
      <Head>
        <title>Noteify - Your Profile</title>
      </Head>
      <div id="background" ref={backgroundRef} className="absolute inset-0 z-0"></div>
      
      <header className="w-full max-w-7xl mx-auto px-6 py-4 flex justify-between items-center z-20">
        <Link href="/" className="px-4 py-2 text-sm font-semibold rounded-lg bg-[var(--color-bg-subtle)] hover:bg-[var(--color-bg-subtle-hover)] transition-colors">
          Home
        </Link>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            role="switch"
            aria-checked={theme === 'dark'}
            className={`relative inline-flex items-center h-8 w-14 rounded-full p-1 transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-brand)] focus:ring-offset-[var(--color-background)] bg-[var(--color-switch-track)]`}
          >
            <span className="sr-only">Toggle theme</span>
            {/* --- FIX: Cleaned up classes for perfect centering --- */}
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
                theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
              }`}
            >
              {theme === 'dark' 
                ? <MoonIcon className="h-4 w-4 text-[var(--color-switch-icon)]" /> 
                : <SunIcon className="h-4 w-4 text-[var(--color-switch-icon)]" />
              }
            </span>
          </button>
          
          <button onClick={handleSignOut} className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors">Sign Out</button>
        </div>
      </header>

      <main className="relative z-10 flex flex-col items-center justify-center w-full p-4 flex-grow">
        <div className="w-full max-w-lg bg-[var(--color-bg-subtle-translucent)] backdrop-blur-md rounded-2xl shadow-lg p-8 border border-[var(--color-border)]">
          <div className="flex flex-col items-center mb-6">
            <label className="relative w-32 h-32 rounded-full cursor-pointer group flex items-center justify-center mb-4">
              <input type="file" accept="image/png, image/jpeg" onChange={handleProfilePicChange} disabled={isSubmitting} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <div className={`w-full h-full rounded-full transition-all duration-300 ${!profile?.avatar_url ? 'bg-[var(--color-bg-subtle)]' : ''}`}>
                <img src={avatarSrc} alt="Profile" className="w-full h-full rounded-full object-cover border-2 border-[var(--color-border)]" />
              </div>
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                <CameraIcon />
              </div>
            </label>
            <h1 className="text-3xl font-bold">{fullName || username || 'New User'}</h1>
            <p className="text-[var(--color-text-secondary)]">@{username || 'username'}</p>
          </div>

          {updateMessage.text && <p className={`text-center mb-4 text-sm ${updateMessage.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>{updateMessage.text}</p>}

          {isEditing ? (
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              {['Full Name', 'Username', 'Bio'].map(field => (
                  <div key={field}>
                    <label className="block text-sm font-semibold mb-1 text-[var(--color-text-secondary)]">{field}</label>
                    {field === 'Bio' ? (
                        <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="w-full px-3 py-2 bg-transparent border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] resize-y" rows="3"></textarea>
                    ) : (
                        <input type="text" value={field === 'Full Name' ? fullName : username} onChange={e => (field === 'Full Name' ? setFullName(e.target.value) : setUsername(e.target.value))} className="w-full px-3 py-2 bg-transparent border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]" />
                    )}
                  </div>
              ))}
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsEditing(false)} disabled={isSubmitting} className="w-full px-6 py-2 bg-[var(--color-bg-subtle)] rounded-full font-semibold hover:bg-[var(--color-bg-subtle-hover)] transition-colors disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="w-full px-6 py-2 bg-[var(--color-brand)] text-white rounded-full font-semibold hover:bg-[var(--color-brand-hover)] transition-colors disabled:opacity-50 flex items-center justify-center">
                    {isSubmitting ? <SpinnerIcon className="w-5 h-5"/> : 'Save'}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-[var(--color-text-primary)] min-h-[4rem]">{bio || 'No bio yet. Click Edit to add one!'}</p>
              <p className="text-sm text-[var(--color-text-secondary)]">Email: {profile?.email}</p>
              <button onClick={() => setIsEditing(true)} className="w-full px-6 py-3 bg-[var(--color-bg-subtle)] rounded-full font-semibold hover:bg-[var(--color-bg-subtle-hover)] transition-colors">Edit Profile</button>
            </div>
          )}
        </div>
      </main>
      
      <style jsx global>{`
        :root {
          --color-background: #f9fafb;
          --color-bg-subtle: #f3f4f6;
          --color-bg-subtle-hover: #e5e7eb;
          --color-bg-subtle-translucent: rgba(249, 250, 251, 0.8);
          --color-text-primary: #171717;
          --color-text-secondary: #6b7280;
          --color-border: #e5e7eb;
          --color-brand: #3b82f6;
          --color-brand-hover: #2563eb;
          /* New variables for the switch */
          --color-switch-track: #fcd34d; /* amber-300 */
          --color-switch-icon: #f59e0b; /* amber-500 */
        }
        .dark {
          --color-background: #0a0a0a;
          --color-bg-subtle: #171717;
          --color-bg-subtle-hover: #262626;
          --color-bg-subtle-translucent: rgba(10, 10, 10, 0.8);
          --color-text-primary: #f5f5f5;
          --color-text-secondary: #a3a3a3;
          --color-border: #262626;
          --color-brand: #3b82f6;
          --color-brand-hover: #60a5fa;
          /* New variables for the switch */
          --color-switch-track: #4f46e5; /* indigo-600 */
          --color-switch-icon: #c7d2fe; /* indigo-200 */
        }
      `}</style>
    </div>
  );
}
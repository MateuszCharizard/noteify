import React, { useEffect, useState, Suspense, lazy } from 'react';
import { createClient } from '@supabase/supabase-js';
import Navbar from '../components/Navbar';
const Avatar = lazy(() => import('../components/Avatar'));

// Stand-in for Next.js's Head component
const Head = ({ children }) => {
  useEffect(() => {
    const childrenArray = React.Children.toArray(children);
    const title = childrenArray.find(c => c.type === 'title')?.props.children;
    if (title) document.title = title;
  }, [children]);
  return null;
};

// Stand-in for Next.js's Link component
const Link = ({ href, children, ...props }) => <a href={href} {...props}>{children}</a>;

// SVG Icons
export const SunIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4"></circle>
    <path d="M12 2v2"></path>
    <path d="M12 20v2"></path>
    <path d="m4.93 4.93 1.41 1.41"></path>
    <path d="m17.66 17.66 1.41 1.41"></path>
    <path d="M2 12h2"></path>
    <path d="M20 12h2"></path>
    <path d="m6.34 17.66-1.41 1.41"></path>
    <path d="m19.07 4.93-1.41 1.41"></path>
  </svg>
);

export const MoonIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
  </svg>
);

const CameraIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
    <circle cx="12" cy="13" r="3"></circle>
  </svg>
);

const SpinnerIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin" {...props}>
    <line x1="12" y1="2" x2="12" y2="6"></line>
    <line x1="12" y1="18" x2="12" y2="22"></line>
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
    <line x1="2" y1="12" x2="6" y2="12"></line>
    <line x1="18" y1="12" x2="22" y2="12"></line>
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
  </svg>
);

// Initialize Supabase
const supabaseUrl = typeof window === 'undefined' ? process.env.SUPABASE_URL : process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = typeof window === 'undefined' ? process.env.SUPABASE_ANON_KEY : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ProfilePage() {
  const [theme, setTheme] = useState('light');
  const [profile, setProfile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [updateMessage, setUpdateMessage] = useState({ text: '', type: 'success' });
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');

  // Sync theme with document class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
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
          setUpdateMessage({ text: 'Welcome! Please complete your profile.', type: 'success' });
        }
      }
    };
    fetchProfile();
  }, []);

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
      setUpdateMessage({ text: 'File is too large (max 1MB).', type: 'error' });
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
        setProfile((prevProfile) => ({ ...prevProfile, avatar_url: base64String }));
        setUpdateMessage({ text: 'Avatar updated!', type: 'success' });
      }
      setIsSubmitting(false);
      setTimeout(() => setUpdateMessage({ text: '', type: 'success' }), 3000);
    };
    reader.onerror = () => {
      setUpdateMessage({ text: 'Could not read the selected file.', type: 'error' });
      setIsSubmitting(false);
    };
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/auth';
  };

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  // Skeleton loading state
  const [skeletonLoading, setSkeletonLoading] = useState(true);
  useEffect(() => {
    if (profile) setSkeletonLoading(false);
  }, [profile]);

  const avatarSrc = profile?.avatar_url || `https://avatar.vercel.sh/${username || 'A'}.png?size=128`;

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)] transition-colors duration-300 flex flex-col items-center relative overflow-hidden font-sans">
      <Head>
        <title>Noteify - Your Profile</title>
      </Head>
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <header className="w-full max-w-7xl mx-auto px-6 py-4 flex justify-between items-center z-20">
        <Link
          href="/"
          className="px-4 py-2 text-sm font-semibold rounded-lg bg-[var(--color-bg-subtle)] hover:bg-[var(--color-bg-subtle-hover)] transition-colors animate-scale-in"
          style={{ animationDelay: '0.1s' }}
        >
          Home
        </Link>
        <div className="flex items-center gap-4">
          <button
            onClick={handleSignOut}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors animate-fade-in"
            style={{ animationDelay: '0.3s' }}
          >
            Sign Out
          </button>
        </div>
      </header>
      <main className="relative z-10 flex flex-col items-center justify-center w-full p-4 flex-grow">
        <div
          className="w-full max-w-lg backdrop-blur-md rounded-2xl shadow-lg p-8 border border-[var(--color-border)] animate-scale-in-up"
          style={{
            background: typeof window !== 'undefined' && document.documentElement.classList.contains('dark')
              ? 'rgba(10,10,10,0.8)'
              : 'rgba(255,255,255,0.85)',
            animationDelay: '0.5s',
            transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
            transition: 'transform 400ms cubic-bezier(0.03, 0.98, 0.52, 0.99)'
          }}
        >
          {skeletonLoading ? (
            <div className="flex flex-col items-center mb-6 animate-pulse">
              <div className="w-32 h-32 rounded-full bg-gray-300 dark:bg-gray-700 mb-4" />
              <div className="h-8 w-40 bg-gray-300 dark:bg-gray-700 rounded mb-2" />
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded mb-4" />
              <div className="flex gap-2 mt-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-md bg-gray-200 dark:bg-gray-800" />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center mb-6">
              <label
                className="relative w-32 h-32 rounded-full cursor-pointer group flex items-center justify-center mb-4 animate-scale-in"
                style={{ animationDelay: '0.7s' }}
              >
                <input
                  type="file"
                  accept="image/png, image/jpeg"
                  onChange={handleProfilePicChange}
                  disabled={isSubmitting}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className={`w-full h-full rounded-full transition-all duration-300 ${!profile?.avatar_url ? 'bg-[var(--color-bg-subtle)]' : ''}`}>
                  <img src={avatarSrc} alt="Profile" loading="lazy" className="w-full h-full rounded-full object-cover border-2 border-[var(--color-border)]" />
                </div>
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                  <CameraIcon />
                </div>
              </label>
              <h1 className="text-3xl font-bold animate-fade-in-up" style={{ animationDelay: '0.9s' }}>
                {fullName || username || 'New User'}
              </h1>
              <p className="text-[var(--color-text-secondary)] animate-fade-in-up" style={{ animationDelay: '1s' }}>
                @{username || 'username'}
              </p>
              {/* Badges Row */}
              {profile?.badges && (
                <div className="flex flex-wrap gap-2 mt-2 justify-center">
                  {(() => {
                    const badgeMap = {
                      'Bug Hunter': { img: 'https://i.imgur.com/fe4vkds.png', label: 'Bug Hunter' },
                      Premium: { img: 'https://i.imgur.com/Z05yrUp.png', label: 'Premium' },
                      Staff: { img: 'https://i.imgur.com/fapDrDU.png', label: 'Staff' },
                      Partner: { img: 'https://i.imgur.com/F5JLVzH.png', label: 'Partner' },
                      CEO: { img: 'https://i.imgur.com/UrBm8WI.png', label: 'CEO' },
                    };
                    let badgeList = Array.isArray(profile.badges)
                      ? profile.badges
                      : (profile.badges || '').split(',').map((b) => b.trim()).filter(Boolean);
                    return badgeList.map((badge, i) =>
                      badgeMap[badge] && (
                        <span key={badge} className="relative group animate-scale-in" style={{ animationDelay: `${1.1 + 0.1 * (i + 1)}s` }}>
                          <img
                            src={badgeMap[badge].img}
                            alt={badgeMap[badge].label}
                            loading="lazy"
                            className="w-8 h-8 rounded-md hover:scale-110 transition-transform"
                            style={{ background: 'transparent' }}
                          />
                          <span className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute left-1/2 -translate-x-1/2 top-full mt-2 px-2 py-1 text-xs rounded bg-black text-white whitespace-nowrap z-20">
                            {badgeMap[badge].label}
                          </span>
                        </span>
                      )
                    );
                  })()}
                </div>
              )}
            </div>
          )}
          {updateMessage.text && (
            <p
              className={`text-center mb-4 text-sm ${updateMessage.type === 'error' ? 'text-red-500' : 'text-green-500'} animate-fade-in`}
              style={{ animationDelay: '1.3s' }}
            >
              {updateMessage.text}
            </p>
          )}
          {isEditing ? (
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              {['Full Name', 'Username', 'Bio'].map((field, i) => (
                <div key={field} className="animate-fade-in-up" style={{ animationDelay: `${1.4 + 0.2 * (i + 1)}s` }}>
                  <label className="block text-sm font-semibold mb-1 text-[var(--color-text-secondary)]">{field}</label>
                  {field === 'Bio' ? (
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full px-3 py-2 bg-transparent border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] resize-y"
                      rows="3"
                    ></textarea>
                  ) : (
                    <input
                      type="text"
                      value={field === 'Full Name' ? fullName : username}
                      onChange={(e) => (field === 'Full Name' ? setFullName(e.target.value) : setUsername(e.target.value))}
                      className="w-full px-3 py-2 bg-transparent border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
                    />
                  )}
                </div>
              ))}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={isSubmitting}
                  className="w-full px-6 py-2 bg-[var(--color-bg-subtle)] rounded-full font-semibold hover:bg-[var(--color-bg-subtle-hover)] transition-colors disabled:opacity-50 animate-scale-in"
                  style={{ animationDelay: '2s' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-2 bg-[var(--color-brand)] text-white rounded-full font-semibold hover:bg-[var(--color-brand-hover)] transition-colors disabled:opacity-50 flex items-center justify-center animate-scale-in"
                  style={{ animationDelay: '2.2s' }}
                >
                  {isSubmitting ? <SpinnerIcon className="w-5 h-5" /> : 'Save'}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-[var(--color-text-primary)] min-h-[4rem] animate-fade-in-up" style={{ animationDelay: '1.4s' }}>
                {bio || 'No bio yet. Click Edit to add one!'}
              </p>
              <p className="text-sm text-[var(--color-text-secondary)] animate-fade-in-up" style={{ animationDelay: '1.6s' }}>
                Email: {profile?.email}
              </p>
              <button
                onClick={() => setIsEditing(true)}
                className="w-full px-6 py-3 bg-[var(--color-bg-subtle)] rounded-full font-semibold hover:bg-[var(--color-bg-subtle-hover)] transition-colors animate-scale-in"
                style={{ animationDelay: '1.8s' }}
              >
                Edit Profile
              </button>
            </div>
          )}
        </div>
      </main>
      <style jsx global>{`
        :root {
          --color-background: #fff;
          --color-bg-subtle: #f3f4f6;
          --color-bg-subtle-hover: #e5e7eb;
          --color-bg-subtle-translucent: rgba(255,255,255,0.85);
          --color-text-primary: #171717;
          --color-text-secondary: #6b7280;
          --color-border: #e5e7eb;
          --color-brand: #3b82f6;
          --color-brand-hover: #2563eb;
          --color-switch-track: #fcd34d;
          --color-switch-icon: #f59e0b;
          transition: all 0.3s cubic-bezier(.4,0,.2,1);
        }
        .dark {
          --color-background: #0a0a0a;
          --color-bg-subtle: #171717;
          --color-bg-subtle-hover: #262626;
          --color-bg-subtle-translucent: rgba(10,10,10,0.8);
          --color-text-primary: #f5f5f5;
          --color-text-secondary: #a3a3a3;
          --color-border: #262626;
          --color-brand: #3b82f6;
          --color-brand-hover: #60a5fa;
          --color-switch-track: #4f46e5;
          --color-switch-icon: #c7d2fe;
          transition: all 0.3s cubic-bezier(.4,0,.2,1);
        }
        .group:hover .group-hover\:opacity-100 {
          opacity: 1 !important;
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes scale-in-up {
          from { opacity: 0; transform: perspective(1000px) rotateX(10deg) rotateY(10deg) scale3d(0.8, 0.8, 0.8); }
          to { opacity: 1; transform: perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1); }
        }
        .animate-fade-in {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }
        .animate-scale-in {
          animation: scale-in 0.6s cubic-bezier(0.03, 0.98, 0.52, 0.99) forwards;
          opacity: 0;
        }
        .animate-scale-in-up {
          animation: scale-in-up 0.6s cubic-bezier(0.03, 0.98, 0.52, 0.99) forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
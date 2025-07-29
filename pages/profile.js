import React, { useEffect, useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

// This is a stand-in for Next.js's Head component for this environment.
const Head = ({ children }) => {
  useEffect(() => {
    // Ensure children is an array before using .find()
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

export default function App() {
  const [theme, setTheme] = useState('light');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  const backgroundRef = useRef(null);

  // States for form inputs
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    // Fetch user profile
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
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
          // If the profile is new (no username), automatically enter editing mode.
          if (!data.username) {
            setIsEditing(true);
            setUpdateMessage("Welcome! Please complete your profile.");
          }
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  // Three.js background effect
  useEffect(() => {
    if (typeof window === 'undefined' || !backgroundRef.current) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    backgroundRef.current.appendChild(renderer.domElement);
    const stars = new THREE.Group();
    const starGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const starMaterial = new THREE.MeshBasicMaterial({ color: theme === 'dark' ? 0xffffff : 0x666666 });
    for (let i = 0; i < 800; i++) {
        const star = new THREE.Mesh(starGeometry, starMaterial);
        star.position.set((Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200);
        stars.add(star);
    }
    scene.add(stars);
    camera.position.z = 5;
    let animationFrameId;
    const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        stars.rotation.y += 0.001;
        starMaterial.color.set(theme === 'dark' ? 0xffffff : 0x666666);
        renderer.render(scene, camera);
    };
    animate();
    const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationFrameId);
        if (backgroundRef.current && renderer.domElement) {
            backgroundRef.current.removeChild(renderer.domElement);
        }
    };
  }, [theme]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('profiles')
        .update({ username, full_name: fullName, bio, updated_at: new Date() })
        .eq('id', user.id)
        .select()
        .single();
      if (error) {
        setUpdateMessage('Error updating profile.');
      } else {
        setProfile(data);
        setUpdateMessage('Profile updated successfully!');
        setIsEditing(false);
      }
      setTimeout(() => setUpdateMessage(''), 3000);
    }
  };

  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase.storage
          .from('avatars')
          .upload(`${user.id}/${Date.now()}`, file, { cacheControl: '3600', upsert: true });
        if (error) {
          setUpdateMessage('Error uploading avatar.');
        } else {
          const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(data.path);
          await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);
          setProfile({ ...profile, avatar_url: publicUrl });
          setUpdateMessage('Avatar updated!');
        }
        setTimeout(() => setUpdateMessage(''), 3000);
      }
    }
  };

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/auth';
  };

  if (loading) {
    return <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center text-gray-900 dark:text-gray-100">Loading...</div>;
  }

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''} min-h-screen select-none ${theme === 'dark' ? 'bg-black text-gray-100' : 'bg-white text-gray-900'} transition-all duration-500 flex flex-col items-center relative overflow-hidden`}>
      <Head>
        <title>Noteify - Your Profile</title>
      </Head>

      <div id="background" ref={backgroundRef} className="absolute inset-0 z-0"></div>
      
      <div className="absolute top-4 right-4 flex items-center gap-4 z-20">
        <button onClick={toggleTheme} className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 transition-all duration-300 hover:bg-gray-300 dark:hover:bg-gray-700 focus:outline-none" aria-label="Toggle theme">
          <svg className="w-5 h-5 text-gray-900 dark:text-gray-100" fill="currentColor" viewBox="0 0 24 24">
            {theme === 'light' ? <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.63-.14 2.39-.41-.56.24-1.15.41-1.77.41-3.31 0-6-2.69-6-6s2.69-6 6-6c.62 0 1.21.17 1.77.41-.76-.27-1.56-.41-2.39-.41zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7z" /> : <path d="M12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm0-10c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm-1 13h2v2h-2zm0-18h2v2h-2zm10 10h2v-2h-2zm-18 0h2v-2H3zm15.66 6.34l1.41 1.41 1.41-1.41-1.41-1.41-1.41 1.41zm-12.72 0l1.41-1.41-1.41-1.41-1.41 1.41 1.41 1.41zm12.72-12.72l1.41-1.41-1.41-1.41-1.41 1.41 1.41 1.41zm-12.72 0l-1.41-1.41-1.41 1.41 1.41 1.41 1.41-1.41z" />}
          </svg>
        </button>
        <button onClick={handleSignOut} className="px-4 py-2 rounded-full bg-red-500 text-white font-semibold transition-all duration-300 hover:bg-red-600 focus:outline-none">Sign Out</button>
      </div>

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen w-full p-4">
        <div className="w-full max-w-lg bg-white/20 dark:bg-black/20 backdrop-blur-md rounded-2xl shadow-lg p-8">
          <div className="flex flex-col items-center mb-6">
            <label className="relative w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-800 transition-all duration-300 hover:scale-105 cursor-pointer flex items-center justify-center mb-4">
              <input type="file" accept="image/*" onChange={handleProfilePicChange} className="absolute inset-0 opacity-0 cursor-pointer" />
              <img src={profile?.avatar_url || `https://placehold.co/128x128/e2e8f0/4a5568?text=${profile?.username?.charAt(0) || 'A'}`} alt="Profile" className="w-full h-full rounded-full object-cover" />
            </label>
            <h1 className="text-3xl font-bold animate-glow">{profile?.full_name || profile?.username || 'New User'}</h1>
            <p className="text-gray-600 dark:text-gray-400">@{profile?.username || 'username'}</p>
          </div>

          {updateMessage && <p className="text-center mb-4 text-green-500 dark:text-green-400">{updateMessage}</p>}

          {isEditing ? (
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Full Name</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-4 py-2 bg-transparent border border-gray-400 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Username</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-2 bg-transparent border border-gray-400 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Bio</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="w-full px-4 py-2 bg-transparent border border-gray-400 dark:border-gray-600 rounded-md resize-y" rows="3"></textarea>
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setIsEditing(false)} className="w-full px-6 py-2 bg-gray-200 dark:bg-gray-700 rounded-full font-semibold">Cancel</button>
                <button type="submit" className="w-full px-6 py-2 bg-blue-500 text-white rounded-full font-semibold">Save</button>
              </div>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-gray-700 dark:text-gray-300">{profile?.bio || 'No bio yet. Click Edit to add one!'}</p>
              <p className="text-sm text-gray-500">Email: {profile?.email}</p>
              <button onClick={() => setIsEditing(true)} className="w-full px-6 py-3 bg-gray-200 dark:bg-gray-800 rounded-full font-semibold">Edit Profile</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

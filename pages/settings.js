'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Sun, Moon, Bell, Shield, User, Palette, ArrowLeft, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function SettingsPage() {
  const { user, loading, logout, updateUserProfile } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [theme, setTheme] = useState('light');
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
  });
  const [twoFactor, setTwoFactor] = useState(false);
  const [activeTab, setActiveTab] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const initializeTheme = async () => {
      let savedTheme = 'light';
      if (user) {
        try {
          // Fetch user profile from Supabase
          const { data, error } = await supabase
            .from('users')
            .select('display_name, theme')
            .eq('id', user.id)
            .single();
          if (error && error.code !== 'PGRST116') throw error;
          if (data) {
            setDisplayName(data.display_name || '');
            savedTheme = data.theme || savedTheme;
          } else {
            // Insert user row if not exists
            await supabase.from('users').upsert([
              {
                id: user.id,
                display_name: user.user_metadata?.display_name || 'User',
                theme: savedTheme,
              },
            ]);
          }
          // Fetch settings from Supabase
          const { data: settingsData } = await supabase
            .from('settings')
            .select('notifications, two_factor')
            .eq('user_id', user.id)
            .single();
          if (settingsData) {
            setNotifications(settingsData.notifications || notifications);
            setTwoFactor(settingsData.two_factor || false);
          }
        } catch (error) {
          toast.error('Failed to load settings.');
        }
      }
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(savedTheme);
    };

    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      initializeTheme();
    }
    // eslint-disable-next-line
  }, [user, loading, router]);

  const handleThemeChange = async (newTheme) => {
    try {
      setTheme(newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(newTheme);

      if (user) {
        await supabase.from('users').update({ theme: newTheme }).eq('id', user.id);
      }

      // Broadcast theme change to all tabs/pages
      window.dispatchEvent(new CustomEvent('noteify-theme-change', { detail: newTheme }));

      toast.success(`Theme changed to ${newTheme}!`);
      setActiveTab(null);
    } catch (error) {
      toast.error('Failed to save theme preference.');
    }
  };

  const handleNotificationChange = async (type) => {
    const updated = { ...notifications, [type]: !notifications[type] };
    setNotifications(updated);
    if (user) {
      await supabase
        .from('settings')
        .upsert([{ user_id: user.id, notifications: updated }], { onConflict: ['user_id'] });
    }
    toast.success(
      `${type.charAt(0).toUpperCase() + type.slice(1)} notifications ${notifications[type] ? 'disabled' : 'enabled'}!`
    );
  };

  const handleTwoFactorToggle = async () => {
    const updated = !twoFactor;
    setTwoFactor(updated);
    if (user) {
      await supabase
        .from('settings')
        .upsert([{ user_id: user.id, two_factor: updated }], { onConflict: ['user_id'] });
    }
    toast.success(`Two-factor authentication ${updated ? 'enabled' : 'disabled'}!`);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out!');
      router.push('/login');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleBack = () => {
    window.history.back();
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await updateUserProfile(displayName);
      await supabase.from('users').update({ display_name: displayName }).eq('id', user.id);
      toast.success('Profile updated!');
      setActiveTab(null);
    } catch (error) {
      toast.error('Failed to update profile.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors">
        <div className="text-gray-600 dark:text-gray-300 text-lg font-semibold">Loading...</div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col font-sans transition-colors duration-500">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 flex flex-col p-4 sm:p-8"
      >
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-4xl font-extrabold text-blue-600 dark:text-blue-400">Settings</h1>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleBack}
            className="p-2 rounded-full hover:bg-blue-100 dark:hover:bg-gray-700 transition"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </motion.button>
        </div>
        <nav className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center space-x-4 p-7 rounded-2xl bg-white/90 dark:bg-gray-900/90 shadow-xl hover:bg-blue-50 dark:hover:bg-gray-800 text-left transition-colors"
            >
              <tab.icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">{tab.label}</span>
            </motion.button>
          ))}
        </nav>
      </motion.div>

      <AnimatePresence>
        {activeTab && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.35, type: 'spring', stiffness: 120 }}
            className="fixed inset-0 bg-white/95 dark:bg-gray-900/95 p-8 overflow-y-auto font-sans z-50 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {tabs.find((tab) => tab.id === activeTab)?.label}
              </h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setActiveTab(null)}
                className="p-2 rounded-full hover:bg-blue-100 dark:hover:bg-gray-700 transition"
                aria-label="Close panel"
              >
                <X className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </motion.button>
            </div>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="space-y-8"
              >
                <form onSubmit={handleUpdateProfile} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Email</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="mt-1 w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Display Name</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your Name"
                      className="mt-1 w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-base"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    className="w-full p-3 bg-blue-600 dark:bg-blue-500 text-white rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-semibold text-base shadow"
                  >
                    Update Profile
                  </motion.button>
                </form>
              </motion.div>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="space-y-8"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Theme</label>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleThemeChange('light')}
                      className={`flex items-center space-x-2 p-3 rounded-xl border ${
                        theme === 'light'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                          : 'border-gray-200 dark:border-gray-700'
                      } text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-semibold text-base`}
                    >
                      <Sun className="w-5 h-5" />
                      <span>Light</span>
                    </button>
                    <button
                      onClick={() => handleThemeChange('dark')}
                      className={`flex items-center space-x-2 p-3 rounded-xl border ${
                        theme === 'dark'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                          : 'border-gray-200 dark:border-gray-700'
                      } text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-semibold text-base`}
                    >
                      <Moon className="w-5 h-5" />
                      <span>Dark</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="space-y-8"
              >
                <div className="space-y-4">
                  {['email', 'push', 'sms'].map((type) => (
                    <div key={type} className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize">
                        {type} Notifications
                      </label>
                      <input
                        type="checkbox"
                        checked={notifications[type]}
                        onChange={() => handleNotificationChange(type)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Two-Factor Authentication
                  </label>
                  <input
                    type="checkbox"
                    checked={twoFactor}
                    onChange={handleTwoFactorToggle}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleLogout}
                  className="w-full p-3 bg-red-600 text-white rounded-xl hover:bg-red-700 dark:hover:bg-red-500 transition-colors font-semibold text-base shadow"
                >
                  Log Out
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
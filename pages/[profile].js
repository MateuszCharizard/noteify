export const runtime = 'edge';
import React from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const badgeMap = {
  'Bug Hunter': { img: 'https://i.imgur.com/fe4vkds.png', label: 'Bug Hunter' },
  'Premium': { img: 'https://i.imgur.com/Z05yrUp.png', label: 'Premium' },
  'Staff': { img: 'https://i.imgur.com/fapDrDU.png', label: 'Staff' },
  'Partner': { img: 'https://i.imgur.com/F5JLVzH.png', label: 'Partner' },
  'CEO': { img: 'https://i.imgur.com/UrBm8WI.png', label: 'CEO' },
};

export async function getServerSideProps(context) {
  const { profile } = context.params;
  // Only allow routes that start with @
  if (typeof profile !== 'string' || !profile.startsWith('@')) {
    return { notFound: true };
  }
  const username = profile.slice(1);
  const reserved = ['index', 'auth', 'explore', 'notes', 'profile', 'share', '404', '_app'];
  if (!username || reserved.includes(username)) {
    return { notFound: true };
  }
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();
  if (error || !data) {
    return { notFound: true };
  }
  return { props: { profile: data } };
}

export default function PublicProfile({ profile }) {
  if (!profile) return <div className="min-h-screen flex items-center justify-center">User not found.</div>;
  const badgeList = Array.isArray(profile.badges)
    ? profile.badges
    : (profile.badges || '').split(',').map(b => b.trim()).filter(Boolean);
  const avatarSrc = profile.avatar_url || `https://avatar.vercel.sh/${profile.username || 'A'}.png?size=128`;
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-background)] text-[var(--color-text-primary)]">
      <div className="w-full max-w-lg backdrop-blur-md rounded-2xl shadow-lg p-8 border border-[var(--color-border)] mt-10"
        style={{ background: 'rgba(255,255,255,0.85)' }}>
        <div className="flex flex-col items-center mb-6">
          <img src={avatarSrc} alt="Profile" className="w-32 h-32 rounded-full object-cover border-2 border-[var(--color-border)] mb-4" />
          <h1 className="text-3xl font-bold">{profile.full_name || profile.username || 'User'}</h1>
          <p className="text-[var(--color-text-secondary)]">@{profile.username}</p>
          {badgeList.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2 justify-center">
              {badgeList.map(badge => badgeMap[badge] && (
                <span key={badge} className="relative group">
                  <img
                    src={badgeMap[badge].img}
                    alt={badgeMap[badge].label}
                    className="w-8 h-8 rounded-md border border-[var(--color-border)] bg-transparent shadow hover:scale-110 transition-transform"
                    style={{ background: 'transparent' }}
                  />
                  <span className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute left-1/2 -translate-x-1/2 top-full mt-2 px-2 py-1 text-xs rounded bg-black text-white whitespace-nowrap z-20 shadow-lg">
                    {badgeMap[badge].label}
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="text-center space-y-4">
          <p className="text-[var(--color-text-primary)] min-h-[4rem]">{profile.bio || 'No bio yet.'}</p>
        </div>
        <div className="text-center mt-4">
          <Link href="/" className="px-4 py-2 text-sm font-semibold rounded-lg bg-[var(--color-bg-subtle)] hover:bg-[var(--color-bg-subtle-hover)] transition-colors">Home</Link>
        </div>
      </div>
      <style jsx global>{`
        :root {
          --color-background: #fff;
          --color-bg-subtle: #f3f4f6;
          --color-bg-subtle-hover: #e5e7eb;
          --color-text-primary: #171717;
          --color-text-secondary: #6b7280;
          --color-border: #e5e7eb;
        }
        .dark {
          --color-background: #0a0a0a;
          --color-bg-subtle: #171717;
          --color-bg-subtle-hover: #262626;
          --color-text-primary: #f5f5f5;
          --color-text-secondary: #a3a3a3;
          --color-border: #262626;
        }
        .group:hover .group-hover\:opacity-100 {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
}

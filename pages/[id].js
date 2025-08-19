import React from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  throw new Error('Supabase URL or Anon Key is not configured');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Badge mapping for profile badges
const badgeMap = {
  'Bug Hunter': { img: 'https://i.imgur.com/fe4vkds.png', label: 'Bug Hunter' },
  'Premium': { img: 'https://i.imgur.com/Z05yrUp.png', label: 'Premium' },
  'Staff': { img: 'https://i.imgur.com/fapDrDU.png', label: 'Staff' },
  'Partner': { img: 'https://i.imgur.com/F5JLVzH.png', label: 'Partner' },
  'CEO': { img: 'https://i.imgur.com/UrBm8WI.png', label: 'CEO' },
};

// UUID validation regex
const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export async function getServerSideProps(context) {
  const { id } = context.params;

  // Log input for debugging
  console.log('Processing input:', id);

  // Validate input
  const reserved = ['index', 'auth', 'explore', 'notes', 'profile', 'share', '404', '_app'];
  if (!id || reserved.includes(id.toLowerCase())) {
    console.warn('Invalid or reserved input:', id);
    return { notFound: true, props: { queriedInput: id } };
  }

  try {
    let profileData = null;

    if (isUuid.test(id)) {
      // Treat input as UUID ID
      console.log('Executing query: SELECT * FROM profiles WHERE id =', id);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id);

      console.log('Query result for ID:', data);

      if (error) {
        console.error('Supabase ID query error:', error.message);
        return { notFound: true, props: { queriedInput: id } };
      }

      if (!data || data.length === 0) {
        console.warn('No profile found for ID:', id);
        return { notFound: true, props: { queriedInput: id } };
      }

      if (data.length > 1) {
        console.error('Multiple profiles found for ID:', id);
        return { notFound: true, props: { queriedInput: id } };
      }

      profileData = data[0];
    } else {
      // Treat input as username
      console.log('Executing query: SELECT * FROM profiles WHERE username ILIKE', id);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('username', id);

      console.log('Query result for username:', data);

      if (error) {
        console.error('Supabase username query error:', error.message);
        return { notFound: true, props: { queriedInput: id } };
      }

      if (!data || data.length === 0) {
        console.warn('No profile found for username:', id);
        return { notFound: true, props: { queriedInput: id } };
      }

      if (data.length > 1) {
        console.error('Multiple profiles found for username:', id);
        return { notFound: true, props: { queriedInput: id } };
      }

      profileData = data[0];
    }

    return { props: { profile: profileData, queriedInput: id } };
  } catch (err) {
    console.error('Unexpected error in getServerSideProps:', err.message);
    return { notFound: true, props: { queriedInput: id } };
  }
}

export default function PublicProfile({ profile, queriedInput }) {
  // Handle case where profile is missing
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] text-[var(--color-text-primary)]">
        <div className="text-center">
          <p className="text-xl font-semibold">User not found</p>
          <p className="text-[var(--color-text-secondary)] mt-2">
            No user exists with input "{queriedInput}". This may be due to a data mismatch, incorrect UUID/username, or database issue. Please verify the input or contact support.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block px-4 py-2 text-sm font-semibold rounded-lg bg-[var(--color-bg-subtle)] hover:bg-[var(--color-bg-subtle-hover)] transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Process badges
  const badgeList = Array.isArray(profile.badges)
    ? profile.badges
    : (profile.badges || '').split(',').map(b => b.trim()).filter(Boolean);

  // Set avatar with fallback
  const avatarSrc = profile.avatar_url || `https://avatar.vercel.sh/${profile.username || 'A'}.png?size=128`;

  // ...profile box will be shown as a popup, not as a static page...
  return null;
}
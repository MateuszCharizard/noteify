export const runtime = 'edge';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  throw new Error('Supabase URL or Anon Key is not configured');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req, res) {
  const { username } = req.query;

  // Validate username
  const reserved = ['index', 'auth', 'explore', 'notes', 'profile', 'share', '404', '_app'];
  if (!username || reserved.includes(username.toLowerCase())) {
    console.warn('Invalid or reserved username:', username);
    return res.status(404).json({ error: 'Invalid or reserved username' });
  }

  try {
    // Query Supabase for the user profile by username
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .ilike('username', username);

    if (error) {
      console.error('Supabase query error:', error.message);
      return res.status(404).json({ error: 'User not found' });
    }

    if (!data || data.length === 0) {
      console.warn('No profile found for username:', username);
      return res.status(404).json({ error: 'User not found' });
    }

    if (data.length > 1) {
      console.error('Multiple profiles found for username:', username);
      return res.status(404).json({ error: 'Multiple users found' });
    }

    // Redirect to the profile page with the user's ID
    res.redirect(302, `/${data[0].id}`);
  } catch (err) {
    console.error('Unexpected error in username API:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
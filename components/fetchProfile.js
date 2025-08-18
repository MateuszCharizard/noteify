export async function fetchProfileById(userId) {
  console.log('[fetchProfileById] Querying user_id:', userId);
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  console.log('[fetchProfileById] Supabase result:', data, error);
  if (error) throw error;
  return data;
}
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export async function fetchProfileByUsername(username) {
  console.log('[fetchProfileByUsername] Querying username:', username);
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .ilike('username', username.trim())
    .maybeSingle();
  console.log('[fetchProfileByUsername] Supabase result:', data, error);
  if (error) throw error;
  return data;
}

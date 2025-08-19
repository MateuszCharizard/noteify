
import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function listProfileIds() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username');
  if (error) {
    console.error('Error fetching profile IDs:', error);
    process.exit(1);
  }
  console.log('Profile IDs and usernames:');
  data.forEach(profile => {
    console.log(`id: ${profile.id} | username: ${profile.username}`);
  });
}

listProfileIds();

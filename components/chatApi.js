import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Returns all conversations for a user (by user id)
export async function fetchConversations(userId) {
  const { data, error } = await supabase
    .from('conversations')
    .select('id, participants:users(id, username, avatar_url), last_message, updated_at')
    .contains('participant_ids', [userId])
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data;
}

// Returns all messages in a conversation
export async function fetchMessages(conversationId) {
  const { data, error } = await supabase
    .from('messages')
    .select('id, sender_id, content, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

// Sends a message in a conversation
export async function sendMessage(conversationId, senderId, content) {
  const { data, error } = await supabase
    .from('messages')
    .insert([{ conversation_id: conversationId, sender_id: senderId, content }]);
  if (error) throw error;
  return data;
}

// Starts a new conversation or returns existing one between two users
export async function startConversation(userId1, userId2) {
  // Check for existing conversation
  const { data: existing, error: findError } = await supabase
    .from('conversations')
    .select('id, participant_ids')
    .or(`participant_ids.cs.{${userId1},${userId2}}`);
  if (findError) throw findError;
  if (existing && existing.length > 0) return existing[0];
  // Create new
  const { data, error } = await supabase
    .from('conversations')
    .insert([{ participant_ids: [userId1, userId2] }])
    .select();
  if (error) throw error;
  return data[0];
}

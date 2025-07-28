import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import ActionItem from '../../components/ActionItem';
import MeetingForm from '../../components/MeetingForm';

export default function MeetingDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [meeting, setMeeting] = useState(null);
  const [actionItems, setActionItems] = useState([]);
  const [agendaTopics, setAgendaTopics] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchMeeting();
      fetchActionItems();
      fetchAgendaTopics();
    }
  }, [id]);

  async function fetchMeeting() {
    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      console.error('Error fetching meeting:', error);
      setError('Failed to load meeting');
    } else {
      setMeeting(data);
    }
  }

  async function fetchActionItems() {
    const { data, error } = await supabase
      .from('action_items')
      .select('*')
      .eq('meeting_id', id);
    if (error) {
      console.error('Error fetching action items:', error);
      setError('Failed to load action items');
    } else {
      setActionItems(data || []);
    }
  }

  async function fetchAgendaTopics() {
    const { data, error } = await supabase
      .from('agenda_topics')
      .select('*')
      .eq('meeting_id', id);
    if (error) {
      console.error('Error fetching agenda topics:', error);
      setError('Failed to load agenda topics');
    } else {
      setAgendaTopics(data || []);
    }
  }

  if (error) return <div className="container mx-auto p-4 text-red-500">{error}</div>;
  if (!meeting) return <div className="container mx-auto p-4">Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{meeting.title}</h1>
      <p className="text-gray-600 mb-4">{new Date(meeting.date).toLocaleString()}</p>
      <MeetingForm meeting={meeting} onSubmit={async (updatedMeeting) => {
        const { error } = await supabase
          .from('meetings')
          .update(updatedMeeting)
          .eq('id', id);
        if (error) console.error('Error updating meeting:', error);
        else router.push('/');
      }} />
      <h2 className="text-xl font-semibold mt-6 mb-2">Agenda Topics</h2>
      {agendaTopics.length === 0 ? (
        <p className="text-gray-600">No agenda topics available.</p>
      ) : (
        agendaTopics.map((topic) => (
          <ActionItem key={topic.id} item={topic} type="topic" />
        ))
      )}
      <h2 className="text-xl font-semibold mt-6 mb-2">Action Items</h2>
      {actionItems.length === 0 ? (
        <p className="text-gray-600">No action items available.</p>
      ) : (
        actionItems.map((item) => (
          <ActionItem key={item.id} item={item} type="action" />
        ))
      )}
    </div>
  );
}
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import MeetingList from '../components/MeetingList';
import Link from 'next/link';

export default function Home() {
  const [meetings, setMeetings] = useState([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchMeetings();
  }, []);

  async function fetchMeetings() {
    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .order('date', { ascending: false });
    if (error) console.error('Error fetching meetings:', error);
    else setMeetings(data);
  }

  const filteredMeetings = meetings.filter(meeting =>
    meeting.title.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Noteify: 1:1 Meetings</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Filter by title..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border p-2 rounded w-full"
        />
      </div>
      <Link href="/meetings/new" className="bg-blue-500 text-white px-4 py-2 rounded mb-4 inline-block">
        New Meeting
      </Link>
      <MeetingList meetings={filteredMeetings} />
    </div>
  );
}
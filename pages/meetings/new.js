import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import MeetingForm from '../../components/MeetingForm';

export default function NewMeeting() {
  const router = useRouter();

  async function handleSubmit(meeting) {
    const { data, error } = await supabase
      .from('meetings')
      .insert([{ ...meeting, user_id: supabase.auth.user().id }]);
    if (error) console.error('Error creating meeting:', error);
    else router.push(`/meetings/${data[0].id}`);
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">New Meeting</h1>
      <MeetingForm onSubmit={handleSubmit} />
    </div>
  );
}
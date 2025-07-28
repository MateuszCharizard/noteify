import { useState } from 'react';

export default function MeetingForm({ meeting = {}, onSubmit }) {
  const [title, setTitle] = useState(meeting.title || '');
  const [date, setDate] = useState(meeting.date ? new Date(meeting.date).toISOString().slice(0, 16) : '');
  const [notes, setNotes] = useState(meeting.notes || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ title, date, notes });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 rounded w-full"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Date & Time</label>
        <input
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border p-2 rounded w-full"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="border p-2 rounded w-full"
          rows="5"
        />
      </div>
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
        Save
      </button>
    </form>
  );
}
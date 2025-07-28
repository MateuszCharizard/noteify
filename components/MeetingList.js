import Link from 'next/link';

export default function MeetingList({ meetings }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="px-4 py-2 border">Title</th>
            <th className="px-4 py-2 border">Date</th>
            <th className="px-4 py-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {meetings.map((meeting) => (
            <tr key={meeting.id}>
              <td className="px-4 py-2 border">{meeting.title}</td>
              <td className="px-4 py-2 border">{new Date(meeting.date).toLocaleString()}</td>
              <td className="px-4 py-2 border">
                <Link href={`/meetings/${meeting.id}`} className="text-blue-500">
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
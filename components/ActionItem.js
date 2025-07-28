export default function ActionItem({ item, type }) {
  return (
    <div className="border p-4 rounded mb-2">
      <p className="font-medium">{type === 'action' ? 'Action Item' : 'Agenda Topic'}: {item.description || item.topic}</p>
      {type === 'action' && (
        <p className="text-sm text-gray-600">Status: {item.status}</p>
      )}
    </div>
  );
}
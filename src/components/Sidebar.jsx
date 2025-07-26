function Sidebar({ history, onSelect }) {
  return (
    <div className="w-64 bg-gray-800 text-white p-4 space-y-2">
      <h2 className="text-lg font-bold">Chat History</h2>
      {history.length === 0 && <p className="text-gray-400">No conversations yet</p>}
      {history.map((h, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          className="w-full text-left p-2 bg-gray-700 rounded hover:bg-gray-600"
        >
          {h.title || `Conversation ${i + 1}`}
        </button>
      ))}
    </div>
  );
}
export default Sidebar;

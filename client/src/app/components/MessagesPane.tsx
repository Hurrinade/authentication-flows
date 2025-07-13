import { useMessages } from "../contexts/MessagesProvider";

export default function MessagesPane() {
  const { messages, clearMessages } = useMessages();

  return (
    <div
      className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 flex flex-col"
      style={{ height: "calc(100vh - 150px)" }}
    >
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <h2 className="text-xl font-semibold text-white">Message Log</h2>
        <button
          onClick={clearMessages}
          className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          Clear
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-sm">No messages yet</div>
            <div className="text-gray-500 text-xs mt-2">
              Messages will appear here as you interact
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                message.type === "success"
                  ? "bg-green-900/20 border-green-700 text-green-100"
                  : message.type === "error"
                    ? "bg-red-900/20 border-red-700 text-red-100"
                    : "bg-blue-900/20 border-blue-700 text-blue-100"
              }`}
            >
              <div className="flex items-start justify-between">
                <p className="text-sm">{message.text}</p>
                <span className="text-xs opacity-60 ml-2">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

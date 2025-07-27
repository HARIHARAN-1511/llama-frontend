import { useState, useRef, useEffect } from "react";
import axios from "axios";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const fileInputRef = useRef(null);
  const chatWindowRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Send message
  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, newMessage]);
    setLoading(true);

    try {
      const res = await axios.post("https://llama-backend-y3qy.onrender.com/chat", { message: input });
      setMessages((prev) => [...prev, { sender: "bot", text: res.data.reply }]);
    } catch (err) {
      setMessages((prev) => [...prev, { sender: "bot", text: "Error connecting to server." }]);
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  // Reset chat
  const resetChat = async () => {
    try {
      await axios.post("https://llama-backend-y3qy.onrender.com/reset");
      if (messages.length > 0) {
        setHistory((prev) => [
          ...prev,
          { title: `Chat ${prev.length + 1}`, messages },
        ]);
      }
      setMessages([]);
    } catch (err) {
      console.error("Reset failed:", err);
    }
  };

  // File upload (PDF or image)
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      if (file.type === "application/pdf") {
        const res = await axios.post("https://llama-backend-y3qy.onrender.com/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const pdfText = res.data.text.slice(0, 200);
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: `PDF Uploaded: ${file.name}`, type: "pdf" },
          { sender: "bot", text: `PDF Content Preview: ${pdfText}...` },
        ]);
      } else if (file.type.startsWith("image/")) {
        const res = await axios.post("https://llama-backend-y3qy.onrender.com/image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: `Image Uploaded: ${file.name}`, type: "image", url: URL.createObjectURL(file) },
        ]);
      } else {
        alert("Only PDF or image files are supported.");
      }
    } catch (err) {
      console.error("File upload failed:", err);
    }
  };

  // Load chat from history
  const loadChat = (index) => {
    setActiveChat(index);
    setMessages(history[index].messages);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 p-4 space-y-3 border-r border-gray-700">
        <h2 className="text-xl font-bold mb-2">Chat History</h2>
        {history.length === 0 && <p className="text-gray-400">No previous chats</p>}
        {history.map((chat, i) => (
          <button
            key={i}
            onClick={() => loadChat(i)}
            className={`block w-full text-left p-2 rounded ${
              activeChat === i ? "bg-green-600" : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            {chat.title}
          </button>
        ))}
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        <header className="p-4 bg-gray-800 flex justify-between items-center border-b border-gray-700">
          <h1 className="text-lg font-semibold">LLaMA 3 Chatbot</h1>
          <button
            onClick={resetChat}
            className="bg-red-500 px-4 py-2 rounded hover:bg-red-600 transition"
          >
            New Chat
          </button>
        </header>

        <div
          ref={chatWindowRef}
          className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-900"
        >
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[70%] px-4 py-2 rounded-lg ${
                  m.sender === "user" ? "bg-green-600" : "bg-gray-700"
                }`}
              >
                {m.type === "pdf" ? (
                  <div>
                    <p>📄 <b>{m.text}</b></p>
                  </div>
                ) : m.type === "image" ? (
                  <div>
                    <img src={m.url} alt="Uploaded" className="max-w-xs rounded mt-2" />
                  </div>
                ) : (
                  <p>{m.text}</p>
                )}
              </div>
            </div>
          ))}
          {loading && <div className="text-center text-gray-400 italic">🤔 Thinking...</div>}
        </div>

        {/* Input Section */}
        <footer className="p-4 bg-gray-800 flex items-center space-x-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 p-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Type your message..."
          />
          <button
            onClick={sendMessage}
            className="bg-green-600 px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Send
          </button>
          <button
            onClick={() => fileInputRef.current.click()}
            className="bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Upload
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="application/pdf,image/*"
          />
        </footer>
      </div>
    </div>
  );
}

export default App;

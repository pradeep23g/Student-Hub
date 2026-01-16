import { useState, useRef, useEffect } from "react";
import { getGeminiResponse } from "../geminiService";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatComponent({ pdfText, fileName }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "model", text: `Hi! I'm ready to answer questions about "${fileName}".` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Prepare history for API
    const history = [{ parts: [{ text: input }] }];
    const replyText = await getGeminiResponse(history, pdfText);

    setMessages((prev) => [...prev, { role: "model", text: replyText }]);
    setLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      
      {/* 1. THE CHAT WINDOW (AnimatePresence for smooth open/close) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-4 w-80 md:w-96 h-[500px] flex flex-col
                       bg-slate-900/95 backdrop-blur-xl border border-white/10
                       rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-indigo-600 to-violet-600 flex justify-between items-center shadow-lg">
              <div className="flex items-center gap-2">
                <span className="text-xl">🤖</span>
                <div>
                  <h3 className="text-white font-bold text-sm">AI Tutor</h3>
                  <p className="text-indigo-200 text-xs">Powered by Gemini</p>
                </div>
              </div>
              <button 
                onClick={() => setMessages([])} 
                className="text-white/60 hover:text-white text-xs"
              >
                Clear
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] p-3 text-sm rounded-2xl ${
                    msg.role === "user" 
                      ? "bg-indigo-600 text-white rounded-tr-sm" 
                      : "bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-sm"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 px-4 py-2 rounded-full text-xs text-slate-400 animate-pulse border border-slate-700">
                    Thinking...
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-slate-950/50 border-t border-white/5">
              <div className="flex gap-2 relative">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask a question..."
                  className="w-full bg-slate-800 text-white text-sm rounded-xl pl-4 pr-12 py-3
                             border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500
                             outline-none transition-all placeholder:text-slate-500"
                />
                <button 
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="absolute right-2 top-2 p-1.5 bg-indigo-500 text-white rounded-lg 
                             hover:bg-indigo-400 disabled:opacity-50 disabled:hover:bg-indigo-500
                             transition-colors"
                >
                  ➤
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. THE FLOATING BUTTON (FAB) */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`h-14 w-14 rounded-full shadow-2xl flex items-center justify-center text-2xl
                    transition-all duration-300 border border-white/20
                    ${isOpen 
                      ? "bg-slate-800 text-white rotate-90" 
                      : "bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:shadow-indigo-500/50"
                    }`}
      >
        {isOpen ? "✕" : "✨"}
      </motion.button>
    </div>
  );
}
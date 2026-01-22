import { useState, useRef, useEffect, useCallback } from "react";
import { getGeminiResponse } from "../geminiService";
import { motion, AnimatePresence } from "framer-motion";
import { addPoints } from "../services/userService"; 
import { auth } from "../firebase";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css"; 

export default function ChatComponent({ pdfText, fileName }) {
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState([
    { role: "model", text: `Hi! I'm ready to answer questions about "${fileName}".` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const scrollRef = useRef(null);
  
  // Anti-Cheat: Last Activity Timestamp
  const lastActivityRef = useRef(Date.now());

  // 1. Activity Listener
  const resetIdleTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (isIdle) setIsIdle(false); 
  }, [isIdle]);

  useEffect(() => {
    const events = ["mousemove", "keydown", "click", "scroll"];
    events.forEach(e => window.addEventListener(e, resetIdleTimer));
    return () => events.forEach(e => window.removeEventListener(e, resetIdleTimer));
  }, [resetIdleTimer]);

  // 2. Points Timer
  useEffect(() => {
    let interval;
    if (isOpen && auth.currentUser) {
      interval = setInterval(async () => {
        const now = Date.now();
        // 60 seconds inactivity threshold (Set to 5 mins for production)
        const IDLE_THRESHOLD = 60 * 1000; 

        if (now - lastActivityRef.current < IDLE_THRESHOLD) {
            await addPoints(auth.currentUser.uid, 5); // Add 5 points
            console.log("💰 +5 Points (Active)");
        } else {
            setIsIdle(true);
            console.log("💤 Idle - Points Paused");
        }
      }, 30000); // Trigger every 30 seconds
    }
    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    resetIdleTimer();

    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));
      history.push({ role: 'user', parts: [{ text: input }] });

      const replyText = await getGeminiResponse(history, pdfText);
      setMessages((prev) => [...prev, { role: "model", text: replyText }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: "model", text: "⚠️ Connection error." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-80 md:w-96 h-[550px] flex flex-col glass-panel rounded-2xl overflow-hidden"
          >
            {/* Header */}
            <div className={`p-4 flex justify-between items-center shadow-sm transition-colors duration-500 ${isIdle ? 'bg-slate-200 dark:bg-slate-800' : 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20'}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isIdle ? 'bg-slate-400' : 'bg-indigo-500'} text-white text-xl`}>
                    {isIdle ? "💤" : "🤖"}
                </div>
                <div>
                  <h3 className="font-bold text-sm dark:text-white">AI Tutor</h3>
                  {isIdle ? (
                      <p className="text-orange-500 text-xs font-bold animate-pulse">Session Paused (Move mouse)</p>
                  ) : (
                      <div className="flex items-center gap-1.5">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                          </span>
                          <p className="text-slate-500 dark:text-indigo-200 text-xs">Earning Points...</p>
                      </div>
                  )}
                </div>
              </div>
              <button onClick={() => setMessages([])} className="text-xs text-slate-400 hover:text-indigo-500">Clear Chat</button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] p-3.5 text-sm rounded-2xl shadow-sm ${
                    msg.role === "user" 
                      ? "bg-indigo-600 text-white rounded-br-none" 
                      : "glass-card text-slate-700 dark:text-slate-200 rounded-bl-none border-none bg-white/80 dark:bg-slate-800/80"
                  }`}>
                    {msg.role === "model" ? (
                        <div className="prose prose-sm prose-slate dark:prose-invert max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                                {msg.text}
                            </ReactMarkdown>
                        </div>
                    ) : msg.text}
                  </div>
                </div>
              ))}
              {loading && <div className="text-xs text-slate-400 animate-pulse pl-2">AI is thinking...</div>}
              <div ref={scrollRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-white/50 dark:bg-slate-900/50 border-t border-white/10">
              <div className="relative">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask a question..."
                  className="w-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white text-sm rounded-xl pl-4 pr-12 py-3 border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-slate-400"
                />
                <button onClick={handleSend} disabled={loading || !input.trim()} className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 transition-colors">➤</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-14 rounded-full shadow-2xl flex items-center justify-center text-2xl glass-button border-2 border-white/20"
      >
        {isOpen ? "✕" : "✨"}
      </motion.button>
    </div>
  );
}
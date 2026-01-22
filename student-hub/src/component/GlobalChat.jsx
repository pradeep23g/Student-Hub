import { useState, useEffect, useRef, useCallback } from "react";
import { getGlobalContext } from "../resourceService";
import { getGeminiResponse } from "../geminiService";
import { addPoints } from "../services/userService"; // ✅ Import Gamification
import { auth } from "../firebase"; // ✅ Import Auth
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css"; 
import GlowButton from "./GlowButton";

const GlobalChat = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [globalContext, setGlobalContext] = useState("");
  const [fileCount, setFileCount] = useState(0);
  
  const [messages, setMessages] = useState([
    { role: "model", text: "🧠 **Superbrain Online.** I have read your entire library. Ask me to connect dots between subjects, find formulas, or summarize topics!" }
  ]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef(null);

  // ✅ GAMIFICATION STATE
  const [isIdle, setIsIdle] = useState(false);
  const lastActivityRef = useRef(Date.now());

  // 1. TRACK ACTIVITY
  const resetIdleTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (isIdle) setIsIdle(false);
  }, [isIdle]);

  useEffect(() => {
    const events = ["mousemove", "keydown", "click", "scroll"];
    events.forEach(e => window.addEventListener(e, resetIdleTimer));
    return () => events.forEach(e => window.removeEventListener(e, resetIdleTimer));
  }, [resetIdleTimer]);

  // 2. POINTS TIMER (Every 60s)
  useEffect(() => {
    let interval;
    if (auth.currentUser) {
      interval = setInterval(async () => {
        const now = Date.now();
        // 60 seconds inactivity threshold
        if (now - lastActivityRef.current < 60000) {
            await addPoints(auth.currentUser.uid, 5); 
            console.log("💰 Superbrain: +5 Points");
        } else {
            setIsIdle(true);
        }
      }, 60000); // Check every 1 minute
    }
    return () => clearInterval(interval);
  }, []);

  // 3. LOAD BRAIN
  useEffect(() => {
    const loadBrain = async () => {
      const data = await getGlobalContext(); 
      setGlobalContext(data.context);
      setFileCount(data.count);
      setLoading(false);
    };
    loadBrain();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    resetIdleTimer(); // Active!
    const userMsg = { role: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsThinking(true);

    try {
      const history = messages.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.text }] }));
      history.push({ role: 'user', parts: [{ text: input }] });
      
      const reply = await getGeminiResponse(history, globalContext);
      setMessages(prev => [...prev, { role: "model", text: reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "model", text: "⚠️ Brain freeze. Try again." }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="h-[85vh] flex flex-col rounded-3xl overflow-hidden animate-fade-in-up relative z-50 border border-white/20 shadow-2xl bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-xl">
      
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10 opacity-30">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px]"></div>
      </div>

      {/* === HEADER === */}
      <div className="p-4 border-b border-white/10 bg-white/40 dark:bg-slate-900/40 flex justify-between items-center backdrop-blur-md z-20">
        <div className="flex items-center gap-4">
            <GlowButton 
              onClick={onBack} 
              text="Back"
              color="#fff" 
              icon={
                <svg height="16" width="16" fill="currentColor" viewBox="0 0 1024 1024">
                  <path d="M874.690416 495.52477c0 11.2973-9.168824 20.466124-20.466124 20.466124l-604.773963 0 188.083679 188.083679c7.992021 7.992021 7.992021 20.947078 0 28.939099-4.001127 3.990894-9.240455 5.996574-14.46955 5.996574-5.239328 0-10.478655-1.995447-14.479783-5.996574l-223.00912-223.00912c-3.837398-3.837398-5.996574-9.046027-5.996574-14.46955 0-5.433756 2.159176-10.632151 5.996574-14.46955l223.019353-223.029586c7.992021-7.992021 20.957311-7.992021 28.949332 0 7.992021 8.002254 7.992021 20.957311 0 28.949332l-188.073446 188.073446 604.753497 0C865.521592 475.058646 874.690416 484.217237 874.690416 495.52477z" />
                </svg>
              }
            />
            <div>
                <h2 className="font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                    Superbrain
                </h2>
                <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                        {loading ? "⚡ INITIALIZING..." : `🟢 ONLINE • ${fileCount} RESOURCES`}
                    </p>
                    {/* ✅ STATUS INDICATOR */}
                    {!loading && (
                        isIdle 
                        ? <span className="text-[10px] text-orange-500 font-bold bg-orange-500/10 px-2 py-0.5 rounded-full">IDLE</span>
                        : <span className="text-[10px] text-green-500 font-bold bg-green-500/10 px-2 py-0.5 rounded-full animate-pulse">+POINTS ACTIVE</span>
                    )}
                </div>
            </div>
        </div>
        <div className="text-4xl filter drop-shadow-lg animate-pulse-soft">🧠</div>
      </div>

      {/* === CHAT AREA === */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-32"> 
        {messages.map((msg, idx) => (
            <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
                <div className={`max-w-[85%] p-5 rounded-2xl shadow-sm backdrop-blur-md border leading-relaxed ${
                    msg.role === "user" 
                    ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-sm border-transparent" 
                    : "bg-white/80 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 rounded-bl-sm border-white/20 dark:border-white/10"
                }`}>
                    {msg.role === "model" ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                                {msg.text}
                            </ReactMarkdown>
                        </div>
                    ) : (
                        <p className="text-sm font-medium">{msg.text}</p>
                    )}
                </div>
            </motion.div>
        ))}
        {isThinking && (
            <div className="flex justify-start">
                <div className="bg-white/50 dark:bg-slate-800/50 px-5 py-3 rounded-2xl text-xs font-bold text-indigo-500 border border-indigo-100 dark:border-indigo-900/50 animate-pulse flex items-center gap-2">
                    <span className="animate-spin text-lg">✨</span> Processing...
                </div>
            </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* === INPUT AREA === */}
      <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-slate-100 via-slate-100/90 to-transparent dark:from-slate-900 dark:via-slate-900/90 z-20">
        <div className="relative max-w-4xl mx-auto flex items-center gap-3">
            <input 
                value={input}
                onChange={(e) => { setInput(e.target.value); resetIdleTimer(); }} // ✅ Reset Timer on Type
                onKeyDown={(e) => { 
                    resetIdleTimer(); // ✅ Reset Timer on Keypress
                    if(e.key === "Enter") handleSend(); 
                }}
                disabled={loading}
                placeholder={loading ? "Initializing knowledge base..." : "Ask complex questions across all subjects..."}
                className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-full px-6 py-4 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-xl placeholder:text-slate-400"
            />
            
            <button 
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="h-14 w-14 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 disabled:opacity-50 disabled:shadow-none transition-all transform hover:scale-105 flex items-center justify-center text-xl active:scale-95"
            >
                ➤
            </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalChat;
import { useState, useEffect } from "react";
import { getGlobalContext } from "../resourceService"; // We wrote this earlier
import ChatComponent from "./ChatComponent";

const GlobalChat = () => {
  const [loading, setLoading] = useState(true);
  const [globalContext, setGlobalContext] = useState("");
  const [fileCount, setFileCount] = useState(0);

  useEffect(() => {
    const loadBrain = async () => {
      // 1. Fetch text from ALL 100% of your approved files
      console.log("🧠 Loading Superbrain...");
      const data = await getGlobalContext(); 
      
      setGlobalContext(data.context);
      setFileCount(data.count);
      setLoading(false);
    };
    loadBrain();
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-8 p-1">
      
      {/* HEADER */}
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 p-6 rounded-2xl border border-indigo-500/30 shadow-2xl mb-6 flex items-center gap-5">
        <div className="bg-indigo-500/20 p-4 rounded-full text-4xl">🧠</div>
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Superbrain Chat</h1>
          <p className="text-indigo-200">
            {loading 
              ? "Connecting to knowledge base..." 
              : `Connected to ${fileCount} documents. Ask me anything across your entire library!`}
          </p>
        </div>
      </div>

      {/* CHAT INTERFACE */}
      {loading ? (
        <div className="text-center py-20 text-slate-500 animate-pulse">
          Loading your library... 📚
        </div>
      ) : (
        <ChatComponent 
          pdfText={globalContext} 
          fileName="Entire Library" 
          placeholder="Ex: Compare Physics Unit 1 with Unit 3..."
        />
      )}
    </div>
  );
};

export default GlobalChat;
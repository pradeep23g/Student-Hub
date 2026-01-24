import { useEffect, useState } from "react";
import { getUserUploads } from "../resourceService";
import { getUserStats, updateUserName } from "../services/userService"; 
import { motion } from "framer-motion";

export default function UserProfile({ user, onBack }) {
  const [uploads, setUploads] = useState([]);
  const [stats, setStats] = useState({ points: 0, streak: 0, displayName: "" }); 
  const [loading, setLoading] = useState(true);

  // ✅ EDITING STATE
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (user?.uid) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
      // 1. Get Uploads
      const userUploads = await getUserUploads(user.uid);
      setUploads(userUploads);
      
      // 2. Get Gamification Stats & Name
      const userDoc = await getUserStats(user.uid);
      if (userDoc) {
          setStats({ 
            points: userDoc.points || 0, 
            streak: userDoc.streak || 0,
            displayName: userDoc.displayName || "Scholar" 
          });
          setNewName(userDoc.displayName || "");
      }
      setLoading(false);
  };

  const handleSaveName = async () => {
      if(!newName.trim()) return;
      
      const success = await updateUserName(user.uid, newName);
      
      if(success) {
          setStats(prev => ({ ...prev, displayName: newName }));
          setIsEditing(false);
      } else {
          alert("Failed to update name. Please try again.");
      }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 animate-fade-in-up">
      <button 
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition group"
      >
        <span className="group-hover:-translate-x-1 transition">←</span> Back to Dashboard
      </button>

      {/* PROFILE HEADER CARD */}
      <div className="glass-panel p-8 rounded-3xl flex flex-col md:flex-row items-center gap-8 mb-10 relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Avatar Circle */}
        <div className="h-28 w-28 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-5xl font-bold text-white shadow-2xl ring-4 ring-white/10 shrink-0">
          {stats.displayName ? stats.displayName[0].toUpperCase() : "S"}
        </div>
        
        <div className="text-center md:text-left flex-1 w-full">
          
          {/* ✅ EDITABLE NAME SECTION */}
          <div className="flex flex-col md:flex-row items-center gap-3 mb-2 justify-center md:justify-start min-h-[50px]">
            {isEditing ? (
                <div className="flex gap-2 items-center animate-fade-in-up">
                    <input 
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-slate-800 dark:text-white outline-none focus:border-indigo-500 text-xl font-bold w-full md:w-auto placeholder-slate-400"
                        placeholder="Enter your name"
                        autoFocus
                    />
                    <button onClick={handleSaveName} className="text-xs bg-green-500 text-white px-3 py-2 rounded-lg font-bold hover:bg-green-600 transition">Save</button>
                    <button onClick={() => setIsEditing(false)} className="text-xs bg-slate-500 text-white px-3 py-2 rounded-lg font-bold hover:bg-slate-600 transition">Cancel</button>
                </div>
            ) : (
                <>
                    <h1 className="text-4xl font-black text-slate-800 dark:text-white">
                        {stats.displayName}
                    </h1>
                    <button 
                        onClick={() => setIsEditing(true)} 
                        className="p-2 text-slate-400 hover:text-indigo-500 transition rounded-full hover:bg-indigo-50 dark:hover:bg-white/5" 
                        title="Edit Name"
                    >
                        ✏️
                    </button>
                </>
            )}
          </div>

          <p className="text-slate-500 dark:text-slate-400 font-mono text-sm mb-6 flex items-center justify-center md:justify-start gap-2">
             📧 {user.email} 
             <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-300 dark:border-slate-700">PRIVATE</span>
          </p>
          
          {/* STATS GRID */}
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <div className="px-5 py-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-300 rounded-2xl text-sm font-bold flex items-center gap-2">
              🚀 {uploads.length} Uploads
            </div>
            
            <div className="px-5 py-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded-2xl text-sm font-bold flex items-center gap-2">
              💎 {stats.points} Points
            </div>

            <div className="px-5 py-3 bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 rounded-2xl text-sm font-bold flex items-center gap-2">
              🔥 {stats.streak} Day Streak
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">My Upload History</h2>

      {/* UPLOAD LIST */}
      {loading ? (
        <div className="text-slate-500 text-center animate-pulse">Loading your data...</div>
      ) : uploads.length === 0 ? (
        <div className="text-center py-20 glass-card rounded-3xl border-dashed">
          <p className="text-xl text-slate-400">No uploads yet.</p>
          <p className="text-sm text-slate-500 mt-2">Upload your first note to earn points!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {uploads.map((file) => (
            <motion.div 
              key={file.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl glass-card flex justify-between items-center group"
            >
              <div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-white group-hover:text-indigo-500 transition-colors">
                  {file.title}
                </h3>
                <p className="text-sm text-slate-500">
                  {file.subject} • Unit {file.unit || "General"}
                </p>
              </div>

              <div className="text-right">
                <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider mb-1 ${
                  file.status === "published" ? "bg-green-500/20 text-green-600 dark:text-green-400" :
                  file.status === "rejected" ? "bg-red-500/20 text-red-600 dark:text-red-400" :
                  "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"
                }`}>
                  {file.status}
                </span>
                <p className="text-xs text-slate-400">
                  {file.createdAt?.seconds ? new Date(file.createdAt.seconds * 1000).toLocaleDateString() : "Just now"}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
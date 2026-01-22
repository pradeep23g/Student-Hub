import { useEffect, useState } from "react";
import { getUserUploads } from "../resourceService";
import { getUserStats } from "../services/userService"; 
import { motion } from "framer-motion";

export default function UserProfile({ user, onBack }) {
  const [uploads, setUploads] = useState([]);
  const [stats, setStats] = useState({ points: 0, streak: 0 }); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      const fetchData = async () => {
          // 1. Get Uploads
          const userUploads = await getUserUploads(user.uid);
          setUploads(userUploads);
          
          // 2. Get Gamification Stats
          const userStats = await getUserStats(user.uid);
          if (userStats) {
              setStats({ points: userStats.points || 0, streak: userStats.streak || 0 });
          }
          
          setLoading(false);
      };
      fetchData();
    }
  }, [user]);

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

        <div className="h-28 w-28 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-5xl font-bold text-white shadow-2xl ring-4 ring-white/10">
          {user.email[0].toUpperCase()}
        </div>
        
        <div className="text-center md:text-left flex-1">
          <h1 className="text-4xl font-black text-slate-800 dark:text-white mb-2">Welcome, Scholar 🎓</h1>
          <p className="text-slate-500 dark:text-slate-400 font-mono text-sm mb-6">{user.email}</p>
          
          {/* STATS GRID */}
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <div className="px-5 py-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-300 rounded-2xl text-sm font-bold flex items-center gap-2">
              🚀 {uploads.length} Uploads
            </div>
            
            {/* ✅ REAL POINTS DISPLAY */}
            <div className="px-5 py-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded-2xl text-sm font-bold flex items-center gap-2">
              💎 {stats.points} Points
            </div>

            {/* ✅ REAL STREAK DISPLAY */}
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
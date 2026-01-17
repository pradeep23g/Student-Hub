import { useEffect, useState } from "react";
import { getUserUploads } from "../resourceService";
import { motion } from "framer-motion";

export default function UserProfile({ user, onBack }) {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      getUserUploads(user.uid).then((data) => {
        setUploads(data);
        setLoading(false);
      });
    }
  }, [user]);

  return (
    <div className="max-w-5xl mx-auto p-4 animate-fade-in-up">
      <button 
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition"
      >
        ← Back to Dashboard
      </button>

      {/* PROFILE HEADER CARD */}
      <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl flex items-center gap-6 mb-10 shadow-2xl">
        <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-4xl font-bold text-white shadow-lg">
          {user.email[0].toUpperCase()}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome, Scholar 🎓</h1>
          <p className="text-slate-400 font-mono text-sm">{user.email}</p>
          <div className="flex gap-3 mt-4">
            <div className="px-4 py-1.5 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 rounded-full text-sm font-medium">
              🚀 {uploads.length} Contributions
            </div>
            <div className="px-4 py-1.5 bg-green-500/20 border border-green-500/30 text-green-300 rounded-full text-sm font-medium">
              🔥 0 Day Streak (Coming Soon)
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-white mb-6">My Upload History</h2>

      {/* UPLOAD LIST */}
      {loading ? (
        <div className="text-slate-500 text-center">Loading your data...</div>
      ) : uploads.length === 0 ? (
        <div className="text-center py-20 bg-slate-800/30 rounded-3xl border border-white/5 border-dashed">
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
              className="p-5 rounded-2xl bg-slate-800 border border-slate-700 flex justify-between items-center group hover:border-indigo-500/50 transition-all"
            >
              <div>
                <h3 className="font-bold text-lg text-white group-hover:text-indigo-300 transition-colors">
                  {file.title}
                </h3>
                <p className="text-sm text-slate-400">
                  {file.subject} • Unit {file.unit || "General"}
                </p>
              </div>

              <div className="text-right">
                <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                  file.status === "published" ? "bg-green-500/20 text-green-400" :
                  file.status === "rejected" ? "bg-red-500/20 text-red-400" :
                  "bg-yellow-500/20 text-yellow-400"
                }`}>
                  {file.status}
                </span>
                <p className="text-xs text-slate-600 mt-1">
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
/* src/component/StudentDashboard.jsx */
import { useEffect, useState, useRef } from "react";
import { getPublishedResources } from "../resourceService";
import { updateResource, deleteResource } from "../adminService";
import { 
  toggleBookmark, 
  getUserBookmarks, 
  getLeaderboardData, 
  checkAndBumpStreak,
  addPoints,
  getUserStats
} from "../services/userService";
import { auth } from "../firebase"; 
import ChatComponent from "./ChatComponent";
import GlobalChat from "./GlobalChat";
import ConfirmationModal from "./ConfirmationModal";
import { motion } from "framer-motion";
import SpotlightCard from "./SpotlightCard";
import GlowButton from "./GlowButton"; 

const StudentDashboard = ({ role }) => {
  const [resources, setResources] = useState([]);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUserStats, setCurrentUserStats] = useState({ points: 0, streak: 0 });
  
  const [viewMode, setViewMode] = useState("home"); 
  const [selectedSubject, setSelectedSubject] = useState(null);
  
  const [activePdfText, setActivePdfText] = useState("");
  const [activeFileName, setActiveFileName] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ title: "", subject: "", unit: "" });
  const [modalConfig, setModalConfig] = useState({ isOpen: false });

  const studyTimerRef = useRef(null);

  useEffect(() => {
    loadData();
    return () => clearInterval(studyTimerRef.current);
  }, []);

  const loadData = async () => {
    const data = await getPublishedResources();
    setResources(data);
    
    if (auth.currentUser) {
        const uid = auth.currentUser.uid;
        await checkAndBumpStreak(uid); 
        const stats = await getUserStats(uid);
        if(stats) setCurrentUserStats({ points: stats.points || 0, streak: stats.streak || 0 });
        const saved = await getUserBookmarks(uid);
        setBookmarkedIds(new Set(saved));
        const leaders = await getLeaderboardData();
        setLeaderboard(leaders);
    }
  };

  const handleBookmark = async (id) => {
    if (!auth.currentUser) return alert("Login required");
    const newSet = new Set(bookmarkedIds);
    if(newSet.has(id)) newSet.delete(id); else newSet.add(id);
    setBookmarkedIds(newSet);
    await toggleBookmark(auth.currentUser.uid, id);
  };

  const handleOpenAI = (file) => {
    window.open(file.fileUrl, "_blank");
    setActiveFileName(file.title);
    
    if (studyTimerRef.current) clearInterval(studyTimerRef.current);
    studyTimerRef.current = setInterval(async () => {
        if(auth.currentUser) {
            await addPoints(auth.currentUser.uid, 5); 
            setCurrentUserStats(prev => ({ ...prev, points: (prev.points || 0) + 5 }));
        }
    }, 60000);

    if (file.fullText && file.fullText.length > 0) setActivePdfText(file.fullText);
    else { setActivePdfText(""); alert("⚠️ AI not ready for this file yet."); }
  };

  /* === ADMIN CONTROLS === */
  const startEdit = (file) => {
    setEditingId(file.id);
    setEditData({ title: file.title, subject: file.subject, unit: file.unit || "" });
  };

  const saveEdit = async (id) => { 
    await updateResource(id, editData); 
    setEditingId(null); 
    loadData(); 
  };
  
  const handleDeleteTrigger = (id) => {
    setModalConfig({
        isOpen: true, title: "Delete Resource?", message: "This action cannot be undone.", isDangerous: true,
        onConfirm: async () => {
            await deleteResource(id);
            setModalConfig({ isOpen: false });
            loadData();
        }
    });
  };

  const subjects = [...new Set(resources.map(r => r.subject))];
  const displayedResources = viewMode === 'saved' ? resources.filter(r => bookmarkedIds.has(r.id)) : resources;

  if (viewMode === "superbrain") return <GlobalChat onBack={() => setViewMode("home")} />;

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-fade-in-up">
      <ConfirmationModal {...modalConfig} onCancel={() => setModalConfig({isOpen: false})} />
      
      {/* === LEFT CONTENT === */}
      <div className="flex-1 min-w-0">
        
        {/* SUPERBRAIN CARD */}
        <div onClick={() => setViewMode("superbrain")} className="mb-8 cursor-pointer group">
            <SpotlightCard className="p-8 relative overflow-hidden border border-indigo-500/30 bg-slate-900/50" spotlightColor="rgba(129, 140, 248, 0.4)">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none group-hover:bg-indigo-500/30 transition duration-500"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 rounded-full blur-[80px] -ml-16 -mb-16 pointer-events-none"></div>
                <div className="relative z-10 flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-4xl animate-bounce-slow">🧠</span>
                            <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Superbrain AI</h2>
                        </div>
                        {/* ✅ ADAPTIVE TEXT COLOR */}
                        <p className="text-indigo-600 dark:text-indigo-200 text-lg max-w-md leading-relaxed">
                            Ask one question. Search your <span className="font-bold text-slate-800 dark:text-white">entire library</span> instantly.
                        </p>
                    </div>
                    <div className="h-16 w-16 bg-white/5 rounded-2xl flex items-center justify-center text-3xl border border-white/10 group-hover:scale-110 transition-all shadow-xl">🚀</div>
                </div>
            </SpotlightCard>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6 overflow-x-auto pb-2 scrollbar-hide">
           <button onClick={() => { setViewMode("home"); setSelectedSubject(null); }} className={`px-6 py-2.5 rounded-xl font-bold transition whitespace-nowrap ${viewMode === 'home' && !selectedSubject ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30" : "glass-card text-slate-600 dark:text-slate-300"}`}>All Resources</button>
           <button onClick={() => setViewMode("saved")} className={`px-6 py-2.5 rounded-xl font-bold transition whitespace-nowrap ${viewMode === 'saved' ? "bg-yellow-500 text-white shadow-lg shadow-yellow-500/30" : "glass-card text-slate-600 dark:text-slate-300"}`}>⭐ Saved ({bookmarkedIds.size})</button>
           {subjects.map(sub => (
               <button key={sub} onClick={() => { setViewMode("home"); setSelectedSubject(sub); }} className={`px-6 py-2.5 rounded-xl font-bold transition whitespace-nowrap ${selectedSubject === sub ? "bg-purple-600 text-white shadow-lg" : "glass-card text-slate-600 dark:text-slate-300"}`}>{sub}</button>
           ))}
        </div>

        {/* RESOURCE GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
           {displayedResources.filter(r => !selectedSubject || r.subject === selectedSubject).map((file) => (
               <motion.div layout key={file.id}>
                   <SpotlightCard className="p-5 h-full group" spotlightColor="rgba(255, 255, 255, 0.1)">
                       {editingId === file.id ? (
                           /* ✅ ADAPTIVE EDIT MODE */
                           <div className="space-y-3 relative z-10">
                               <input value={editData.title} onChange={e => setEditData({...editData, title: e.target.value})} className="w-full bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 outline-none" placeholder="Title" />
                               <div className="flex gap-2">
                                   <input value={editData.subject} onChange={e => setEditData({...editData, subject: e.target.value})} className="flex-1 bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 outline-none" placeholder="Subject" />
                                   <input value={editData.unit} onChange={e => setEditData({...editData, unit: e.target.value})} className="w-24 bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 outline-none" placeholder="Unit" />
                               </div>
                               <div className="flex gap-2 pt-2">
                                   <button onClick={() => saveEdit(file.id)} className="flex-1 bg-green-500 text-white py-2 rounded-xl">Save</button>
                                   <button onClick={() => setEditingId(null)} className="flex-1 bg-slate-500 text-white py-2 rounded-xl">Cancel</button>
                               </div>
                           </div>
                       ) : (
                           /* NORMAL VIEW */
                           <div className="flex flex-col h-full relative z-10">
                               <div className="flex justify-between items-start mb-4">
                                   <div className="p-3 rounded-xl bg-indigo-500/10 text-2xl border border-indigo-500/20">📄</div>
                                   
                                   <div className="flex gap-2">
                                       {/* ADMIN BUTTONS */}
                                       {role === 'moderator' && (
                                           <>
                                               <GlowButton onClick={() => startEdit(file)} color="#fbbf24" icon={<svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>} />
                                               <GlowButton onClick={() => handleDeleteTrigger(file.id)} color="#ef4444" icon={<svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>} />
                                           </>
                                       )}
                                       {/* BOOKMARK BUTTON */}
                                       <GlowButton 
                                            onClick={(e) => {e.stopPropagation(); handleBookmark(file.id)}} 
                                            color="#ffffff" 
                                            icon={<span style={{fontSize: '18px'}}>{bookmarkedIds.has(file.id) ? "★" : "☆"}</span>} 
                                       />
                                   </div>
                               </div>
                               <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-1 line-clamp-1">{file.title}</h3>
                               <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-6">{file.subject} • {file.unit || "General"}</p>
                               
                               {/* OPEN/CHAT BUTTON */}
                               <div className="mt-auto w-full">
                                   <GlowButton 
                                        onClick={() => handleOpenAI(file)}
                                        text={file.aiReady ? "Open & Chat" : "Read PDF"}
                                        color="#4ade80" 
                                        className="w-full"
                                        icon={<svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>}
                                   />
                               </div>
                           </div>
                       )}
                   </SpotlightCard>
               </motion.div>
           ))}
        </div>
      </div>

      {/* === RIGHT SIDEBAR (Stats) === */}
      <div className="w-full lg:w-80 flex flex-col gap-6">
         <SpotlightCard className="p-6 bg-gradient-to-br from-indigo-900/50 to-purple-900/50" spotlightColor="rgba(168, 85, 247, 0.4)">
             <div className="absolute top-0 right-0 p-10 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
             <h3 className="font-bold text-lg mb-6 relative z-10 text-white">👑 My Progress</h3>
             <div className="grid grid-cols-2 gap-4 relative z-10">
                 <div className="bg-white/10 p-4 rounded-2xl text-center backdrop-blur-sm border border-white/10">
                     <div className="text-3xl font-black text-yellow-400">{currentUserStats.points}</div>
                     <div className="text-[10px] uppercase font-bold tracking-widest text-white/70">Points</div>
                 </div>
                 <div className="bg-white/10 p-4 rounded-2xl text-center backdrop-blur-sm border border-white/10">
                     <div className="text-3xl font-black text-orange-400">{currentUserStats.streak} 🔥</div>
                     <div className="text-[10px] uppercase font-bold tracking-widest text-white/70">Streak</div>
                 </div>
             </div>
         </SpotlightCard>

         <div className="glass-panel p-6 rounded-3xl flex-1">
             <h3 className="font-bold text-slate-800 dark:text-white mb-4">🏆 Top Scholars</h3>
             <div className="space-y-3">
                 {leaderboard.map((user, idx) => (
                     <div key={user.uid} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition">
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${idx < 3 ? 'bg-yellow-400 text-black' : 'bg-slate-200 text-slate-600'}`}>{idx + 1}</div>
                         <div className="flex-1 min-w-0">
                             <div className="font-bold text-sm text-slate-700 dark:text-slate-200 truncate">{user.name}</div>
                             <div className="text-xs text-indigo-500 font-bold">{user.points} XP</div>
                         </div>
                     </div>
                 ))}
             </div>
         </div>
      </div>

      {activePdfText && (
        <ChatComponent 
            key={activeFileName} 
            pdfText={activePdfText} 
            fileName={activeFileName} 
        />
      )}
    </div>
  );
};
export default StudentDashboard;
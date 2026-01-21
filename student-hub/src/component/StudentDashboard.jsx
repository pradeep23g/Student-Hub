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
} from "../services/userService"; // ✅ Gamification Services
import { auth } from "../firebase"; 
import ChatComponent from "./ChatComponent";
import GlobalChat from "./GlobalChat";
import ConfirmationModal from "./ConfirmationModal";

const StudentDashboard = ({ role }) => {
  // === DATA STATE ===
  const [resources, setResources] = useState([]);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUserStats, setCurrentUserStats] = useState({ points: 0, streak: 0 });

  // === NAVIGATION STATE ===
  const [viewMode, setViewMode] = useState("home"); // 'home' | 'superbrain' | 'saved'
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);

  // === ACTIVE FILE STATE ===
  const [activePdfText, setActivePdfText] = useState("");
  const [activeFileName, setActiveFileName] = useState("");

  // === EDITING & MODALS ===
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ title: "", subject: "", unit: "" });
  const [modalConfig, setModalConfig] = useState({ isOpen: false });

  // === REFS ===
  const studyTimerRef = useRef(null); // ⏱️ To track reading time

  useEffect(() => {
    loadResources();
    
    // Initialize User Data (Streaks, Stats, Bookmarks)
    if (auth.currentUser) {
        initializeUserData();
    }

    // Cleanup timer when leaving
    return () => clearInterval(studyTimerRef.current);
  }, []);

  const loadResources = async () => {
    const data = await getPublishedResources();
    setResources(data);
  };

  const initializeUserData = async () => {
      const uid = auth.currentUser.uid;
      
      // 1. Check & Bump Streak
      await checkAndBumpStreak(uid);
      
      // 2. Load Stats
      const stats = await getUserStats(uid);
      if(stats) setCurrentUserStats({ points: stats.points || 0, streak: stats.streak || 0 });
      
      // 3. Load Bookmarks
      const saved = await getUserBookmarks(uid);
      setBookmarkedIds(new Set(saved));

      // 4. Load Leaderboard
      const leaders = await getLeaderboardData();
      setLeaderboard(leaders);
  };

  /* --- ACTIONS --- */
  
  // Bookmark Handler
  const handleBookmark = async (resourceId) => {
    if (!auth.currentUser) return alert("Please login to save.");
    
    // Optimistic Update
    const newSet = new Set(bookmarkedIds);
    if (newSet.has(resourceId)) newSet.delete(resourceId);
    else newSet.add(resourceId);
    setBookmarkedIds(newSet);

    // Backend Update
    await toggleBookmark(auth.currentUser.uid, resourceId);
  };

  // Open AI & Start Timer
  const handleOpenAI = (file) => {
    window.open(file.fileUrl, "_blank");
    setActiveFileName(file.title);

    // ⏱️ START TIMER
    if (studyTimerRef.current) clearInterval(studyTimerRef.current);
    
    console.log("🎓 Study Session Started!");
    studyTimerRef.current = setInterval(async () => {
        if(auth.currentUser) {
            // Give 5 points every 60 seconds
            await addPoints(auth.currentUser.uid, 5);
            
            // Update local display
            setCurrentUserStats(prev => ({ ...prev, points: (prev.points || 0) + 5 }));
            console.log("💰 Points added for studying!");
        }
    }, 60000); 

    if (file.fullText && file.fullText.length > 0) {
      setActivePdfText(file.fullText);
    } else {
      setActivePdfText("");
      alert("⚠️ File opened, but AI not ready (not scanned).");
    }
  };

  /* --- EDIT/DELETE HELPERS --- */
  const startEdit = (file) => {
    setEditingId(file.id);
    setEditData({ title: file.title, subject: file.subject, unit: file.unit || "" });
  };
  const saveEdit = async (id) => { await updateResource(id, editData); setEditingId(null); loadResources(); };
  
  const handleDeleteTrigger = (id) => {
    setModalConfig({
        isOpen: true, title: "Delete Resource?", message: "This action cannot be undone.", isDangerous: true,
        onConfirm: async () => {
            await deleteResource(id);
            setModalConfig({ isOpen: false });
            loadResources();
        }
    });
  };

  /* --- FILTERING LOGIC --- */
  const subjects = [...new Set(resources.map(r => r.subject))];
  
  // Decide what resources to show
  const displayedResources = viewMode === 'saved' 
    ? resources.filter(r => bookmarkedIds.has(r.id)) 
    : resources;

  /* ================= RENDER ================= */
  
  // 1. SUPERBRAIN VIEW
  if (viewMode === "superbrain") {
    return (
        <div className="animate-fade-in">
            <button onClick={() => setViewMode("home")} className="mb-4 text-slate-400 hover:text-white flex items-center gap-2 transition">← Back to Dashboard</button>
            <GlobalChat />
        </div>
    );
  }

  // 2. MAIN DASHBOARD VIEW
  return (
    <div className="mt-8 max-w-7xl mx-auto px-4 flex flex-col lg:flex-row gap-8">
      <ConfirmationModal {...modalConfig} onCancel={() => setModalConfig({isOpen: false})} />
      
      {/* === LEFT COLUMN: CONTENT === */}
      <div className="flex-1 min-w-0">
        
        {/* HERO / HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-end mb-8 border-b border-slate-700 pb-4 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-white">Student Library</h1>
                <p className="text-slate-400">Read, Learn, Earn Points.</p>
            </div>
            <div className="flex gap-2">
                <button 
                    onClick={() => { setViewMode("home"); setSelectedSubject(null); setSelectedUnit(null); }}
                    className={`px-4 py-2 rounded-lg font-medium transition ${viewMode === 'home' ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
                >
                    Browse All
                </button>
                <button 
                    onClick={() => { setViewMode("saved"); setSelectedSubject(null); setSelectedUnit(null); }}
                    className={`px-4 py-2 rounded-lg font-medium transition ${viewMode === 'saved' ? "bg-yellow-500 text-black" : "text-slate-400 hover:text-yellow-400"}`}
                >
                    My Saved ({bookmarkedIds.size})
                </button>
            </div>
        </div>

        {/* EMPTY STATE FOR SAVED */}
        {viewMode === 'saved' && displayedResources.length === 0 && (
             <div className="text-center py-20 bg-slate-800/50 rounded-2xl border border-dashed border-slate-700">
                <p className="text-4xl mb-2">🔖</p>
                <p className="text-slate-400">You haven't bookmarked anything yet.</p>
             </div>
        )}

        {/* NAVIGATION: SUBJECT GRID (Home only) */}
        {!selectedSubject && viewMode === 'home' && (
            <>
                {/* Superbrain Banner */}
                <div 
                    onClick={() => setViewMode("superbrain")}
                    className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-3xl p-8 mb-10 shadow-2xl border border-indigo-500/30 flex items-center justify-between relative overflow-hidden group cursor-pointer"
                >
                    <div className="z-10">
                        <h2 className="text-2xl font-bold text-white mb-1">🧠 Superbrain AI</h2>
                        <p className="text-indigo-200 text-sm">Ask questions across your entire library instantly.</p>
                    </div>
                    <div className="z-10 bg-white/10 p-3 rounded-full group-hover:bg-white/20 transition">🚀</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subjects.map(subject => (
                        <button key={subject} onClick={() => setSelectedSubject(subject)} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-indigo-500 transition text-left group">
                            <div className="text-4xl mb-4 group-hover:scale-110 transition origin-left">📁</div>
                            <h3 className="text-xl font-bold text-white">{subject}</h3>
                            <p className="text-sm text-slate-400 mt-1">{resources.filter(r => r.subject === subject).length} resources</p>
                        </button>
                    ))}
                </div>
            </>
        )}

        {/* NAVIGATION: UNITS */}
        {selectedSubject && !selectedUnit && viewMode === 'home' && (
             <div className="animate-fade-in-up">
                <button onClick={() => setSelectedSubject(null)} className="mb-6 text-indigo-400 hover:text-white transition">← Back to Subjects</button>
                <h2 className="text-3xl font-bold text-white mb-8">{selectedSubject}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {[...new Set(resources.filter(r => r.subject === selectedSubject).map(r => r.unit || "Uncategorized"))].map(unit => (
                        <button key={unit} onClick={() => setSelectedUnit(unit)} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:bg-slate-700 transition text-left">
                            <h3 className="text-lg font-bold text-white">{unit}</h3>
                        </button>
                    ))}
                </div>
             </div>
        )}

        {/* FILE LIST (Shown for Saved Mode OR Subject+Unit selection) */}
        {(viewMode === 'saved' || (selectedSubject && selectedUnit)) && displayedResources.length > 0 && (
            <div className="animate-fade-in-up">
                {viewMode === 'home' && (
                    <div className="flex items-center gap-2 mb-6">
                        <button onClick={() => setSelectedUnit(null)} className="text-indigo-400 hover:text-white">← Back</button>
                        <span className="text-slate-600">|</span>
                        <h2 className="text-xl font-bold text-white">{selectedSubject} / {selectedUnit}</h2>
                    </div>
                )}
                
                <div className="grid grid-cols-1 gap-4">
                    {displayedResources
                        .filter(r => viewMode === 'saved' ? true : (r.subject === selectedSubject && (r.unit || "Uncategorized") === selectedUnit))
                        .map(file => (
                        <div key={file.id} className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-slate-500 transition shadow-sm">
                             {editingId !== file.id ? (
                                <div className="flex flex-col sm:flex-row justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-lg font-bold text-white">{file.title}</h3>
                                            {/* BOOKMARK BUTTON */}
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleBookmark(file.id); }}
                                                className={`text-2xl transition hover:scale-110 ml-2 ${bookmarkedIds.has(file.id) ? "text-yellow-400" : "text-slate-600 hover:text-slate-400"}`}
                                                title="Bookmark"
                                            >
                                                {bookmarkedIds.has(file.id) ? "★" : "☆"}
                                            </button>
                                        </div>
                                        <p className="text-sm text-slate-400 mt-1">{file.subject} • {file.unit}</p>
                                        {file.aiReady && <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded inline-block mt-2">AI READY</span>}
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleOpenAI(file)}
                                            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 ${file.aiReady ? "bg-indigo-600 hover:bg-indigo-500 text-white" : "bg-slate-700 text-slate-300"}`}
                                        >
                                            {file.aiReady ? "Chat 🤖" : "Read PDF"}
                                        </button>
                                        {role === 'moderator' && (
                                            <>
                                                <button onClick={() => startEdit(file)} className="p-2 text-yellow-400 bg-yellow-400/10 rounded">✏</button>
                                                <button onClick={() => handleDeleteTrigger(file.id)} className="p-2 text-red-400 bg-red-400/10 rounded">🗑</button>
                                            </>
                                        )}
                                    </div>
                                </div>
                             ) : (
                                /* EDIT FORM */
                                <div className="space-y-3">
                                    <input value={editData.title} onChange={e => setEditData({...editData, title: e.target.value})} className="w-full bg-slate-700 p-2 rounded text-white"/>
                                    <div className="flex gap-2">
                                         <button onClick={() => saveEdit(file.id)} className="flex-1 bg-green-600 py-2 rounded text-white text-sm">Save</button>
                                         <button onClick={() => setEditingId(null)} className="flex-1 bg-slate-600 py-2 rounded text-white text-sm">Cancel</button>
                                    </div>
                                </div>
                             )}
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>

      {/* === RIGHT COLUMN: STATS & LEADERBOARD === */}
      {viewMode === 'home' && (
        <div className="w-full lg:w-80 space-y-6">
            
            {/* 1. MY STATS CARD */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-2xl border border-indigo-500/30 shadow-lg">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <span>👤</span> My Stats
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800/50 p-3 rounded-xl text-center border border-indigo-500/20">
                        <p className="text-2xl font-bold text-yellow-400">{currentUserStats.points}</p>
                        <p className="text-xs text-slate-400 uppercase tracking-wider">Points</p>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded-xl text-center border border-indigo-500/20">
                        <p className="text-2xl font-bold text-orange-400">{currentUserStats.streak} 🔥</p>
                        <p className="text-xs text-slate-400 uppercase tracking-wider">Day Streak</p>
                    </div>
                </div>
            </div>

            {/* 2. LEADERBOARD */}
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 backdrop-blur-sm sticky top-6">
                <div className="flex items-center gap-3 mb-6">
                    <span className="text-2xl">🏆</span>
                    <h3 className="font-bold text-white text-lg">Top Scholars</h3>
                </div>
                
                <div className="space-y-4">
                    {leaderboard.length === 0 ? (
                        <p className="text-slate-500 text-sm">No data yet.</p>
                    ) : (
                        leaderboard.map((user, index) => (
                            <div key={user.uid} className="flex items-center gap-3 pb-3 border-b border-slate-700/50 last:border-0 last:pb-0">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                                    ${index === 0 ? "bg-yellow-500 text-black" : 
                                      index === 1 ? "bg-slate-300 text-black" : 
                                      index === 2 ? "bg-amber-700 text-white" : "bg-slate-700 text-slate-300"}`}>
                                    {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white text-sm font-medium truncate">{user.name}</p>
                                    <p className="text-xs text-yellow-500 font-mono">{user.points} pts</p>
                                </div>
                                {index === 0 && <span className="text-lg">👑</span>}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
      )}

      {/* CHAT OVERLAY */}
      {activePdfText && (
        <ChatComponent pdfText={activePdfText} fileName={activeFileName} />
      )}
    </div>
  );
};

export default StudentDashboard;
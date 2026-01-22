import { useEffect, useState } from "react";
import { getModerationQueue, publishResource, getPublishedResourcesForAdmin, deleteResource, updateResource } from "../adminService";
import { extractTextFromPDF } from "../utils/pdfUtils";
import SpotlightCard from "./SpotlightCard";
import GlowButton from "./GlowButton";
import { motion } from "framer-motion";

const ModeratorDashboard = () => {
  const [activeTab, setActiveTab] = useState("queue"); // 'queue' | 'published'
  const [queue, setQueue] = useState([]);
  const [published, setPublished] = useState([]);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [editData, setEditData] = useState({ title: "", subject: "", unit: "" });

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setQueue(await getModerationQueue());
    setPublished(await getPublishedResourcesForAdmin());
  };

  /* === ACTIONS === */
  const handleApprove = async (file) => {
     setIsProcessing(true);
     try {
        const text = await extractTextFromPDF(file.fileUrl);
        await publishResource(file.id, { ...editData, fullText: text, aiReady: text.length > 50 });
        setOpenId(null); 
        loadAll();
     } catch(e) { console.error(e); alert("Error processing PDF"); }
     setIsProcessing(false);
  };

  const handleUpdate = async (id) => {
      await updateResource(id, editData);
      setOpenId(null);
      loadAll();
  };

  const handleReject = async (id) => {
     if(window.confirm("Delete permanently?")) {
        await deleteResource(id);
        loadAll();
     }
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in-up space-y-8">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Pending Stat */}
         <div onClick={() => setActiveTab("queue")} className={`cursor-pointer transition group`}>
             <SpotlightCard 
                className={`p-6 rounded-3xl border transition-all duration-300 ${
                    activeTab === 'queue' 
                    ? 'border-indigo-500/50 bg-indigo-500/10' 
                    : 'border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/50'
                }`} 
                spotlightColor="rgba(99, 102, 241, 0.2)"
             >
                <div className="absolute top-0 right-0 p-12 bg-indigo-500/20 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-indigo-500/30 transition"></div>
                <div className="relative z-10">
                    <div className="text-slate-500 dark:text-slate-400 font-bold uppercase text-xs tracking-wider mb-2">Pending Review</div>
                    <div className="text-5xl font-black text-slate-800 dark:text-white">{queue.length}</div>
                </div>
             </SpotlightCard>
         </div>

         {/* Published Stat */}
         <div onClick={() => setActiveTab("published")} className={`cursor-pointer transition group`}>
             <SpotlightCard 
                className={`p-6 rounded-3xl border transition-all duration-300 ${
                    activeTab === 'published' 
                    ? 'border-green-500/50 bg-green-500/10' 
                    : 'border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/50'
                }`} 
                spotlightColor="rgba(34, 197, 94, 0.2)"
             >
                <div className="absolute top-0 right-0 p-12 bg-green-500/20 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-green-500/30 transition"></div>
                <div className="relative z-10">
                    <div className="text-slate-500 dark:text-slate-400 font-bold uppercase text-xs tracking-wider mb-2">Live Resources</div>
                    <div className="text-5xl font-black text-slate-800 dark:text-white">{published.length}</div>
                </div>
             </SpotlightCard>
         </div>
      </div>

      <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-black text-slate-800 dark:text-white">
              {activeTab === 'queue' ? "🛡️ Moderation Queue" : "📚 Library Management"}
          </h2>
      </div>

      <div className="grid gap-4">
          {(activeTab === 'queue' ? queue : published).map(file => (
             <motion.div layout key={file.id}>
                 <SpotlightCard className="p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/50" spotlightColor="rgba(255, 255, 255, 0.1)">
                    <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-6">
                       <div>
                           <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                               📄 {file.title || file.originalName}
                           </h3>
                           <p className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider mt-1">
                               {file.subject || "No Subject"} • {file.unit || "General"}
                           </p>
                       </div>
                       <a 
                           href={file.fileUrl} 
                           target="_blank" 
                           rel="noreferrer"
                           className="text-xs font-mono text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-lg transition hover:bg-slate-200 dark:hover:bg-white/10 flex items-center gap-2 w-fit"
                       >
                           View PDF ↗
                       </a>
                    </div>
                    
                    {openId === file.id ? (
                       /* === EDIT MODE === */
                       <motion.div 
                           initial={{ opacity: 0, height: 0 }} 
                           animate={{ opacity: 1, height: "auto" }}
                           className="space-y-4 bg-slate-50 dark:bg-black/20 p-4 rounded-xl border border-slate-200 dark:border-white/5"
                       >
                           {/* Adaptive Inputs */}
                           <div>
                               <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block pl-1">Title</label>
                               <input 
                                   placeholder="Resource Title" 
                                   value={editData.title} 
                                   onChange={e=>setEditData({...editData, title:e.target.value})} 
                                   className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                               />
                           </div>
                           <div className="flex flex-col md:flex-row gap-3">
                               <div className="flex-1">
                                   <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block pl-1">Subject</label>
                                   <input 
                                       placeholder="e.g. Physics" 
                                       value={editData.subject} 
                                       onChange={e=>setEditData({...editData, subject:e.target.value})} 
                                       className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none transition" 
                                   />
                               </div>
                               <div className="flex-1">
                                   <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block pl-1">Unit</label>
                                   <input 
                                       placeholder="e.g. Unit 1" 
                                       value={editData.unit} 
                                       onChange={e=>setEditData({...editData, unit:e.target.value})} 
                                       className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none transition" 
                                   />
                               </div>
                           </div>

                           {/* Action Buttons */}
                           <div className="flex flex-col md:flex-row gap-3 pt-2">
                              {activeTab === 'queue' ? (
                                  <GlowButton 
                                      onClick={()=>handleApprove(file)} 
                                      text={isProcessing ? "Processing..." : "Approve & Publish"}
                                      color="#4ade80" // Green
                                      className="flex-1"
                                      icon={<span>✅</span>}
                                  />
                              ) : (
                                  <GlowButton 
                                      onClick={()=>handleUpdate(file.id)} 
                                      text="Save Changes"
                                      color="#fbbf24" // Yellow
                                      className="flex-1"
                                      icon={<span>💾</span>}
                                  />
                              )}
                              
                              <GlowButton 
                                  onClick={()=>handleReject(file.id)} 
                                  text="Delete"
                                  color="#ef4444" // Red
                                  icon={<span>🗑️</span>}
                              />
                              
                              <button 
                                  onClick={() => setOpenId(null)}
                                  className="px-4 py-2 text-slate-500 font-bold hover:text-slate-800 dark:hover:text-white transition text-sm"
                              >
                                  Cancel
                              </button>
                           </div>
                       </motion.div>
                    ) : (
                       /* === VIEW MODE === */
                       <button 
                           onClick={()=>{setOpenId(file.id); setEditData({title: file.title || "", subject: file.subject || "", unit: file.unit || ""})}} 
                           className="w-full py-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold hover:border-indigo-500 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/5 transition flex items-center justify-center gap-2"
                       >
                           <span>✏️</span> {activeTab === 'queue' ? "Review & Process" : "Edit Details"}
                       </button>
                    )}
                 </SpotlightCard>
             </motion.div>
          ))}
          
          {(activeTab === 'queue' ? queue : published).length === 0 && (
              <div className="text-center py-20 bg-slate-100 dark:bg-white/5 rounded-3xl border border-dashed border-slate-300 dark:border-white/10">
                  <p className="text-slate-500 dark:text-slate-400 font-bold">List is empty. ✨</p>
              </div>
          )}
      </div>
    </div>
  );
};
export default ModeratorDashboard;
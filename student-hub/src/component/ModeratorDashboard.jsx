import { useEffect, useState } from "react";
import {
  getModerationQueue,
  publishResource,
  getPublishedResourcesForAdmin,
  deleteResource
} from "../adminService";
import { extractTextFromPDF } from "../utils/pdfUtils";
import ConfirmationModal from "./ConfirmationModal";

const ModeratorDashboard = () => {
  const [queue, setQueue] = useState([]);
  const [publishedCount, setPublishedCount] = useState(0);
  const [openId, setOpenId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Modal State
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    isDangerous: false
  });

  const [editData, setEditData] = useState({
    title: "",
    subject: "",
    unit: ""
  });

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    const qData = await getModerationQueue();
    const pData = await getPublishedResourcesForAdmin();
    setQueue(qData);
    setPublishedCount(pData.length);
  };

  const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });

  /* ================= APPROVE LOGIC ================= */
  const triggerApprove = (file) => {
    // Validation
    if (!editData.title || !editData.subject) {
      alert("⚠️ Please fill in Title & Subject before approving.");
      return;
    }

    // Open Custom Modal
    setModalConfig({
      isOpen: true,
      title: "Approve & Scan? 🤖",
      message: "The AI will read this document and add it to the Global Knowledge Base. This process might take a few seconds.",
      isDangerous: false,
      onConfirm: () => handleApproveProcess(file)
    });
  };

  const handleApproveProcess = async (file) => {
    closeModal();
    setIsProcessing(true);
    try {
      console.log("Starting AI Scan for:", file.fileUrl);
      const extractedText = await extractTextFromPDF(file.fileUrl);

      const finalData = {
        ...editData,
        fullText: extractedText,
        aiReady: extractedText.length > 50,
        status: "published",
        moderatedAt: new Date(),
      };

      await publishResource(file.id, finalData);
      
      setOpenId(null);
      setEditData({ title: "", subject: "", unit: "" });
      loadAll();
    } catch (error) {
      console.error("Approval Failed:", error);
      alert("❌ Error scanning file.");
    } finally {
      setIsProcessing(false);
    }
  };

  /* ================= REJECT LOGIC ================= */
  const triggerReject = (fileId) => {
    setModalConfig({
      isOpen: true,
      title: "Reject & Delete?",
      message: "This action cannot be undone. The file will be permanently removed from storage and the database.",
      isDangerous: true,
      onConfirm: () => handleRejectProcess(fileId)
    });
  };

  const handleRejectProcess = async (fileId) => {
    closeModal();
    setIsProcessing(true);
    try {
      const success = await deleteResource(fileId);
      if (success) {
        setQueue(queue.filter(f => f.id !== fileId));
        setOpenId(null);
      } else {
        alert("Error deleting file.");
      }
    } catch (error) {
      console.error("Reject Error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="mt-10 max-w-6xl mx-auto px-4">
      <ConfirmationModal {...modalConfig} onCancel={closeModal} />

      {/* STATS BOARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-3xl border border-slate-700/50 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition group-hover:bg-yellow-500/20"></div>
          <p className="text-slate-400 text-sm font-bold tracking-wider uppercase mb-1">Pending Review</p>
          <div className="flex items-end justify-between">
             <h2 className="text-5xl font-extrabold text-white">{queue.length}</h2>
             <span className="text-3xl">⏳</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-3xl border border-slate-700/50 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition group-hover:bg-green-500/20"></div>
          <p className="text-slate-400 text-sm font-bold tracking-wider uppercase mb-1">Live Resources</p>
          <div className="flex items-end justify-between">
             <h2 className="text-5xl font-extrabold text-white">{publishedCount}</h2>
             <span className="text-3xl">🚀</span>
          </div>
        </div>
      </div>

      {/* QUEUE HEADER */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          Moderation Queue
          {queue.length > 0 && (
            <span className="bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full animate-pulse">
              ACTION NEEDED
            </span>
          )}
        </h2>
      </div>

      {/* EMPTY STATE */}
      {queue.length === 0 ? (
        <div className="text-center py-24 bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-800">
          <div className="text-6xl mb-4 opacity-50">✨</div>
          <h3 className="text-xl font-bold text-white">All Caught Up!</h3>
          <p className="text-slate-500 mt-2">No pending files to review.</p>
        </div>
      ) : (
        /* QUEUE LIST */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {queue.map(file => (
            <div key={file.id} className="bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-indigo-500/50 transition-all shadow-lg">
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-bold text-lg text-white line-clamp-1" title={file.originalName}>
                    {file.originalName}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 font-mono">
                    ID: {file.id.substring(0,8)}...
                  </p>
                </div>
                <a 
                  href={file.fileUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs text-white transition flex items-center gap-1"
                >
                  View PDF ↗
                </a>
              </div>

              {openId === file.id ? (
                /* EDIT FORM */
                <div className="bg-slate-900 p-5 rounded-xl border border-slate-700/50 animate-fade-in-up">
                  <div className="space-y-3 mb-5">
                    <input 
                      placeholder="Resource Title" 
                      value={editData.title}
                      onChange={e => setEditData({ ...editData, title: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input 
                        placeholder="Subject" 
                        value={editData.subject}
                        onChange={e => setEditData({ ...editData, subject: e.target.value })}
                        className="bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <input 
                        placeholder="Unit (Optional)" 
                        value={editData.unit}
                        onChange={e => setEditData({ ...editData, unit: e.target.value })}
                        className="bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => triggerApprove(file)} 
                      disabled={isProcessing}
                      className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl font-bold transition disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                      {isProcessing ? "Scanning..." : "✅ Approve & Scan"}
                    </button>
                    
                    <button 
                      onClick={() => triggerReject(file.id)} 
                      disabled={isProcessing}
                      className="px-4 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-600 hover:border-red-500/50 rounded-xl transition"
                      title="Reject"
                    >
                      🗑️
                    </button>
                    
                    <button 
                      onClick={() => setOpenId(null)} 
                      className="px-4 text-slate-500 hover:text-white transition"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                /* ACTION BUTTON */
                <button 
                  onClick={() => {
                    setOpenId(file.id);
                    setEditData({ title: "", subject: "", unit: "" });
                  }}
                  className="w-full py-3 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-600/30 rounded-xl font-bold transition-all"
                >
                  Review Application
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModeratorDashboard;
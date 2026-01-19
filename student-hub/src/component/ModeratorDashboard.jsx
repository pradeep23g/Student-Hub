import { useEffect, useState } from "react";
import {
  getModerationQueue,
  publishResource,
  getPublishedResourcesForAdmin
} from "../adminService";
import { extractTextFromPDF } from "../utils/pdfUtils"; // ✅ Crucial Import

const ModeratorDashboard = () => {
  const [queue, setQueue] = useState([]);
  const [published, setPublished] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false); // Loading state for scanning

  const [editData, setEditData] = useState({
    title: "",
    subject: "",
    unit: ""
  });

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setQueue(await getModerationQueue());
    setPublished(await getPublishedResourcesForAdmin());
  };

  /* ================= APPROVE & SCAN LOGIC ================= */
  const handleApprove = async (file) => {
    // 1. Validation
    if (!editData.title || !editData.subject) {
      alert("Title & Subject are required");
      return;
    }

    const confirmMsg = "Approve & Scan this file? 🤖\nThe AI will read this file now. This might take a few seconds.";
    if (!window.confirm(confirmMsg)) return;

    setIsProcessing(true); // Lock UI

    try {
      // 2. RUN THE SCANNER
      console.log("Starting AI Scan for:", file.fileUrl);
      
      // Extract text using the utility we built
      const extractedText = await extractTextFromPDF(file.fileUrl);
      console.log("Scan Complete. Characters:", extractedText.length);

      // 3. PREPARE DATA (Include the text!)
      const finalData = {
        ...editData,
        fullText: extractedText,     // <--- THIS IS THE SUPERBRAIN FIELD
        aiReady: extractedText.length > 50, // Flag for UI
        status: "published",
        moderatedAt: new Date(),
      };

      // 4. SAVE TO FIRESTORE
      await publishResource(file.id, finalData);

      alert(`✅ Success! File published & AI read ${extractedText.length} characters.`);
      
      // Cleanup
      setOpenId(null);
      setEditData({ title: "", subject: "", unit: "" });
      loadAll();

    } catch (error) {
      console.error("Approval Failed:", error);
      alert("❌ Error scanning file. Check console.");
    } finally {
      setIsProcessing(false); // Unlock UI
    }
  };

  return (
    <div className="mt-16">

      {/* ================= PENDING ================= */}
      <h2 className="text-2xl font-bold mb-6 text-yellow-400">
        🟡 Pending Approvals ({queue.length})
      </h2>

      {queue.length === 0 ? (
        <p className="text-slate-400">No pending files. Clean queue ✨</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {queue.map(file => (
            <div
              key={file.id}
              className="bg-slate-800 border border-slate-700 rounded-2xl p-5"
            >
              <h3 className="font-semibold text-lg mb-1">
                {file.originalName}
              </h3>

              <a
                href={file.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 text-sm underline"
              >
                Preview file
              </a>

              <button
                disabled={isProcessing}
                onClick={() => setOpenId(openId === file.id ? null : file.id)}
                className="mt-4 px-4 py-2 bg-yellow-500 hover:bg-yellow-600
                           text-black rounded-lg transition disabled:opacity-50"
              >
                {isProcessing ? "Scanning..." : "Review"}
              </button>

              {/* ===== EXPAND REVIEW ===== */}
              {openId === file.id && (
                <div className="mt-4 space-y-3 bg-slate-900 p-4 rounded-xl border border-slate-700">
                  <input
                    placeholder="Title"
                    value={editData.title}
                    onChange={e => setEditData({ ...editData, title: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-slate-800 text-white"
                  />
                  <input
                    placeholder="Subject"
                    value={editData.subject}
                    onChange={e => setEditData({ ...editData, subject: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-slate-800 text-white"
                  />
                  <input
                    placeholder="Unit (optional)"
                    value={editData.unit}
                    onChange={e => setEditData({ ...editData, unit: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-slate-800 text-white"
                  />

                  <div className="flex gap-3 pt-2">
                    <button
                      disabled={isProcessing}
                      onClick={() => handleApprove(file)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50 text-white"
                    >
                      {isProcessing ? "⏳ Scanning..." : "Approve & Publish"}
                    </button>

                    <button
                      disabled={isProcessing}
                      onClick={() => setOpenId(null)}
                      className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ================= PUBLISHED ================= */}
      <h2 className="text-2xl font-bold mt-16 mb-6 text-green-400">
        🟢 Published Resources ({published.length})
      </h2>

      {published.length === 0 ? (
        <p className="text-slate-400">Nothing published yet.</p>
      ) : (
        <ul className="space-y-3 text-slate-300">
          {published.map(file => (
            <li key={file.id}>
              <strong>{file.title}</strong>{" "}
              <span className="text-slate-500">
                — {file.subject} / {file.unit || "—"}
                {file.aiReady ? " 🤖 AI Ready" : ""}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ModeratorDashboard;
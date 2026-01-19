import { useEffect, useState } from "react";
import { getPublishedResources } from "../resourceService";
import { updateResource, deleteResource } from "../adminService";
import ChatComponent from "./ChatComponent";


const StudentDashboard = ({ role }) => {
  const [resources, setResources] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);

  const [activePdfText, setActivePdfText] = useState("");
  const [activeFileName, setActiveFileName] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    title: "",
    subject: "",
    unit: ""
  });

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    const data = await getPublishedResources();
    setResources(data);
  };

  const subjects = [...new Set(resources.map(r => r.subject))];

  // Helper: Enable AI Mode
  const handleOpenAI = (file) => {
    // 1. Open File
    window.open(file.fileUrl, "_blank");

    // 2. Set Active Context for Chat
    setActiveFileName(file.title);

    // 3. CHECK DATABASE FOR TEXT
    if (file.fullText && file.fullText.length > 0) {
      console.log("✅ Using pre-scanned text from DB");
      setActivePdfText(file.fullText);
    } else {
      console.warn("⚠️ No text found in DB for this file.");
      setActivePdfText("");
      alert("⚠️ This file hasn't been scanned for AI yet.");
    }
  };

  /* ... (Rest of your component logic: startEdit, saveEdit, handleDelete) ... */
  // (Copy your existing startEdit, saveEdit, handleDelete functions here)
  
  // Minimal Edit/Delete Placeholders for completeness
  const startEdit = (file) => {
    setEditingId(file.id);
    setEditData({ title: file.title, subject: file.subject, unit: file.unit || "" });
  };
  const saveEdit = async (id) => {
    await updateResource(id, editData);
    setEditingId(null);
    loadResources();
  };
  const handleDelete = async (id) => {
    if(window.confirm("Delete?")) { await deleteResource(id); loadResources(); }
  };


  /* ================= RENDER ================= */
  if (subjects.length === 0) {
    return (
      <div className="text-center text-slate-400 mt-20">
        <p className="text-lg">No resources published yet.</p>
      </div>
    );
  }

  return (
    <div>
      {/* SUBJECTS & UNITS NAVIGATION (Same as before) */}
      {!selectedSubject && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {subjects.map(subject => (
            <button key={subject} onClick={() => setSelectedSubject(subject)} 
              className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:bg-slate-700 transition">
              <h3 className="text-xl font-bold">{subject}</h3>
            </button>
          ))}
        </div>
      )}

      {selectedSubject && !selectedUnit && (
         /* (Unit Selection Logic - Same as before) */
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <button onClick={() => setSelectedSubject(null)} className="text-indigo-400">← Back</button>
            {[...new Set(resources.filter(r => r.subject === selectedSubject).map(r => r.unit || "Uncategorized"))].map(unit => (
                <button key={unit} onClick={() => setSelectedUnit(unit)} className="bg-slate-800 p-5 rounded-xl border border-slate-700">
                    {unit}
                </button>
            ))}
         </div>
      )}

      {/* FILE LIST (This is the important part) */}
      {selectedSubject && selectedUnit && (
        <>
          <button onClick={() => setSelectedUnit(null)} className="mb-6 text-indigo-400">← Back</button>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources
              .filter(r => r.subject === selectedSubject && (r.unit || "Uncategorized") === selectedUnit)
              .map(file => (
                <div key={file.id} className="bg-slate-800 border border-slate-700 rounded-xl p-5">
                  {/* ... (Edit Mode UI Logic) ... */}
                  {editingId !== file.id && (
                    <>
                      <h3 className="text-lg font-bold mb-1">{file.title}</h3>
                      <p className="text-sm text-slate-400 mb-4">{file.unit}</p>

                      {/* ✅ THE NEW BUTTON */}
                      <button
                        onClick={() => handleOpenAI(file)}
                        className="inline-block mb-3 px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-700 text-white"
                      >
                        {file.aiReady ? "Open & Enable AI 🤖" : "Open File (No AI)"}
                      </button>

                      {/* Moderator Controls */}
                      {role === "moderator" && (
                        <div className="flex gap-3 mt-2">
                           <button onClick={() => startEdit(file)} className="text-yellow-400">✏ Edit</button>
                           <button onClick={() => handleDelete(file.id)} className="text-red-400">🗑 Delete</button>
                        </div>
                      )}
                    </>
                  )}
                  {/* ... (Edit Mode Inputs) ... */}
                  {editingId === file.id && (
                    <div className="flex flex-col gap-2">
                        <input value={editData.title} onChange={e => setEditData({...editData, title: e.target.value})} className="bg-slate-700 p-2 rounded"/>
                        <button onClick={() => saveEdit(file.id)} className="bg-green-600 p-2 rounded">Save</button>
                        <button onClick={() => setEditingId(null)} className="bg-slate-600 p-2 rounded">Cancel</button>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </>
      )}

      {/* CHAT COMPONENT */}
      {activePdfText && (
        <ChatComponent pdfText={activePdfText} fileName={activeFileName} />
      )}
    </div>
  );
};

export default StudentDashboard;
import { useEffect, useState } from "react";
import {
  getModerationQueue,
  publishResource,
  updateResource,
  getPublishedResourcesForAdmin
} from "../adminService";

const ModeratorDashboard = () => {
  const [queue, setQueue] = useState([]);
  const [published, setPublished] = useState([]);

  const [openId, setOpenId] = useState(null);

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

  /* ================= APPROVE ================= */
  const handleApprove = async (file) => {
    if (!editData.title || !editData.subject) {
      alert("Title & Subject are required");
      return;
    }

    await publishResource(file.id, editData);
    setOpenId(null);
    setEditData({ title: "", subject: "", unit: "" });
    loadAll();
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
                onClick={() =>
                  setOpenId(openId === file.id ? null : file.id)
                }
                className="mt-4 px-4 py-2 bg-yellow-500 hover:bg-yellow-600
                           text-black rounded-lg transition"
              >
                Review
              </button>

              {/* ===== EXPAND REVIEW ===== */}
              {openId === file.id && (
                <div className="mt-4 space-y-3
                                bg-slate-900 p-4 rounded-xl border border-slate-700">

                  <input
                    placeholder="Title"
                    value={editData.title}
                    onChange={e =>
                      setEditData({ ...editData, title: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded bg-slate-800"
                  />

                  <input
                    placeholder="Subject"
                    value={editData.subject}
                    onChange={e =>
                      setEditData({ ...editData, subject: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded bg-slate-800"
                  />

                  <input
                    placeholder="Unit (optional)"
                    value={editData.unit}
                    onChange={e =>
                      setEditData({ ...editData, unit: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded bg-slate-800"
                  />

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => handleApprove(file)}
                      className="px-4 py-2 bg-green-600
                                 hover:bg-green-700 rounded-lg"
                    >
                      Approve & Publish
                    </button>

                    <button
                      onClick={() => setOpenId(null)}
                      className="px-4 py-2 bg-slate-600
                                 hover:bg-slate-500 rounded-lg"
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
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ModeratorDashboard;

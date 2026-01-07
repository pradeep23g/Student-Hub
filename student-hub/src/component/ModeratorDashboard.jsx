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

  const [editingId, setEditingId] = useState(null);
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

  /* ================= APPROVE RAW ================= */
  const handleApprove = async (file) => {
    const title = prompt("Edit title:", file.originalName);
    const subject = prompt("Enter subject:", "");
    const unit = prompt("Enter unit / unit code:", "");

    if (!title || !subject) return;

    await publishResource(file.id, { title, subject, unit });
    alert("Published ✅");
    loadAll();
  };

  /* ================= EDIT PUBLISHED ================= */
  const startEdit = (file) => {
    setEditingId(file.id);
    setEditData({
      title: file.title,
      subject: file.subject,
      unit: file.unit || ""
    });
  };

  const saveEdit = async (id) => {
    await updateResource(id, editData);
    setEditingId(null);
    loadAll();
  };

  return (
    <div style={{ padding: "20px", border: "1px solid #444", marginTop: "20px" }}>
      
      {/* -------- RAW QUEUE -------- */}
      <h3>🟡 Pending Approvals ({queue.length})</h3>

      {queue.length === 0 ? (
        <p>No pending files. Good job.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {queue.map(file => (
            <li key={file.id} style={{ marginBottom: "15px" }}>
              <strong>{file.originalName}</strong><br />
              <a href={file.fileURL} target="_blank" rel="noreferrer">
                View File
              </a><br />
              <button onClick={() => handleApprove(file)}>
                Approve & Publish
              </button>
            </li>
          ))}
        </ul>
      )}

      <hr />

      {/* -------- PUBLISHED MANAGER -------- */}
      <h3>🟢 Published Resources ({published.length})</h3>

      {published.length === 0 ? (
        <p>No published resources.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {published.map(file => (
            <li key={file.id} style={{ marginBottom: "20px" }}>
              {editingId === file.id ? (
                <>
                  <input
                    value={editData.title}
                    onChange={e =>
                      setEditData({ ...editData, title: e.target.value })
                    }
                  /><br />
                  <input
                    value={editData.subject}
                    onChange={e =>
                      setEditData({ ...editData, subject: e.target.value })
                    }
                  /><br />
                  <input
                    value={editData.unit}
                    onChange={e =>
                      setEditData({ ...editData, unit: e.target.value })
                    }
                  /><br />
                  <button onClick={() => saveEdit(file.id)}>💾 Save</button>
                  <button onClick={() => setEditingId(null)}>❌ Cancel</button>
                </>
              ) : (
                <>
                  <strong>{file.title}</strong><br />
                  <small>
                    {file.subject} — Unit {file.unit || "—"}
                  </small><br />
                  <button onClick={() => startEdit(file)}>✏ Edit</button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ModeratorDashboard;

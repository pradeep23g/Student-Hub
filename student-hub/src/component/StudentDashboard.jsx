import { useEffect, useState } from "react";
import { getPublishedResources } from "../resourceService";
import { updateResource, deleteResource } from "../adminService";

const StudentDashboard = ({ role }) => {
  const [resources, setResources] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);

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
    loadResources();
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this resource?");
    if (!ok) return;

    await deleteResource(id);
    loadResources();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>📚 Student Hub</h2>

      {/* ================= SUBJECT FOLDERS ================= */}
      {!selectedSubject && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "20px"
        }}>
          {subjects.map(subject => (
            <div
              key={subject}
              onClick={() => setSelectedSubject(subject)}
              style={{
                border: "1px solid #444",
                padding: "20px",
                borderRadius: "8px",
                cursor: "pointer"
              }}
            >
              <h3>📁 {subject}</h3>
              <p>{resources.filter(r => r.subject === subject).length} files</p>
            </div>
          ))}
        </div>
      )}

      {/* ================= UNIT FOLDERS ================= */}
      {selectedSubject && !selectedUnit && (
        <>
          <button onClick={() => setSelectedSubject(null)}>⬅ Back to Subjects</button>
          <h3>{selectedSubject}</h3>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: "15px",
            marginTop: "15px"
          }}>
            {[...new Set(
              resources
                .filter(r => r.subject === selectedSubject)
                .map(r => r.unit || "Uncategorized")
            )].map(unit => (
              <div
                key={unit}
                onClick={() => setSelectedUnit(unit)}
                style={{
                  border: "1px solid #555",
                  padding: "15px",
                  borderRadius: "8px",
                  cursor: "pointer"
                }}
              >
                <h4>📁 Unit {unit}</h4>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ================= FILES ================= */}
      {selectedSubject && selectedUnit && (
        <>
          <button onClick={() => setSelectedUnit(null)}>⬅ Back to Units</button>

          <h3>{selectedSubject} → Unit {selectedUnit}</h3>

          <input
            type="text"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ margin: "10px 0", padding: "5px" }}
          />

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "15px"
          }}>
            {resources
              .filter(r =>
                r.subject === selectedSubject &&
                (r.unit || "Uncategorized") === selectedUnit &&
                r.title.toLowerCase().includes(search.toLowerCase())
              )
              .map(file => (
                <div
                  key={file.id}
                  style={{
                    border: "1px solid #333",
                    padding: "15px",
                    borderRadius: "8px"
                  }}
                >
                  {editingId === file.id ? (
                    <>
                      <input
                        value={editData.title}
                        onChange={(e) =>
                          setEditData({ ...editData, title: e.target.value })
                        }
                      />
                      <input
                        value={editData.subject}
                        onChange={(e) =>
                          setEditData({ ...editData, subject: e.target.value })
                        }
                      />
                      <input
                        value={editData.unit}
                        onChange={(e) =>
                          setEditData({ ...editData, unit: e.target.value })
                        }
                      />

                      <button onClick={() => saveEdit(file.id)}>💾 Save</button>
                      <button onClick={() => setEditingId(null)}>❌ Cancel</button>
                    </>
                  ) : (
                    <>
                      <h4>{file.title}</h4>
                      <p><strong>Unit:</strong> {file.unit || "—"}</p>

                      <a
                        href={file.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "inline-block",
                          marginTop: "8px",
                          padding: "6px 10px",
                          background: "#007bff",
                          color: "#fff",
                          borderRadius: "4px",
                          textDecoration: "none"
                        }}
                      >
                        Download / View
                      </a>

                      {/* 🔐 MODERATOR ONLY ACTIONS */}
                      {role === "moderator" && (
                        <div style={{ marginTop: "10px" }}>
                          <button onClick={() => startEdit(file)}>✏ Edit</button>
                          <button
                            onClick={() => handleDelete(file.id)}
                            style={{ marginLeft: "8px", color: "red" }}
                          >
                            🗑 Delete
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  );
};

export default StudentDashboard;
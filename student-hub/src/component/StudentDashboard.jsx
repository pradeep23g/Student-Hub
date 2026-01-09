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

  /* ================= EMPTY STATE ================= */
  if (subjects.length === 0) {
    return (
      <div className="text-center text-slate-400 mt-20">
        <p className="text-lg">No resources published yet.</p>
        <p className="text-sm mt-2">
          Upload something or wait for moderation.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* ================= SUBJECT CARDS ================= */}
      {!selectedSubject && (
        <>
          <h2 className="text-3xl font-bold mb-2">My Subjects</h2>
          <p className="text-slate-400 mb-8">
            Select a subject to view resources
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {subjects.map(subject => {
              const fileCount = resources.filter(
                r => r.subject === subject
              ).length;

              return (
                <button
                  key={subject}
                  onClick={() => setSelectedSubject(subject)}
                  className="group bg-slate-800 hover:bg-slate-700 transition-all
                             p-6 rounded-2xl border border-slate-700
                             text-left relative overflow-hidden"
                >
                  <div className="text-3xl mb-4">📁</div>

                  <h3 className="text-xl font-bold text-white">
                    {subject}
                  </h3>

                  <p className="text-sm text-slate-400 mt-1">
                    {fileCount} files
                  </p>

                  <div className="absolute bottom-0 left-0 h-1 w-0 bg-indigo-500
                                  transition-all group-hover:w-full" />
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* ================= UNIT VIEW ================= */}
      {selectedSubject && !selectedUnit && (
        <>
          <button
            onClick={() => setSelectedSubject(null)}
            className="mb-6 text-indigo-400 hover:underline"
          >
            ← Back to Subjects
          </button>

          <h2 className="text-2xl font-bold mb-6">
            {selectedSubject}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[...new Set(
              resources
                .filter(r => r.subject === selectedSubject)
                .map(r => r.unit || "Uncategorized")
            )].map(unit => (
              <button
                key={unit}
                onClick={() => setSelectedUnit(unit)}
                className="bg-slate-800 border border-slate-700 rounded-xl p-5
                           hover:bg-slate-700 transition text-left"
              >
                <h3 className="text-lg font-semibold">
                  📁 Unit {unit}
                </h3>
              </button>
            ))}
          </div>
        </>
      )}

      {/* ================= FILES VIEW ================= */}
      {selectedSubject && selectedUnit && (
        <>
          <button
            onClick={() => setSelectedUnit(null)}
            className="mb-6 text-indigo-400 hover:underline"
          >
            ← Back to Units
          </button>

          <h2 className="text-2xl font-bold mb-4">
            {selectedSubject} → Unit {selectedUnit}
          </h2>

          <input
            type="text"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-6 w-full max-w-md px-4 py-2 rounded-lg
                       bg-slate-800 border border-slate-700 text-white"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources
              .filter(r =>
                r.subject === selectedSubject &&
                (r.unit || "Uncategorized") === selectedUnit &&
                r.title.toLowerCase().includes(search.toLowerCase())
              )
              .map(file => (
                <div
                  key={file.id}
                  className="bg-slate-800 border border-slate-700 rounded-xl p-5"
                >
                  {editingId === file.id ? (
                    <>
                      <input
                        value={editData.title}
                        onChange={(e) =>
                          setEditData({ ...editData, title: e.target.value })
                        }
                        className="w-full mb-2 px-3 py-2 rounded bg-slate-700"
                      />
                      <input
                        value={editData.subject}
                        onChange={(e) =>
                          setEditData({ ...editData, subject: e.target.value })
                        }
                        className="w-full mb-2 px-3 py-2 rounded bg-slate-700"
                      />
                      <input
                        value={editData.unit}
                        onChange={(e) =>
                          setEditData({ ...editData, unit: e.target.value })
                        }
                        className="w-full mb-4 px-3 py-2 rounded bg-slate-700"
                      />

                      <button
                        onClick={() => saveEdit(file.id)}
                        className="mr-3 px-4 py-2 bg-green-600 rounded hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-4 py-2 bg-slate-600 rounded hover:bg-slate-500"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg font-bold mb-1">
                        {file.title}
                      </h3>
                      <p className="text-sm text-slate-400 mb-4">
                        Unit: {file.unit || "—"}
                      </p>

                      <a
                        href={file.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block mb-3 px-4 py-2
                                   bg-indigo-600 rounded hover:bg-indigo-700"
                      >
                        Open / Download
                      </a>

                      {role === "moderator" && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => startEdit(file)}
                            className="text-yellow-400 hover:underline"
                          >
                            ✏ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(file.id)}
                            className="text-red-400 hover:underline"
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

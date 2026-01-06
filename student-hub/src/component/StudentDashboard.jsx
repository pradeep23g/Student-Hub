import { useEffect, useState } from "react";
import { getPublishedResources } from "../resourceService";

const StudentDashboard = () => {
  const [resources, setResources] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    const data = await getPublishedResources();
    setResources(data);
    setFiltered(data);
  };

  // 🔎 Filter + Search logic
  useEffect(() => {
    let data = resources;

    if (subjectFilter !== "All") {
      data = data.filter(r => r.subject === subjectFilter);
    }

    if (search.trim() !== "") {
      data = data.filter(r =>
        r.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFiltered(data);
  }, [subjectFilter, search, resources]);

  const subjects = ["All", ...new Set(resources.map(r => r.subject))];

  return (
    <div style={{ padding: "20px" }}>
      <h2>📚 Student Hub</h2>

      {/* Controls */}
      <div style={{ marginBottom: "20px" }}>
        <select onChange={(e) => setSubjectFilter(e.target.value)}>
          {subjects.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginLeft: "10px", padding: "5px" }}
        />
      </div>

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "15px"
        }}
      >
        {filtered.map(file => (
          <div
            key={file.id}
            style={{
              border: "1px solid #ddd",
              padding: "15px",
              borderRadius: "8px"
            }}
          >
            <h3>{file.title}</h3>
            <p>
              <strong>Subject:</strong> {file.subject}<br />
              <strong>Unit:</strong> {file.unit}
            </p>

            <a
              href={file.fileUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-block",
                marginTop: "10px",
                padding: "8px 12px",
                background: "#007bff",
                color: "#fff",
                textDecoration: "none",
                borderRadius: "4px"
              }}
            >
              Download / View
            </a>
          </div>
        ))}
      </div>

      {filtered.length === 0 && <p>No resources found.</p>}
    </div>
  );
};

export default StudentDashboard;
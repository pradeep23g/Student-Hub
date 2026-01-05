import { useEffect, useState } from "react";
import { getModerationQueue, publishResource } from "../adminService";

const ModeratorDashboard = () => {
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    const data = await getModerationQueue();
    setQueue(data);
  };

  const handleApprove = async (id, originalName) => {
    const subject = prompt("Enter Subject:", "not set");
    const unit = prompt("Enter Unit:","Not set");

    if (!subject || !unit) return;

    const success = await publishResource(id, {
        title: originalName,
        subject,
        unit
    });

    if (success) {
        alert(" Published")
        loadQueue();
    }
  };

  return (
    <div style={{ padding: "20px", border: "1px solid #444", marginTop: "20px" }}>
    <h3>👮 Moderator Zone ({queue.length})</h3>

    {queue.length === 0 ? (
      <p>No pending files. Good job.</p>
    ) : (
      <ul>
        {queue.map(file => (
          <li key={file.id} style={{ marginBottom: "15px" }}>
            <strong>{file.originalName}</strong>
            <br />
            <a href={file.fileURL} target="_blank" rel="noreferrer">
              View PDF
            </a>
            <br />
            <button
              style={{ marginTop: "6px"}}
              onClick={() => handleApprove(file.id, file.originalName)}
              >
                Approve & Publish

            </button>
          </li>
        ))}
      </ul>
    )}
  </div>
  );
};

export default ModeratorDashboard;

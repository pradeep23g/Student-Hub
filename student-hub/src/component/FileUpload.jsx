import { useState } from "react";
import { uploadRawFile } from "../storageService";

function FileUpload({ user }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!user) {
        alert("Please login first");
        return;
    }
    if (!file) {
      alert("Please select a file first");
      return;
    }

    setLoading(true);

    const success = await uploadRawFile(file, user.email);

    setLoading(false);

    if (success) {
      alert("File uploaded successfully 🚀");
      setFile(null);
    } else {
      alert("Upload failed ❌");
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Upload Resource 📤</h2>

      <input
        type="file"
        accept=".pdf,
        .doc,
        .docx,
        .txt,
        .ppt,
        .pptx,
        image/*"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <br /><br />

      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Uploading..." : "Upload File"}
      </button>
    </div>
  );
}

export default FileUpload;
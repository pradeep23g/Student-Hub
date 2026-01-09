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

    const success = await uploadRawFile(file);

    setLoading(false);

    if (success) {
      alert("File uploaded successfully 🚀");
      setFile(null);
    } else {
      alert("Upload failed ❌");
    }
  };

  return (
  <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 mb-10">
    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
      📤 Upload Resource
    </h2>

    <input
      type="file"
      onChange={(e) => setFile(e.target.files[0])}
      className="block w-full text-sm text-slate-300
                 file:mr-4 file:py-2 file:px-4
                 file:rounded-lg file:border-0
                 file:bg-indigo-600 file:text-white
                 hover:file:bg-indigo-700"
    />

    <button
      onClick={handleUpload}
      disabled={loading}
      className="mt-4 px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition disabled:opacity-50"
    >
      {loading ? "Uploading..." : "Upload File"}
    </button>
  </div>
);

}

export default FileUpload;
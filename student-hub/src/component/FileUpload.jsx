import { useState } from "react";
import { uploadRawFile } from "../storageService";

function FileUpload({ user }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!user) return alert("Please login first");
    if (!file) return alert("Please select a file first");

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
    <div className="glass-panel p-8 rounded-3xl mb-10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
      
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none"></div>

      <div className="relative z-10 flex-1">
        <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2 flex items-center gap-2">
          <span>📤</span> Contribute Notes
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Upload your study materials. Once approved, you'll earn <strong className="text-yellow-500">50 Points</strong> per file!
        </p>
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row gap-4 w-full md:w-auto">
        {/* Custom File Input Styling */}
        <label className="cursor-pointer group flex items-center justify-center gap-3 px-6 py-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all">
            <span className="text-2xl text-slate-400 group-hover:text-indigo-500 transition">📄</span>
            <span className="text-sm font-bold text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate max-w-[150px]">
                {file ? file.name : "Choose PDF..."}
            </span>
            <input 
                type="file" 
                onChange={(e) => setFile(e.target.files[0])} 
                className="hidden" 
                accept=".pdf"
            />
        </label>

        <button
          onClick={handleUpload}
          disabled={loading || !file}
          className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95 flex items-center gap-2
            ${loading || !file 
                ? "bg-slate-400 cursor-not-allowed" 
                : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-indigo-500/30 hover:-translate-y-1"
            }`}
        >
          {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Uploading...</span>
              </>
          ) : (
              "Upload 🚀"
          )}
        </button>
      </div>
    </div>
  );
}

export default FileUpload;
import React from "react";

const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel, isDangerous = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl transform transition-all scale-100">
        <h3 className={`text-xl font-bold mb-2 ${isDangerous ? "text-red-400" : "text-white"}`}>
          {title}
        </h3>
        <p className="text-slate-300 mb-8 leading-relaxed">
          {message}
        </p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl font-medium text-white shadow-lg transition transform hover:scale-105 ${
              isDangerous 
                ? "bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500" 
                : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500"
            }`}
          >
            {isDangerous ? "Yes, Delete It" : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
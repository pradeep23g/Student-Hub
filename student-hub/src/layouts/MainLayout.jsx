import { useEffect, useState } from "react";

export default function MainLayout({ children, onLogout, isLoggedIn }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    dark ? root.classList.add("dark") : root.classList.remove("dark");
  }, [dark]);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900
                    text-slate-900 dark:text-slate-100 transition-colors">

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-slate-200 dark:bg-slate-800
                      border-b border-slate-300 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            📚 Student Hub
            <span className="text-sm font-medium text-slate-400">beta</span>
          </h1>


          <div className="flex items-center gap-3">
            {/* DARK MODE */}
            <button
              onClick={() => setDark(!dark)}
              className="px-3 py-1.5 rounded-lg
                         bg-slate-300 dark:bg-slate-700
                         hover:bg-slate-400 dark:hover:bg-slate-600 transition"
            >
              {dark ? "☀️" : "🌙"}
            </button>

            {/* LOGOUT */}
            {isLoggedIn && (
              <button
                onClick={onLogout}
                className="px-4 py-1.5 rounded-lg
                           bg-red-600 text-white
                           hover:bg-red-700 transition"
              >
                Logout
              </button>
            )}
          </div>

        </div>
      </nav>

      {/* CONTENT */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}

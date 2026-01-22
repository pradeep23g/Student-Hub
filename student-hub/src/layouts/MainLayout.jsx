/* src/layouts/MainLayout.jsx */
import { useEffect, useState } from "react";

export default function MainLayout({ children, onLogout, isLoggedIn, onProfileClick }) {
  const [dark, setDark] = useState(false);

  // Check local storage on mount
  useEffect(() => {
    const isDark = localStorage.getItem("theme") === "dark";
    setDark(isDark);
    const root = document.documentElement;
    isDark ? root.classList.add("dark") : root.classList.remove("dark");
  }, []);

  const toggleTheme = () => {
    const newVal = !dark;
    setDark(newVal);
    localStorage.setItem("theme", newVal ? "dark" : "light");
    const root = document.documentElement;
    newVal ? root.classList.add("dark") : root.classList.remove("dark");
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden transition-colors duration-500
                    bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
      
      {/* ANIMATED BACKGROUND MESH */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40 dark:opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-400 rounded-full mix-blend-multiply filter blur-[128px] animate-float opacity-70"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-400 rounded-full mix-blend-multiply filter blur-[128px] animate-float opacity-70" style={{animationDelay: "2s"}}></div>
        <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-pink-400 rounded-full mix-blend-multiply filter blur-[128px] animate-float opacity-70" style={{animationDelay: "4s"}}></div>
      </div>

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 glass-panel border-b-0 border-b-white/10 rounded-b-2xl mx-4 mt-2">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-black tracking-tighter flex items-center gap-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 cursor-pointer hover:scale-105 transition-transform">
            <span>📚</span> Student Hub
            <span className="text-xs font-bold text-slate-500 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full uppercase tracking-wide">Beta</span>
          </h1>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-slate-200/50 dark:bg-slate-700/50 hover:bg-indigo-500/20 transition backdrop-blur-md"
              title="Toggle Theme"
            >
              {dark ? "🌙" : "☀️"}
            </button>

            {isLoggedIn && (
              <div className="flex items-center gap-3">
                <button
                  onClick={onProfileClick}
                  className="hidden sm:block px-4 py-2 rounded-xl font-bold text-sm bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 transition shadow-sm"
                >
                  My Profile
                </button>
                <button
                  onClick={onLogout}
                  className="px-4 py-2 rounded-xl font-bold text-sm bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white transition"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* CONTENT */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
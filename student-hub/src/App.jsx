import { useState, useEffect } from "react";
import MainLayout from "./layouts/MainLayout";
import LoginPage from "./component/LoginPage"; 
import FileUpload from "./component/FileUpload";
import StudentDashboard from "./component/StudentDashboard";
import ModeratorDashboard from "./component/ModeratorDashboard";
import UserProfile from "./component/UserProfile";
import { logout } from "./auth";
import { getUserRole } from "./firestore";

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [currentView, setCurrentView] = useState("dashboard");
  const [isModMode, setIsModMode] = useState(false); // ✅ TOGGLE STATE

  // Safety: Reset Mod Mode if role changes
  useEffect(() => {
    if (role !== "moderator") setIsModMode(false);
  }, [role]);

  const handleLogin = async (firebaseUser) => {
    setUser(firebaseUser);
    const userRole = await getUserRole(firebaseUser);
    setRole(userRole);
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setRole(null);
    setCurrentView("dashboard");
    setIsModMode(false);
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // ✅ TOGGLE BUTTON UI
  const modToggle = role === 'moderator' && currentView === 'dashboard' ? (
    <div className="bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-lg flex gap-1 border border-slate-300 dark:border-slate-700 backdrop-blur-sm">
        <button onClick={() => setIsModMode(false)} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${!isModMode ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}>🎓 Student</button>
        <button onClick={() => setIsModMode(true)} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${isModMode ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}>🛡️ Admin</button>
    </div>
  ) : null;

  return (
    <MainLayout
      onLogout={handleLogout}
      isLoggedIn={!!user}
      onProfileClick={() => setCurrentView("profile")}
      headerExtra={modToggle} // ✅ PASS TOGGLE
    >
      {currentView === "profile" ? (
        <UserProfile user={user} onBack={() => setCurrentView("dashboard")} />
      ) : (
        <>
          {/* ✅ CONDITIONAL RENDERING */}
          {isModMode ? (
             <ModeratorDashboard />
          ) : (
             <>
                <FileUpload user={user} />
                {!role ? (
                    <div className="flex justify-center mt-20 text-slate-400 animate-pulse">Loading dashboard...</div>
                ) : (
                    <StudentDashboard role={role} />
                )}
             </>
          )}
        </>
      )}
    </MainLayout>
  );
}

export default App;
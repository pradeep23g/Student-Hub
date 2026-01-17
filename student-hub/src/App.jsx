import { useState } from "react";
import MainLayout from "./layouts/MainLayout";

import GoogleLoginButton from "./component/GoogleLoginButton";
import FileUpload from "./component/FileUpload";
import StudentDashboard from "./component/StudentDashboard";
import ModeratorDashboard from "./component/ModeratorDashboard";
import UserProfile from "./component/UserProfile"; // ✅ 1. Import Profile
import { logout } from "./auth";

import { getUserRole } from "./firestore";

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  // ✅ 2. Add state to track which page is open (dashboard vs profile)
  const [currentView, setCurrentView] = useState("dashboard");

  const handleLogin = async (firebaseUser) => {
    setUser(firebaseUser);
    const userRole = await getUserRole(firebaseUser);
    setRole(userRole);
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setRole(null);
    setCurrentView("dashboard"); // Reset view on logout
  };

  return (
    <MainLayout 
      onLogout={handleLogout} 
      isLoggedIn={!!user}
      // ✅ 3. Pass the function to switch to Profile view
      onProfileClick={() => setCurrentView("profile")} 
    >
      {!user ? (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
          <p className="text-lg mb-4 text-slate-500 dark:text-slate-400">
            Please sign in to continue
          </p>
          <GoogleLoginButton onLogin={handleLogin} />
        </div>
      ) : (
        <>
          {/* ✅ 4. VIEW SWITCHING LOGIC */}
          {currentView === "profile" ? (
            <UserProfile 
              user={user} 
              onBack={() => setCurrentView("dashboard")} 
            />
          ) : (
            // === DASHBOARD VIEW ===
            <>
              <FileUpload user={user} />

              {!role ? (
                <p className="text-slate-400 mt-10">Loading dashboard…</p>
              ) : (
                <>
                  {/* Note: This is where your Tabs logic for Moderator/Student will go later */}
                  <StudentDashboard role={role} />
                  {role === "moderator" && <ModeratorDashboard />}
                </>
              )}
            </>
          )}
        </>
      )}
    </MainLayout>
  );
}

export default App;
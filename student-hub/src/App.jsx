import { useState } from "react";
import MainLayout from "./layouts/MainLayout";

import GoogleLoginButton from "./component/GoogleLoginButton";
import FileUpload from "./component/FileUpload";
import StudentDashboard from "./component/StudentDashboard";
import ModeratorDashboard from "./component/ModeratorDashboard";
import { logout } from "./auth";

import { getUserRole } from "./firestore";

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  const handleLogin = async (firebaseUser) => {
    setUser(firebaseUser);

    const userRole = await getUserRole(firebaseUser);
    setRole(userRole);
  };
    const handleLogout = async () => {
    await logout();
    setUser(null);
    setRole(null);
  };

  return (
  <MainLayout onLogout={handleLogout} isLoggedIn={!!user}>
    {!user ? (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
        <p className="text-lg mb-4 text-slate-500 dark:text-slate-400">
          Please sign in to continue
        </p>
        <GoogleLoginButton onLogin={handleLogin} />
      </div>
    ) : (
      <>
        <FileUpload user={user} />

        {!role ? (
          <p className="text-slate-400 mt-10">Loading dashboard…</p>
        ) : (
          <>
            <StudentDashboard role={role} />
            {role === "moderator" && <ModeratorDashboard />}
          </>
        )}
      </>
    )}
  </MainLayout>
);

}

export default App;

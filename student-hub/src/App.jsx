import { useState } from "react";
import GoogleLoginButton from "./component/GoogleLoginButton";
import FileUpload from "./component/FileUpload";
import ModeratorDashboard from "./component/ModeratorDashboard";
import StudentDashboard from "./component/StudentDashboard";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";





function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);


  const fetchUserRole = async (firebaseUser) => {
    const userRef = doc(db, "users", firebaseUser.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      //assigning the default role to student
      await setDoc(userRef, {
        email: firebaseUser.email,
        role: "student",
        createdAt: new Date()
      });
      return "student";
    }
    return snap.data().role;
  };

  const handleLogin = async (firebaseUser) => {
    setUser(firebaseUser);
    
    const userRole = await fetchUserRole(firebaseUser);
    setRole(userRole);
  };

  if (user && !role){
    return <p>Loading user role....</p>;
  }
  return (
    <div style={{ padding: "40px" }}>
      <h1>Student Hub 📚</h1>

      {!user ? (
        <>
          <p>Please sign in to continue</p>
          <GoogleLoginButton onLogin ={handleLogin} />
        </>
      ) : (
        <>
          <p>Welcome, {user.email}</p>
          <FileUpload user={user} />
          <hr />
          
          <StudentDashboard />

          {
            role === "moderator" && (
              <>
                <hr />
                <ModeratorDashboard />
              </>
            )
          }

        </>
      )}
    </div>
  );
}

export default App;

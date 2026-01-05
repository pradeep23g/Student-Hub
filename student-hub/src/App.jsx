import { useState } from "react";
import GoogleLoginButton from "./component/GoogleLoginButton";
import FileUpload from "./component/FileUpload";
import ModeratorDashboard from "./component/ModeratorDashboard";


function App() {
  const [user, setUser] = useState(null);

  return (
    <div style={{ padding: "40px" }}>
      <h1>Student Hub 📚</h1>

      {!user ? (
        <>
          <p>Please sign in to continue</p>
          <GoogleLoginButton setUser={setUser} />
        </>
      ) : (
        <>
          <p>Welcome, {user.email}</p>
          <FileUpload user={user} />
          <hr />
          <ModeratorDashboard />

        </>
      )}
    </div>
  );
}

export default App;

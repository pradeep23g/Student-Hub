import { loginWithGoogle } from "../auth";
import { saveUserIfNotExists } from "../firestore";

function GoogleLoginButton({ setUser }) {
  const handleLogin = async () => {
    const user = await loginWithGoogle();

    if (user) {
      await saveUserIfNotExists(user);
      setUser(user);
      
    }
  };

  return (
    <button onClick={handleLogin}>
      Sign in with Google
    </button>
  );
}

export default GoogleLoginButton;
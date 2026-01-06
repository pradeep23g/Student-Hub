import { loginWithGoogle } from "../auth";
import { saveUserIfNotExists } from "../firestore";

function GoogleLoginButton({ onLogin }) {
  const handleLogin = async () => {
    const user = await loginWithGoogle();

    if (user) {
      await saveUserIfNotExists(user);
      
      onLogin(user);
    }
  };

  return (
    <button onClick={handleLogin}>
      Sign in with Google
    </button>
  );
}

export default GoogleLoginButton;
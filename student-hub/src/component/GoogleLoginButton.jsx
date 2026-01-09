import { loginWithGoogle } from "../auth";
import { saveUserIfNotExists } from "../firestore";

function GoogleLoginButton({ onLogin }) {
  const handleLogin = async () => {
    const user = await loginWithGoogle();
    if (user) onLogin(user);
  };

  return (
    <button
      onClick={handleLogin}
      className="flex items-center gap-3 px-6 py-3 rounded-xl
                 bg-white text-slate-900 font-semibold
                 shadow-md hover:shadow-lg
                 transition-all hover:-translate-y-0.5
                 dark:bg-slate-800 dark:text-slate-100"
    >
      <img
        src="https://www.svgrepo.com/show/475656/google-color.svg"
        alt="Google"
        className="w-5 h-5"
      />
      Sign in with Google
    </button>
  );
}

export default GoogleLoginButton;

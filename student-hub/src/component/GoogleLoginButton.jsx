import { loginWithGoogle } from "../auth";

function GoogleLoginButton({ onLogin }) {
  const handleLogin = async () => {
    try {
      const user = await loginWithGoogle();
      if (user) onLogin(user);
    } catch (err) {
      console.error("Google login failed", err);
    }
  };

  return (
    <button
      onClick={handleLogin}
      className="group relative w-full flex items-center justify-center gap-3
                 px-6 py-4 rounded-2xl
                 bg-white text-slate-900 font-bold text-lg
                 shadow-xl shadow-indigo-500/10
                 border border-transparent hover:border-indigo-100
                 transition-all duration-300 ease-out
                 transform-gpu hover:shadow-indigo-500/20 hover:scale-[1.02]
                 active:scale-[0.98] active:bg-slate-50"
    >
      {/* Google Icon */}
      <img
        src="https://www.svgrepo.com/show/475656/google-color.svg"
        alt="Google"
        className="w-6 h-6 transition-transform duration-500 ease-out group-hover:rotate-[360deg]"
      />

      <span className="tracking-tight">Sign in with Google</span>

      {/* Floating Arrow */}
      <div className="absolute right-5 opacity-0 -translate-x-2 
                      group-hover:opacity-100 group-hover:translate-x-0 
                      transition-all duration-300 text-slate-400">
        →
      </div>
    </button>
  );
}

export default GoogleLoginButton;
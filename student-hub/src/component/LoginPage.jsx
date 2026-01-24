import { motion } from "framer-motion";
import GoogleLoginButton from "./GoogleLoginButton";

const LoginPage = ({ onLogin }) => {
  return (
    <div className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-slate-950 text-white selection:bg-indigo-500/30">
      
      {/* 🌌 ANIMATED BACKGROUND */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {/* Purple Orb */}
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob will-change-transform"></div>
        
        {/* Indigo Orb */}
        <div className="absolute top-[20%] right-[-10%] w-[45vw] h-[45vw] bg-indigo-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000 will-change-transform"></div>
        
        {/* Pink Orb */}
        <div className="absolute bottom-[-10%] left-[20%] w-[40vw] h-[40vw] bg-pink-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000 will-change-transform"></div>

        {/* Noise Texture (Crucial for the "Cinematic" feel) */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
      </div>

      {/* 🔐 LOGIN CARD */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} // "Apple-style" ease
        className="relative z-10 w-full max-w-[420px] px-4"
      >
        <div className="relative bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-2xl p-8 sm:p-10 overflow-hidden ring-1 ring-white/5">
          
          {/* Subtle Top Gradient */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent opacity-50 blur-sm"></div>

          {/* Logo & Header */}
          <div className="text-center mb-10">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-block mb-6 relative group cursor-default"
            >
              <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
              <span className="relative text-6xl drop-shadow-xl">🧠</span>
            </motion.div>

            <h1 className="text-3xl font-black text-white tracking-tight mb-2 drop-shadow-sm">
              Student Hub
            </h1>
            <p className="text-slate-400 text-sm font-medium tracking-wide">
              The Gamified Knowledge Ecosystem
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-6">
            <GoogleLoginButton onLogin={onLogin} />

            <div className="flex items-center gap-4">
              <div className="h-px bg-white/10 flex-1"></div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Secure Access</span>
              <div className="h-px bg-white/10 flex-1"></div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-600 transition-colors hover:text-slate-500">
              Made for <span className="text-slate-400 font-bold">Lofi Hackathon 2026</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
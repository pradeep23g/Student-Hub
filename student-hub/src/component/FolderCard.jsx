import React from "react";
import { motion } from "framer-motion";
import SpotlightCard from "./SpotlightCard";

const FolderCard = ({ title, count, subtitle, onClick, type = "folder" }) => {
  // ✅ PARENT-CONTROLLED ANIMATION VARIANTS
  const cardVariants = {
    rest: { y: 0, scale: 1 },
    hover: { 
        y: -5, 
        scale: 1.02,
        transition: { type: "spring", stiffness: 300, damping: 20 } 
    }
  };

  const paperVariants = {
    rest: { y: 0, opacity: 0.8 },
    hover: { y: -8, opacity: 1, transition: { duration: 0.3 } }
  };

  const flapVariants = {
    rest: { rotateX: 0, scaleY: 1 },
    hover: { rotateX: -180, scaleY: 0.9, transition: { duration: 0.4 } } // Flips open completely
  };

  return (
    <motion.div 
        onClick={onClick} 
        className="cursor-pointer h-full relative"
        initial="rest"
        whileHover="hover"
        animate="rest"
        variants={cardVariants}
    >
      <SpotlightCard
        // ✅ HEAVENLY GLASS STYLING
        className="p-6 h-full flex flex-col items-start justify-between 
                   border border-white/20 dark:border-white/10 
                   bg-white/60 dark:bg-white/5 
                   backdrop-blur-xl shadow-lg hover:shadow-indigo-500/20"
        spotlightColor="rgba(255, 255, 255, 0.15)"
      >
        <div className="w-full flex justify-between items-start mb-6">
          {/* ✅ ANIMATED FOLDER ICON */}
          <div className="relative w-14 h-14 drop-shadow-lg">
            <motion.svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={`w-14 h-14 ${
                type === "subject"
                  ? "text-indigo-500 dark:text-indigo-400"
                  : "text-purple-500 dark:text-purple-400"
              }`}
            >
              {/* Back Plate */}
              <path
                d="M4 6H20C21.1 6 22 6.9 22 8V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V8C2 6.9 2.9 6 4 6Z"
                fill="currentColor"
                fillOpacity="0.3"
              />
              
              {/* Paper Inside (Peeking Out) */}
              <motion.path
                d="M6 8H18V16H6V8Z"
                fill="white"
                stroke="rgba(0,0,0,0.1)"
                variants={paperVariants}
              />

              {/* Front Flap (The Door) */}
              <motion.path
                d="M22 10V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V10L12 14L22 10Z"
                fill="currentColor"
                style={{ originY: 0.35 }} // Pivot point adjusted for 3D feel
                variants={flapVariants}
              />
              
              {/* Tab */}
              <path d="M4 4H10L12 6H4V4Z" fill="currentColor" />
            </motion.svg>
          </div>

          <span className="bg-black/5 dark:bg-white/10 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full text-xs font-bold border border-black/5 dark:border-white/5 backdrop-blur-sm">
            {count}
          </span>
        </div>

        <div>
          <h3 className="text-xl font-black text-slate-800 dark:text-white mb-1 tracking-tight">
            {title}
          </h3>
          <p className="text-[10px] font-bold text-indigo-500 dark:text-indigo-300 uppercase tracking-widest opacity-80">
            {subtitle}
          </p>
        </div>
      </SpotlightCard>
    </motion.div>
  );
};

export default FolderCard;
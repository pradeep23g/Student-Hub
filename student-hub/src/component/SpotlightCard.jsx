import { useRef } from 'react';

const SpotlightCard = ({ children, className = '', spotlightColor = 'rgba(255, 255, 255, 0.25)' }) => {
  const divRef = useRef(null);

  const handleMouseMove = (e) => {
    const rect = divRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    divRef.current.style.setProperty('--mouse-x', `${x}px`);
    divRef.current.style.setProperty('--mouse-y', `${y}px`);
    divRef.current.style.setProperty('--spotlight-color', spotlightColor);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      className={`card-spotlight relative overflow-hidden rounded-3xl 
        border border-slate-200 bg-white shadow-xl 
        dark:border-white/10 dark:bg-slate-900/50 dark:backdrop-blur-md dark:shadow-lg 
        ${className}`}
    >
      {/* The Glow Effect Layer */}
      <div 
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
            background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), var(--spotlight-color), transparent 40%)`
        }}
      />
      
      {/* Content */}
      <div className="relative h-full">
        {children}
      </div>
    </div>
  );
};

export default SpotlightCard;
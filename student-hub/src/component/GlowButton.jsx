import React from 'react';
import styled from 'styled-components';

const GlowButton = ({ 
  onClick, 
  icon, 
  text, 
  color = "#fff", 
  className = "" 
}) => {
  return (
    <StyledWrapper $color={color} $hasText={!!text} className={className}>
      <button onClick={onClick}>
        <div className="icon-container">{icon}</div>
        {text && <span className="btn-text">{text}</span>}
      </button>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  width: ${props => props.className && props.className.includes('w-full') ? '100%' : 'auto'};

  button {
   display: flex;
   height: ${props => props.$hasText ? '3em' : '2.5em'};
   width: 100%;
   min-width: ${props => props.$hasText ? 'auto' : '2.5em'};
   padding: ${props => props.$hasText ? '0 1.2em' : '0'};
   
   align-items: center;
   justify-content: center;
   
   /* ✅ LIGHT MODE ADAPTATION */
   background-color: rgba(0, 0, 0, 0.05); /* Slight dark tint for light mode */
   border: 1px solid rgba(0, 0, 0, 0.1);
   color: #334155; /* Slate-700 for light mode */

   /* ✅ DARK MODE SUPPORT via CSS Media Query or Class context usually handled by parent, 
      but for Styled Components inside Tailwind, we use a trick or keep it neutral.
      Here, we prioritize contrast. */
   @media (prefers-color-scheme: dark) {
      background-color: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #e2e8f0;
   }
   
   /* Tailwind .dark class override support if configured properly with styled-components, 
      otherwise stick to standard neutral: */
   
   border-radius: 12px;
   letter-spacing: 0.5px;
   transition: all 0.3s ease;
   cursor: pointer;
   font-weight: 700;
   font-size: 14px;
   position: relative;
   overflow: hidden;
  }

  /* Specific Dark Mode Override for Tailwind Apps */
  :global(.dark) button {
     background-color: rgba(255, 255, 255, 0.05);
     border-color: rgba(255, 255, 255, 0.1);
     color: #e2e8f0;
  }

  button .icon-container {
   display: flex;
   align-items: center;
   justify-content: center;
   margin-right: ${props => props.$hasText ? '8px' : '0'};
   transition: all 0.4s ease-in;
   font-size: 18px;
  }

  button:hover .icon-container {
   transform: ${props => props.$hasText ? 'translateX(3px)' : 'scale(1.1)'}; 
  }

  button:hover {
   background-color: ${props => props.$color}10; /* 10% opacity of glow color */
   box-shadow: 0 0 20px ${props => props.$color}40, 0 0 5px ${props => props.$color}80; 
   border-color: ${props => props.$color};
   transform: translateY(-2px);
   color: ${props => props.$color === '#ffffff' ? '#333' : props.$color}; /* Fix white button text on hover */
  }
  
 
  :global(.dark) button:hover {
    color: white; 
  }

  button:active {
    transform: scale(0.98);
    box-shadow: none;
  }
`;

export default GlowButton;
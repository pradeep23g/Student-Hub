import React from 'react';
import styled from 'styled-components';

const DownloadButton = ({ onClick, label = "Open PDF", isReady = true }) => {
  return (
    <StyledWrapper onClick={onClick}>
      <div className="container">
        <label className="label">
          <input type="checkbox" className="input" />
          <span className="circle">
            {isReady ? (
                // AI Ready Icon (Robot)
                <span className="text-white text-lg">🤖</span>
            ) : (
                // Standard Download Icon
                <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 19V5m0 14-4-4m4 4 4-4" />
                </svg>
            )}
            <div className="square" />
          </span>
          <p className="title">{label}</p>
          <p className="title">Opening...</p>
        </label>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  /* Copied & Adapted from your snippet */
  .container {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .label {
    background-color: transparent;
    border: 2px solid rgba(99, 102, 241, 0.8); /* Indigo-500 */
    display: flex;
    align-items: center;
    border-radius: 50px;
    width: 150px;
    cursor: pointer;
    transition: all 0.4s ease;
    padding: 5px;
    position: relative;
  }

  .label:hover {
    background-color: rgba(99, 102, 241, 0.1);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  }

  .label .input { display: none; }

  .label .title {
    font-size: 14px;
    font-weight: 700;
    color: inherit; /* Inherit form parent (dark/light mode friendly) */
    transition: all 0.4s ease;
    position: absolute;
    right: 24px;
    bottom: 12px;
    text-align: center;
  }

  .label .title:last-child {
    opacity: 0;
    visibility: hidden;
  }

  .label .circle {
    height: 35px;
    width: 35px;
    border-radius: 50%;
    background-color: rgba(99, 102, 241, 1);
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.4s ease;
    position: relative;
    box-shadow: 0 0 0 0 rgb(255, 255, 255);
    overflow: hidden;
  }

  .label .circle .icon {
    color: #fff;
    width: 20px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    transition: all 0.4s ease;
  }

  /* Animation Triggers (Active State handled by React onClick usually, 
     but for this CSS demo, we keep the hover/active logic) */
  .label:active {
    transform: scale(0.95);
  }
`;

export default DownloadButton;
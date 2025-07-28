// src/components/dashboard/LoadingState.jsx

import React from 'react';

const LoadingState = ({ processedCount, totalCount, statusMessage }) => {
  const size = 120;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Ensure we don't divide by zero before files are selected
  const progress = totalCount > 0 ? (processedCount / totalCount) : 0;
  const offset = circumference - progress * circumference;

  return (
    <section className="loading-state-container">
      <div className="progress-circle-wrapper">
        <svg className="progress-circle" width={size} height={size}>
          <circle
            className="progress-circle-bg"
            strokeWidth={strokeWidth}
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          <circle
            className="progress-circle-fg"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
        </svg>
        <div className="progress-text-container">
          <span className="progress-fraction">
            {processedCount}/{totalCount}
          </span>
          <span className="progress-label">Files</span>
        </div>
      </div>
      <p className="loading-status-message">{statusMessage}</p>
    </section>
  );
};

export default LoadingState;
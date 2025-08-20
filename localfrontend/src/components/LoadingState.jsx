// src/components/dashboard/LoadingState.jsx
import React from 'react';

const LoadingState = ({ processedCount, totalCount, statusMessage }) => {
    const progress = totalCount > 0 ? (processedCount / totalCount) * 100 : 0;
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="loading-state-container">
            <div className="progress-circle-wrapper">
                <svg className="progress-circle" width="120" height="120" viewBox="0 0 120 120">
                    <circle className="progress-circle-bg" strokeWidth="8" r={radius} cx="60" cy="60" />
                    <circle className="progress-circle-fg" strokeWidth="8" r={radius} cx="60" cy="60" style={{ strokeDasharray: circumference, strokeDashoffset: offset }} />
                </svg>
                <div className="progress-text-container">
                    <span className="progress-fraction">{processedCount}/{totalCount}</span>
                    <span className="progress-label">Files</span>
                </div>
            </div>
            <p className="loading-status-message">{statusMessage}</p>
        </div>
    );
};

export default LoadingState;
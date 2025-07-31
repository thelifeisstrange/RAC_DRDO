// src/components/dashboard/MatchFraction.jsx
import React from 'react';

// The ProgressRing component is defined here, making MatchFraction a complete "widget".
const ProgressRing = ({ percentage, size = 32 }) => {
    const radius = size / 2 - 4; // 4 is half the strokeWidth
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="progress-circle-wrapper" style={{ width: size, height: size }}>
            <svg className="progress-circle" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle className="progress-circle-bg" strokeWidth="4" r={radius} cx={size/2} cy={size/2} />
                <circle className="progress-circle-fg" strokeWidth="4" r={radius} cx={size/2} cy={size/2} style={{ strokeDasharray: circumference, strokeDashoffset: offset }} />
            </svg>
        </div>
    );
};

const MatchFraction = ({ matches, total }) => {
    const percentage = total > 0 ? (matches / total) * 100 : 0;

    return (
        <div className="match-fraction">
            <ProgressRing percentage={percentage} />
            <span className="fraction-text">{matches}/{total}</span>
        </div>
    );
};

export default MatchFraction;
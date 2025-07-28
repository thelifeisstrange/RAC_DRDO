import React from 'react';

const MatchFraction = ({ matches, total, size = 40 }) => {
  const radius = size / 2 - 4;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (matches / total) * circumference;

  return (
    <div className="match-fraction">
      <svg className="progress-ring" width={size} height={size}>
        <circle className="progress-ring-bg" strokeWidth="4" r={radius} cx={size/2} cy={size/2} />
        <circle
          className="progress-ring-fg"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          r={radius}
          cx={size/2}
          cy={size/2}
        />
      </svg>
      <span className="fraction-text">{`${matches}/${total}`}</span>
    </div>
  );
};

export default MatchFraction;
import React from 'react';

const StatusPill = ({ status }) => (
  <span className={`status-pill ${status.toLowerCase()}`}>{status}</span>
);

export default StatusPill;
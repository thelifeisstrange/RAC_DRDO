// src/components/dashboard/DetailedView.jsx

import React from 'react';
import StatusPill from './StatusPill';

// --- Sub-component for a single field ---
// This is now more robust with a defensive check.
const DetailField = ({ label, data }) => {
  // Defensive Check: If data for this field is missing, render nothing.
  // This prevents the entire app from crashing.
  if (!data) {
    return null; 
  }

  return (
    <div className="detail-field">
      <span className="detail-field-name">{label}</span>
      <div className="detail-values">
        <div className={data.status ? '' : 'value-mismatch'}>Input: {data.input}</div>
        <div className={data.status ? '' : 'value-mismatch'}>Extracted: {data.extracted}</div>
      </div>
      <span className={`detail-status-icon ${data.status ? 'status-true' : 'status-false'}`}>
        <ion-icon name={data.status ? 'checkmark-circle' : 'close-circle'}></ion-icon>
      </span>
    </div>
  );
};


// --- Main Detailed View Component ---
// This part remains the same.
const DetailedView = ({ data }) => (
  <div className="detailed-view">
    {data.map(item => (
      <div key={item.id} className="detail-card">
        <div className="detail-card-header">
          <h3 className="detail-card-id">ID: {item.id}</h3>
          <StatusPill status={item.status} />
        </div>
        <div className="detail-card-body">
          <DetailField label="Name" data={item.name} />
          <DetailField label="Reg. ID" data={item.registration_id} />
          <DetailField label="Year" data={item.year} />
          <DetailField label="Score" data={item.score} />
          <DetailField label="Score /100" data={item.scoreof100} />
          <DetailField label="Rank" data={item.rank} />
        </div>
      </div>
    ))}
  </div>
);

export default DetailedView;
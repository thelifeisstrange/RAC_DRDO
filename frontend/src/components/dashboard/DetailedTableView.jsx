// src/components/dashboard/DetailedTableView.jsx

import React from 'react';
import StatusPill from './StatusPill';
import MatchFraction from './MatchFraction';

// A single field comparison inside the expanded view
const DetailField = ({ label, data }) => (
  <div className="detail-field-item">
    <div className="detail-field-header">
      <span className="detail-field-label">{label}</span>
      <span className={`detail-field-status ${data.status ? 'status-true' : 'status-false'}`}>
        <ion-icon name={data.status ? 'checkmark-circle' : 'close-circle'}></ion-icon>
      </span>
    </div>
    <div className="detail-field-values">
      <div>Input: {data.input}</div>
      <div className={!data.status ? 'mismatched-value' : ''}>
        Extracted: {data.extracted}
      </div>
    </div>
  </div>
);

// The main interactive table component
const DetailedTableView = ({ data, expandedRowId, setExpandedRowId }) => {
  const fields = ['name', 'registration_id', 'year', 'score', 'scoreof100', 'rank'];

  const handleToggle = (id) => {
    setExpandedRowId(prevId => (prevId === id ? null : id));
  };

  return (
    <div className="detailed-table-wrapper">
      <table className="detailed-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Source File</th>
            <th>Status</th>
            <th>Matches</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {data.map(item => {
            const isExpanded = expandedRowId === item.id;
            return (
              <React.Fragment key={item.id}>
                {/* The main overview row, which is clickable */}
                <tr className={`overview-row ${isExpanded ? 'expanded' : ''}`} onClick={() => handleToggle(item.id)}>
                  <td className="cell-id">{item.id}</td>
                  <td className="cell-file">{item.sourceFile}</td>
                  <td><StatusPill status={item.status} /></td>
                  <td><MatchFraction matches={item.matches} total={item.totalFields} /></td>
                  <td>
                    <ion-icon class="cell-toggle-icon" name="chevron-down-outline"></ion-icon>
                  </td>
                </tr>

                {/* The conditional detail row that appears when expanded */}
                {isExpanded && (
                  <tr className="detail-row-container">
                    <td colSpan="5">
                      <div className="detail-row-content">
                        {fields.map(field => (
                          <DetailField key={field} label={field.replace('_', ' ')} data={item[field]} />
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DetailedTableView;
// src/components/dashboard/CompactView.jsx
import React from 'react';
import StatusPill from './StatusPill';
import MatchFraction from './MatchFraction'; // This now imports the fixed component

const CompactView = ({ data }) => {
  return (
      <div className="compact-table-wrapper">
        <table className="compact-table">
          <thead>
          <tr>
            <th>ID</th>
            <th>Candidate / File</th>
            <th>Status</th>
            <th>Field Matches</th>
          </tr>
          </thead>
          <tbody>
          {data.map(item => (
              <tr key={item.id}>
                <td className="cell-id">{item.id}</td>
                <td className="cell-candidate-info">
                  {/* Add a check in case name data doesn't exist */}
                  <div className="cell-candidate-name">{item.name?.extracted || 'N/A'}</div>
                  <div className="cell-candidate-file">{item.sourceFile}</div>
                </td>
                <td><StatusPill status={item.status} /></td>
                <td><MatchFraction matches={item.matches} total={item.totalFields} /></td>
              </tr>
          ))}
          </tbody>
        </table>
      </div>
  );
};

export default CompactView;
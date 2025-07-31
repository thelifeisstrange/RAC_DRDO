// src/components/dashboard/OverviewTable.jsx
import React from 'react';
import StatusPill from './StatusPill';
import MatchFraction from './MatchFraction'; // This now imports the fixed component

const OverviewTable = ({ data }) => (
    <div className="overview-table-wrapper">
      <table className="overview-table">
        <thead>
        <tr>
          <th>ID</th>
          <th>Source File</th>
          <th>Status</th>
          <th>Field Matches</th>
        </tr>
        </thead>
        <tbody>
        {data.map(item => (
            <tr key={item.id}>
              <td className="cell-id">{item.id}</td>
              <td className="cell-file">{item.sourceFile}</td>
              <td><StatusPill status={item.status} /></td>
              <td><MatchFraction matches={item.matches} total={item.totalFields} /></td>
            </tr>
        ))}
        </tbody>
      </table>
    </div>
);

export default OverviewTable;
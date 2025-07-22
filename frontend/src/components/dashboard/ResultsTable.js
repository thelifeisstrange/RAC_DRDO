// src/components/dashboard/ResultsTable.js
import React from 'react';
import './Dashboard.css';

const ResultsTable = ({ data }) => {
    const getStatusClass = (status) => {
        if (status === 'Mismatch') return 'status-mismatch';
        if (status === 'Match') return 'status-match';
        return '';
    };

    return (
        <div className="card">
            <h3>Verification Status</h3>
            <div className="table-container">
                <table>
                    <thead>
                    <tr>
                        <th>Applicant Name</th>
                        <th>Document Type</th>
                        <th>Data from CSV</th>
                        <th>Extracted from Document</th>
                        <th>Status</th>
                    </tr>
                    </thead>
                    <tbody>
                    {data.map((row) => (
                        <tr key={row.id}>
                            <td>{row.applicantName}</td>
                            <td>{row.documentType}</td>
                            <td>{row.csvData}</td>
                            <td>{row.extractedData}</td>
                            <td>
                  <span className={`status-pill ${getStatusClass(row.status)}`}>
                    {row.status}
                  </span>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ResultsTable;
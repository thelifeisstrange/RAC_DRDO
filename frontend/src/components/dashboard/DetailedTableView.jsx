// src/components/dashboard/DetailedTableView.jsx

import React from 'react';
import StatusPill from './StatusPill';
import MatchFraction from './MatchFraction';

const DetailField = ({ label, data }) => {
    if (!data) return null; // Defensive guard clause
    return (
        <div className="detail-field-item">
            <div className="detail-field-header">
                <span className="detail-field-label">{label}</span>
                <span className={`detail-field-status ${data.status ? 'status-true' : 'status-false'}`}>
                    <ion-icon name={data.status ? 'checkmark-circle' : 'close-circle'}></ion-icon>
                </span>
            </div>
            <div className="detail-field-values">
                <div>Input: {data.input}</div>
                <div className={!data.status ? 'mismatched-value' : ''}>Extracted: {data.extracted}</div>
            </div>
        </div>
    );
};

const DetailedTableView = ({ data, expandedRowId, setExpandedRowId }) => {
    // Add the debug log here to confirm it's receiving data
    console.log(`COMPONENT RENDER: <DetailedTableView /> is rendering with ${data.length} items.`);

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
                                <tr className={`overview-row ${isExpanded ? 'expanded' : ''}`} onClick={() => handleToggle(item.id)}>
                                    <td className="cell-id">{item.id}</td>
                                    <td className="cell-file">{item.sourceFile}</td>
                                    <td><StatusPill status={item.status} /></td>
                                    <td><MatchFraction matches={item.matches} total={item.totalFields} /></td>
                                    <td>
                                        {/* --- THIS IS THE CORRECTED LINE --- */}
                                        <ion-icon className="cell-toggle-icon" name="chevron-down-outline"></ion-icon>
                                    </td>
                                </tr>
                                {isExpanded && (
                                    <tr className="detail-row-container">
                                        <td colSpan="5">
                                            <div className="detail-row-content">
                                                {fields.map(field => (
                                                    // Pass the correctly nested data object
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
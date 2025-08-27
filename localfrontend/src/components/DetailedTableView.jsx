// src/components/dashboard/DetailedTableView.jsx

import React from 'react';

// --- Reusable SVG Icons ---
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>;
const MismatchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
const ChevronDown = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>;

// --- Reusable ProgressRing Component ---
const ProgressRing = ({ percentage, size = 32 }) => {
    const radius = size / 2 - 4;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - ((percentage || 0) / 100) * circumference;
    return (
        <div className="progress-circle-wrapper" style={{ width: size, height: size }}>
            <svg className="progress-circle" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle className="progress-circle-bg" strokeWidth="4" r={radius} cx={size/2} cy={size/2} />
                <circle className="progress-circle-fg" strokeWidth="4" r={radius} cx={size/2} cy={size/2} style={{ strokeDasharray: circumference, strokeDashoffset: offset }} />
            </svg>
        </div>
    );
};

// --- Reusable Detail Field Card Component ---
const DetailField = ({ label, data }) => {
    if (!data) return null;
    const isMismatched = !data.status;
    return (
        <div className={`detail-field-item ${isMismatched ? 'mismatched' : ''}`}>
            <div className="detail-field-header">
                <span className="detail-field-label">{label.replace(/_/g, ' ')}</span>
                <span className="detail-field-status">{isMismatched ? <MismatchIcon /> : <CheckIcon />}</span>
            </div>
            <div className="detail-field-values">
                <div><span className="value-label">Input:</span> {data.input}</div>
                <div className={isMismatched ? 'mismatched-value' : ''}><span className="value-label">Extracted:</span> {data.extracted}</div>
            </div>
        </div>
    );
};

// --- Main Detailed Table View Component ---
// MODIFICATION: Removed 'onSave' and 'savedIds' from the props.
const DetailedTableView = ({ data, expandedRowId, setExpandedRowId }) => {
    const toggleRow = (id) => setExpandedRowId(expandedRowId === id ? null : id);
    
    const fieldLabels = { 
        name: 'Name', 
        father_name: 'Father Name',
        registration_id: 'Registration ID', 
        year: 'Year',
        paper_code: 'Paper Code',
        score: 'Score', 
        scoreof100: 'Score of 100', 
        rank: 'Rank' 
    };

    return (
        <div className="detailed-table-wrapper">
            <table className="detailed-table">
                <thead><tr><th>ID</th><th>Source File</th><th>Status</th><th>Matches</th><th>Details</th></tr></thead>
                <tbody>
                {data.map(row => (
                    <React.Fragment key={row.id}>
                        <tr className={`overview-row ${expandedRowId === row.id ? 'expanded' : ''}`} onClick={() => toggleRow(row.id)}>
                            <td className="cell-id">{row.id}</td>
                            <td className="cell-file">{row.sourceFile}</td>
                            <td><span className={`status-pill ${row.status.toLowerCase()}`}>{row.status}</span></td>
                            <td>
                                <div className="match-fraction">
                                    <ProgressRing percentage={((row.matches || 0) / (row.totalFields || 1)) * 100} />
                                    <span className="fraction-text">{row.matches}/{row.totalFields}</span>
                                </div>
                            </td>
                            <td><div className={`cell-toggle-icon ${expandedRowId === row.id ? 'expanded' : ''}`}><ChevronDown /></div></td>
                        </tr>
                        {expandedRowId === row.id && (
                            <tr className="detail-row-container"><td colSpan="5">
                                <div className="detail-row-content">
                                    <div className="detail-summary"><h4>Verification Details for {row.sourceFile}</h4><p>Comparing data from the master CSV with content extracted from the document.</p></div>
                                    <div className="detail-grid">{Object.keys(fieldLabels).map(fieldKey => (row[fieldKey] ? <DetailField key={fieldKey} label={fieldLabels[fieldKey]} data={row[fieldKey]} /> : null))}</div>
                                    {/* --- MODIFICATION: The individual action buttons are now removed --- */}
                                </div>
                            </td></tr>
                        )}
                    </React.Fragment>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default DetailedTableView;
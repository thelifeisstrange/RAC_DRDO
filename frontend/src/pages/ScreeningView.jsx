// src/pages/ScreeningView.js
import React from 'react';
import FileUploader from '../components/dashboard/FileUploader';
import ResultsTable from '../components/dashboard/ResultsTable';

const ScreeningView = ({
                           filteredVerificationData, jobFilter,
                           setJobFilter, jobRoles
                       }) => {
    return (
        <>
            <div className="admin-card">
                <h3>Application Screening</h3>
                <p>Upload applicant documents and CSVs for processing.</p>
                <FileUploader />
            </div>
            <div className="admin-card">
                <h3>Verification Status</h3>
                <div className="filter-container">
                    <label htmlFor="jobFilter">Filter by Job Role:</label>
                    <select id="jobFilter" className="filter-select custom-select" value={jobFilter} onChange={(e) => setJobFilter(e.target.value)}>
                        {jobRoles.map(role => (<option key={role} value={role}>{role}</option>))}
                    </select>
                </div>
                <ResultsTable data={filteredVerificationData} />
            </div>
        </>
    );
};

export default ScreeningView;
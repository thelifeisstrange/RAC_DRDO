// src/pages/DashboardPage.js
import React, { useState, useMemo } from 'react';
import FileUploader from '../components/dashboard/FileUploader';
import ResultsTable from '../components/dashboard/ResultsTable';
import './DashboardPage.css';
import { useAuth } from '../context/AuthContext';

const mockVerificationData = [
    { id: 1, applicantName: 'Rohan Sharma', documentType: 'Aadhar Card', csvData: 'XXXX XXXX 1234', extractedData: 'XXXX XXXX 1234', status: 'Match', jobAppliedFor: 'Software Engineer' },
    { id: 2, applicantName: 'Priya Singh', documentType: 'PAN Card', csvData: 'ABCDE1234F', extractedData: 'ABCDE1234G', status: 'Mismatch', jobAppliedFor: 'Data Scientist' },
    { id: 3, applicantName: 'Amit Kumar', documentType: 'Aadhar Card', csvData: 'XXXX XXXX 5678', extractedData: 'XXXX XXXX 5678', status: 'Match', jobAppliedFor: 'Software Engineer' },
    { id: 4, applicantName: 'Sneha Verma', documentType: 'Passport', csvData: 'Z1234567', extractedData: 'Z1234567', status: 'Match', jobAppliedFor: 'Mechanical Engineer' },
    { id: 5, applicantName: 'Vikram Rathore', documentType: 'Aadhar Card', csvData: 'XXXX XXXX 9876', extractedData: 'Processing...', status: 'Pending', jobAppliedFor: 'Data Scientist' },
];
const jobRoles = ['All Jobs', ...new Set(mockVerificationData.map(item => item.jobAppliedFor))];

const DashboardPage = () => {
    const [jobFilter, setJobFilter] = useState('All Jobs');
    // --- UPDATED: Get the 'user' object from the context ---
    const { logout, user } = useAuth();

    const filteredData = useMemo(() => {
        if (jobFilter === 'All Jobs') return mockVerificationData;
        return mockVerificationData.filter(item => item.jobAppliedFor === jobFilter);
    }, [jobFilter]);

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Screening Dashboard</h1>
                {/* --- UPDATED HEADER --- */}
                <div className="header-user-info">
                    <span>Hi, {user ? user.name.split(' ')[0] : 'User'}</span>
                    <button className="logout-button" onClick={logout}>Logout</button>
                </div>
            </header>
            <main className="dashboard-main">
                <FileUploader />
                <div className="card">
                    <h3>Verification Status</h3>
                    <div className="filter-container">
                        <label htmlFor="jobFilter">Filter by Job Role:</label>
                        <select id="jobFilter" className="filter-select custom-select" value={jobFilter} onChange={(e) => setJobFilter(e.target.value)}>
                            {jobRoles.map(role => (<option key={role} value={role}>{role}</option>))}
                        </select>
                    </div>
                    <ResultsTable data={filteredData} />
                </div>
            </main>
        </div>
    );
};
export default DashboardPage;
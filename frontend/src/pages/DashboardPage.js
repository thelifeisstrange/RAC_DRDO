// src/pages/DashboardPage.js
import React from 'react';
import FileUploader from '../components/dashboard/FileUploader';
import ResultsTable from '../components/dashboard/ResultsTable';
import './DashboardPage.css';

// This is MOCK DATA. In a real application, this would come from a backend API.
const mockVerificationData = [
    { id: 1, applicantName: 'Rohan Sharma', documentType: 'Aadhar Card', csvData: 'XXXX XXXX 1234', extractedData: 'XXXX XXXX 1234', status: 'Match' },
    { id: 2, applicantName: 'Priya Singh', documentType: 'PAN Card', csvData: 'ABCDE1234F', extractedData: 'ABCDE1234G', status: 'Mismatch' },
    { id: 3, applicantName: 'Amit Kumar', documentType: 'Aadhar Card', csvData: 'XXXX XXXX 5678', extractedData: 'XXXX XXXX 5678', status: 'Match' },
    { id: 4, applicantName: 'Sneha Verma', documentType: 'Passport', csvData: 'Z1234567', extractedData: 'Z1234567', status: 'Match' },
    { id: 5, applicantName: 'Vikram Rathore', documentType: 'Aadhar Card', csvData: 'XXXX XXXX 9876', extractedData: 'Processing...', status: 'Pending' },
];


const DashboardPage = () => {
    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Screening Member Dashboard</h1>
                <span>RAC Portal</span>
            </header>
            <main className="dashboard-main">
                <FileUploader />
                <ResultsTable data={mockVerificationData} />
            </main>
        </div>
    );
};

export default DashboardPage;
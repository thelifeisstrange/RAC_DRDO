// src/pages/ApplicantDashboardPage.js
import React from 'react';
import './DashboardPage.css';
import './ApplicantDashboard.css';
import { useAuth } from '../context/AuthContext';

const ApplicantDashboardPage = () => {
    // --- UPDATED: Get the 'user' object from the context ---
    const { logout, user } = useAuth();

    const applicationStatus = 'Under Review';
    const submittedDocs = [
        { id: 1, name: 'Aadhar_Card_AmitK.pdf', date: '2023-10-26' },
        { id: 2, name: 'PAN_Card_AmitK.pdf', date: '2023-10-26' },
        { id: 3, name: 'Graduation_Certificate.pdf', date: '2023-10-26' },
    ];
    const notifications = [
        { id: 1, text: 'Your application has been successfully submitted.', read: true },
        { id: 2, text: 'A screening member has begun reviewing your documents.', read: false },
    ];
    const getStatusClass = (status) => { if (status === 'Under Review') return 'status-review'; if (status === 'Approved') return 'status-approved'; return 'status-default'; }

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Applicant Dashboard</h1>
                {/* --- UPDATED HEADER --- */}
                <div className="header-user-info">
                    <span>Hi, {user ? user.name.split(' ')[0] : 'Applicant'}</span>
                    <button className="logout-button" onClick={logout}>Logout</button>
                </div>
            </header>
            <main className="dashboard-main">
                <div className="applicant-card">
                    <h3>Application Overview</h3>
                    <div className="status-container">
                        <span>Your current application status is:</span>
                        <span className={`status-badge ${getStatusClass(applicationStatus)}`}>{applicationStatus}</span>
                    </div>
                </div>
                <div className="applicant-card">
                    <h3>Submitted Documents</h3>
                    <ul className="doc-list">
                        {submittedDocs.map(doc => (<li key={doc.id}><span className="doc-name">{doc.name}</span><span className="doc-date">Submitted on {doc.date}</span></li>))}
                    </ul>
                </div>
                <div className="applicant-card">
                    <h3>Notifications</h3>
                    <ul className="notification-list">
                        {notifications.map(notif => (<li key={notif.id} className={notif.read ? 'read' : 'unread'}>{notif.text}</li>))}
                    </ul>
                </div>
            </main>
        </div>
    );
};
export default ApplicantDashboardPage;
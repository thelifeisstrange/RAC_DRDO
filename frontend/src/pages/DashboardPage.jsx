// src/pages/DashboardPage.jsx
import React from 'react';
import './DashboardPage.css';
import { useAuth } from '../context/AuthContext.jsx';

// --- NEW: Import the reusable VerificationCenter component ---
import VerificationCenter from './VerificationCenter.jsx';

const DashboardPage = () => {
    const { logout, user } = useAuth();

    // All the old state and logic (mock data, filters, etc.) have been removed,
    // because the VerificationCenter component now manages all of that internally.

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Screening Dashboard</h1>
                <div className="header-user-info">
                    {/* Use a fallback for the name, just in case */}
                    <span>Hi, {user ? (user.first_name || user.username) : 'User'}</span>
                    <button className="logout-button" onClick={logout}>Logout</button>
                </div>
            </header>
            <main className="dashboard-main">
                {/* --- The old components are replaced with this single, powerful one --- */}
                <VerificationCenter />
            </main>
        </div>
    );
};

export default DashboardPage;
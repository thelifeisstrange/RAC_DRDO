import React, { useState } from 'react';


import './DashboardPage.css';
import './AdminDashboardPage.css';

import Sidebar from '../components/Sidebar.jsx';
import VerificationCenter from './VerificationCenter.jsx';

const AdminDashboardPage = () => {

    const [activeView, setActiveView] = useState('screening');

    const renderActiveView = () => {
        switch (activeView) {
            case 'screening':
                return <VerificationCenter />;
            default:
                // You can return a default view or a placeholder here
                return <div>Please select a view from the sidebar.</div>;
        }
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Admin Dashboard</h1>
            </header>

            <div className="admin-dashboard-layout">
                <Sidebar
                    activeView={activeView}
                    setActiveView={setActiveView}
                />
                <main className="admin-content-area">
                    {renderActiveView()}
                </main>
            </div>
            
        </div>
    );
};

export default AdminDashboardPage;
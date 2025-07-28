// src/pages/AdminDashboard.jsx

import React, { useState, useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { mockData } from '../data/mockData';
import './AdminDashboard.css';

// Import all the components
import CompactView from '../components/dashboard/CompactView';
import OverviewTable from '../components/dashboard/OverviewTable';
import DetailedTableView from '../components/dashboard/DetailedTableView'; // New Import

// The Tabs component to switch between views
const ViewTabs = ({ activeView, setActiveView }) => {
  // Add 'Detailed Table' to the views
  const views = ['Overview', 'Compact', 'Detailed Table'];
  return (
    <div className="view-tabs">
      {views.map(view => (
        <button
          key={view}
          className={`tab-button ${activeView === view.toLowerCase().replace(' ', '-') ? 'active' : ''}`}
          onClick={() => setActiveView(view.toLowerCase().replace(' ', '-'))}
        >
          {view}
        </button>
      ))}
    </div>
  );
};

// The Main Dashboard Page
const AdminDashboard = () => {
  const [activeView, setActiveView] = useState('detailed-table'); // Default to the new view
  const [expandedRowId, setExpandedRowId] = useState(null); // State for the expanded row
  const { theme, toggleTheme } = useContext(ThemeContext);
  
  // When switching tabs, collapse any open rows
  const handleViewChange = (view) => {
    setExpandedRowId(null);
    setActiveView(view);
  };

  const renderView = () => {
    switch (activeView) {
      case 'compact':
        return <CompactView data={mockData} />;
      case 'overview':
        return <OverviewTable data={mockData} />;
      case 'detailed-table': // Render the new component
      default:
        return (
          <DetailedTableView 
            data={mockData} 
            expandedRowId={expandedRowId}
            setExpandedRowId={setExpandedRowId}
          />
        );
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <h1>Verification Dashboard</h1>
            <p>Results for the latest GATE Scorecard batch.</p>
          </div>
          <button className="theme-toggle" onClick={toggleTheme} title="Toggle Theme">
            <ion-icon name={theme === 'dark' ? 'sunny-outline' : 'moon-outline'}></ion-icon>
          </button>
        </header>

        <nav>
          <ViewTabs activeView={activeView} setActiveView={handleViewChange} />
        </nav>

        <main>
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
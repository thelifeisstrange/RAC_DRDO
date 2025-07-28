// src/App.jsx

import React from 'react';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  // At this stage, the App component's only job is to render our main dashboard page.
  // Later, this is where you might add things like a header, footer, or routing
  // if you have more than one page.
  return (
    <AdminDashboard />
  );
}

export default App;
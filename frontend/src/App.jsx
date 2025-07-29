// src/App.jsx
// Add this import to src/App.jsx
import './index.css';

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import the global authentication provider
import { AuthProvider } from './context/AuthContext.jsx';

// Import the component that protects routes
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';

// Import all the page components
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx'; // This is the Screening Member's dashboard
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';
import ApplicantDashboardPage from './pages/ApplicantDashboardPage.jsx';

function App() {
  return (
      <Router>
        {/* AuthProvider wraps the entire app, making authentication state available everywhere */}
        <AuthProvider>
          <Routes>
            {/* --- PUBLIC ROUTES --- */}
            {/* These routes are accessible to anyone */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* --- PROTECTED ROUTES --- */}
            {/* These routes are only accessible to logged-in users */}
            {/* The ProtectedRoute component acts as a gatekeeper */}
            <Route
                path="/dashboard"
                element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
            />
            <Route
                path="/admin-dashboard"
                element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>}
            />
            <Route
                path="/applicant-dashboard"
                element={<ProtectedRoute><ApplicantDashboardPage /></ProtectedRoute>}
            />

            {/* --- DEFAULT ROUTE --- */}
            {/* If a user goes to the base URL, redirect them to the login page */}
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </AuthProvider>
      </Router>
  );
}

export default App;
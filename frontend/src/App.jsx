// src/App.jsx

// This line imports your global stylesheet, which is essential.
import './index.css';

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';

// --- NEW: Import the Toaster component for notifications ---
import { Toaster } from 'react-hot-toast';

// Import all the page components
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx'; // This is the Screening Member's dashboard
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';
import ApplicantDashboardPage from './pages/ApplicantDashboardPage.jsx';

function App() {
  return (
      <Router>
        <AuthProvider>
          {/* --- NEW: Add the Toaster component here --- */}
          {/* This single component will render all toast notifications from anywhere in your app */}
          <Toaster
              position="top-center"
              toastOptions={{
                duration: 4000, // Toasts last for 4 seconds
                style: {
                  background: 'var(--color-text-heading, #111827)', // Use our CSS variable for dark background
                  color: 'var(--color-bg-card, #ffffff)', // Use our CSS variable for light text
                  fontSize: '0.9rem',
                  fontWeight: '600',
                },
                // Style for specific toast types
                success: {
                  style: {
                    background: 'var(--color-green-bg, #d1fae5)',
                    color: 'var(--color-green-text, #065f46)',
                  },
                },
                error: {
                  style: {
                    background: 'var(--color-red-bg, #fee2e2)',
                    color: 'var(--color-red-text, #991b1b)',
                  },
                },
              }}
          />

          <Routes>
            {/* --- PUBLIC ROUTES --- */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* --- PROTECTED ROUTES --- */}
            <Route
                path="/dashboard"
                element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
            />
            <Route
                path="/admin-dashboard"
                element={<AdminDashboardPage />}
            />
            <Route
                path="/applicant-dashboard"
                element={<ProtectedRoute><ApplicantDashboardPage /></ProtectedRoute>}
            />

            {/* --- DEFAULT ROUTE --- */}
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </AuthProvider>
      </Router>
  );
}

export default App;
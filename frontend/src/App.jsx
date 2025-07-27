// src/App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';

import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';
import ApplicantDashboardPage from './pages/ApplicantDashboardPage.jsx';

function App() {
    return (
        // --- THIS IS THE FIX ---
        // The <Router> component must be the parent of any component that uses routing hooks.
        // Since our AuthProvider uses useNavigate, it needs to be inside the Router.
        <Router>
            <AuthProvider>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />

                    {/* Protected Routes */}
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

                    {/* Default route redirects to login */}
                    <Route path="/" element={<Navigate to="/login" />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
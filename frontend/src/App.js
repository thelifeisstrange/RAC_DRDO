// src/App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage'; // This is the Screening Member's dashboard
import AdminDashboardPage from './pages/AdminDashboardPage';
import ApplicantDashboardPage from './pages/ApplicantDashboardPage';

function App() {
    return (
        <Router>
            <Routes>
                {/* Auth Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />

                {/* Role-Based Dashboard Routes */}
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
                <Route path="/applicant-dashboard" element={<ApplicantDashboardPage />} />

                {/* Default route redirects to login */}
                <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    );
}

export default App;
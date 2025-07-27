// src/components/auth/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const ProtectedRoute = ({ children }) => {
    // UPDATED: Get the isLoading state from the context.
    const { isAuthenticated, isLoading } = useAuth();

    // NEW: If the auth state is still loading, don't render anything yet.
    // You could also render a loading spinner here for a better UX.
    if (isLoading) {
        return <div>Loading session...</div>;
    }

    // This check now only runs AFTER isLoading is false.
    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    return children;
};

export default ProtectedRoute;
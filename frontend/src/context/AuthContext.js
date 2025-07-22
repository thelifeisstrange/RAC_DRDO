// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    // NEW: Add a loading state. It starts as true.
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // This useEffect will now also manage the loading state.
    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('drdo-user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error("Failed to parse user from localStorage", error);
            // If data is corrupted, clear it.
            localStorage.removeItem('drdo-user');
        } finally {
            // CRUCIAL: Set loading to false after we've checked localStorage,
            // regardless of whether a user was found or not.
            setIsLoading(false);
        }
    }, []);

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('drdo-user', JSON.stringify(userData));
        switch (userData.role) {
            case 'Admin': navigate('/admin-dashboard'); break;
            case 'Screening Member': navigate('/dashboard'); break;
            case 'Applicant': navigate('/applicant-dashboard'); break;
            default: navigate('/login');
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('drdo-user');
        navigate('/login');
    };

    // UPDATED: Provide the isLoading state to the rest of the app.
    const value = {
        isAuthenticated: !!user,
        user,
        isLoading,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
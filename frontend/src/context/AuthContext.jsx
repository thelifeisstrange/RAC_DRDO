// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);
const API_URL = 'http://localhost:8000/api/';

export const AuthProvider = ({ children }) => {
    const [authTokens, setAuthTokens] = useState(() => localStorage.getItem('drdo-authTokens') ? JSON.parse(localStorage.getItem('drdo-authTokens')) : null);
    const [user, setUser] = useState(() => {
        const tokens = localStorage.getItem('drdo-authTokens');
        if (tokens) {
            try { return JSON.parse(atob(JSON.parse(tokens).access.split('.')[1])); }
            catch (e) { return null; }
        }
        return null;
    });
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const login = async (email, password) => {
        const loadingToastId = toast.loading('Signing in...');
        try {
            const response = await axios.post(API_URL + 'token/', { email, password });
            if (response.status === 200) {
                toast.dismiss(loadingToastId);
                toast.success('Login successful!');
                const data = response.data;
                const decodedUser = JSON.parse(atob(data.access.split('.')[1]));
                setAuthTokens(data);
                setUser(decodedUser);
                localStorage.setItem('drdo-authTokens', JSON.stringify(data));
                switch (decodedUser.role) {
                    case 'ADMIN': navigate('/admin-dashboard'); break;
                    case 'SCREENING_MEMBER': navigate('/dashboard'); break;
                    case 'APPLICANT': navigate('/applicant-dashboard'); break;
                    default: navigate('/login');
                }
            }
        } catch (error) {
            toast.dismiss(loadingToastId);
            toast.error("Login failed. Please check credentials.");
        }
    };

    const logout = () => {
        setAuthTokens(null);
        setUser(null);
        localStorage.removeItem('drdo-authTokens');
        navigate('/login');
        toast.success('Logged out successfully.');
    };

    useEffect(() => { setIsLoading(false); }, []);

    const value = { isAuthenticated: !!user, user, isLoading, login, logout, authTokens };

    return (
        <AuthContext.Provider value={value}>
            {isLoading ? null : children}
        </AuthContext.Provider>
    );
};
export const useAuth = () => useContext(AuthContext);
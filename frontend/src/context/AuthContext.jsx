// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast'; // --- NEW: Import the toast library ---

const AuthContext = createContext(null);
const API_URL = 'http://localhost:8000/api/';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const tokens = localStorage.getItem('drdo-authTokens');
            if (tokens) {
                return JSON.parse(atob(JSON.parse(tokens).access.split('.')[1]));
            }
            return null;
        } catch (e) {
            console.error("Error parsing auth token from storage", e);
            return null;
        }
    });
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const login = async (email, password) => {
        // --- NEW: Show a loading toast ---
        const loadingToastId = toast.loading('Signing in...');

        try {
            const response = await axios.post(API_URL + 'token/', {
                email: email,
                password: password,
            });

            if (response.status === 200) {
                toast.dismiss(loadingToastId); // Dismiss the loading toast on success
                toast.success('Login successful!'); // --- NEW: Success toast ---

                const data = response.data;
                const decodedUser = JSON.parse(atob(data.access.split('.')[1]));
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
            toast.dismiss(loadingToastId); // Dismiss the loading toast on error
            console.error("Login Error:", error);

            // --- REPLACED alert() with a clean error toast ---
            toast.error("Login failed. Please check your credentials.");
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('drdo-authTokens');
        navigate('/login');
        toast.success('Logged out successfully.'); // Optional: Add a logout confirmation toast
    };

    useEffect(() => { setIsLoading(false); }, []);

    const value = { isAuthenticated: !!user, user, isLoading, login, logout };

    return (
        <AuthContext.Provider value={value}>
            {isLoading ? null : children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
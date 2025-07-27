// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext(null);
const API_URL = 'http://localhost:8000/api/';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const token = localStorage.getItem('drdo-authTokens');
        return token ? JSON.parse(atob(token.split('.')[1])) : null;
    });
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const login = async (email, password) => {
        try {
            const response = await axios.post(API_URL + 'token/', {
                username: email,
                password: password,
            });

            if (response.status === 200) {
                const data = response.data;
                const decodedUser = JSON.parse(atob(data.access.split('.')[1]));

                setUser(decodedUser);
                localStorage.setItem('drdo-authTokens', JSON.stringify(data));

                // --- THIS IS THE FINAL, ROBUST NAVIGATION LOGIC ---
                // We read the role directly from the token payload.
                switch (decodedUser.role) {
                    case 'ADMIN':
                        navigate('/admin-dashboard');
                        break;
                    case 'SCREENING_MEMBER':
                        navigate('/dashboard');
                        break;
                    case 'APPLICANT':
                        navigate('/applicant-dashboard');
                        break;
                    default:
                        navigate('/login');
                }
            }
        } catch (error) {
            console.error("Login Error:", error);
            alert("Something went wrong! Check credentials.");
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('drdo-authTokens');
        navigate('/login');
    };

    useEffect(() => {
        setIsLoading(false);
    }, []);

    const value = {
        isAuthenticated: !!user,
        user,
        isLoading,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {isLoading ? null : children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
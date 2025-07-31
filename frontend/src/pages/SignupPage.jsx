// src/pages/SignupPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast'; // --- NEW: Import the toast library ---
import './Form.css';

const SignupPage = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error("Passwords do not match!"); // --- REPLACED alert() ---
            return;
        }

        // --- NEW: Show a loading toast while the request is happening ---
        const loadingToastId = toast.loading('Creating your account...');

        try {
            const response = await axios.post('http://localhost:8000/api/register/', {
                first_name: firstName,
                last_name: lastName,
                email: email,
                password: password,
                password2: confirmPassword
            });

            if (response.status === 201) {
                toast.dismiss(loadingToastId); // Dismiss the loading toast on success
                toast.success('Signup successful! Please proceed to login.'); // --- REPLACED alert() ---
                navigate('/login');
            }

        } catch (error) {
            toast.dismiss(loadingToastId); // Dismiss the loading toast on error
            console.error("Registration failed:", error.response?.data);

            // --- REPLACED alert() with more specific error toasts ---
            if (error.response?.data?.email) {
                toast.error(`Error: ${error.response.data.email[0]}`);
            } else if (error.response?.data?.password) {
                toast.error(`Password Error: ${error.response.data.password[0]}`);
            }
            else {
                toast.error('An error occurred. Please try again.');
            }
        }
    };

    return (
        <div className="form-screen">
            <div className="form-card">
                <div className="form-header">
                    <h2>Create Account</h2>
                    <p>Get started with the DRDO Portal</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group"><label htmlFor="firstName">First Name</label><input type="text" id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required /></div>
                    <div className="form-group"><label htmlFor="lastName">Last Name</label><input type="text" id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required /></div>
                    <div className="form-group"><label htmlFor="email">Email</label><input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                    <div className="form-group"><label htmlFor="password">Password</label><input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
                    <div className="form-group"><label htmlFor="confirmPassword">Confirm Password</label><input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required /></div>
                    <button type="submit" className="form-button">Sign Up</button>
                </form>
                <div className="form-footer">
                    Already have an account? <Link to="/login">Sign In</Link>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;
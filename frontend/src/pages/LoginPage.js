// src/pages/LoginPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Form.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Screening Member'); // Default role
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempt:', { email, password, role });

    // REMOVED: The alert message that said "Redirecting..."

    // Navigate based on the selected role
    switch (role) {
      case 'Admin':
        navigate('/admin-dashboard');
        break;
      case 'Screening Member':
        navigate('/dashboard'); // The existing dashboard
        break;
      case 'Applicant':
        navigate('/applicant-dashboard');
        break;
      default:
        navigate('/login');
    }
  };

  return (
      <div className="form-screen">
        <div className="form-card">
          <div className="form-header">
            <h2>Welcome Back</h2>
            <p>Sign in to the RAC Portal</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="role">Sign in as</label>
              <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
                <option>Screening Member</option>
                <option>Applicant</option>
                <option>Admin</option>
              </select>
            </div>
            <button type="submit" className="form-button">Sign In</button>
          </form>
          <div className="form-footer">
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </div>
        </div>
      </div>
  );
};

export default LoginPage;
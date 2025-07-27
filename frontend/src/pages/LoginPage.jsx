// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Form.css';
import { useAuth } from '../context/AuthContext.jsx';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Await the login function from the context
    await login(email, password);
  };

  return (
      <div className="form-screen">
        <div className="form-card">
          <div className="form-header"><h2>Welcome Back</h2><p>Sign in to the DRDO Portal</p></div>
          <form onSubmit={handleSubmit}><div className="form-group"><label htmlFor="email">Email</label><input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your registered email" required /></div><div className="form-group"><label htmlFor="password">Password</label><input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div><button type="submit" className="form-button">Sign In</button></form>
          <div className="form-footer">Don't have an account? <Link to="/signup">Sign Up</Link></div>
        </div>
      </div>
  );
};

export default LoginPage;
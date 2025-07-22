// src/pages/LoginPage.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Form.css';
import { initialUsers } from '../data/mockData';
import { useAuth } from '../context/AuthContext'; // Import the useAuth hook

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth(); // Get the login function from our context

  const handleSubmit = (e) => {
    e.preventDefault();
    const foundUser = initialUsers.find(user => user.email === email);

    if (foundUser) {
      // Instead of navigating here, we call the login function from the context.
      // The context will handle storing the user and navigating.
      login(foundUser);
    } else {
      alert('Invalid email or password. Please try again.');
    }
  };

  return (
      <div className="form-screen">
        <div className="form-card">
          <div className="form-header">
            <h2>Welcome Back</h2>
            <p>Sign in to the DRDO Portal</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your registered email" required />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
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
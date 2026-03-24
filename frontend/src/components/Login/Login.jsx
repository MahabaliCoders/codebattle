import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, UserCircle, Loader2 } from 'lucide-react';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!role) {
      setError('Please select a role to continue.');
      return;
    }
    setError('');
    setIsLoading(true);

    // Simulate network authentication
    setTimeout(() => {
      setIsLoading(false);
      if (role === 'Admin') navigate('/dashboard/admin');
      if (role === 'Event Lead') navigate('/dashboard/event-lead');
      if (role === 'User') navigate('/dashboard/user');
    }, 1200);
  };

  return (
    <div className="login-wrapper">
      <div className={`login-glass-card ${isLoaded ? 'fade-in' : ''}`}>
        
        <div className="login-header">
          <div className="brand-logo">
            <div className="logo-mark"></div>
          </div>
          <h2>College Event Management System</h2>
          <p>Sign in to continue</p>
        </div>
        
        <form className="login-form" onSubmit={handleSubmit}>
          
          <div className="input-group">
            <div className={`input-icon-wrapper ${error ? 'has-error' : ''}`}>
               <UserCircle className="input-icon" size={18} />
               <select 
                 className="apple-input apple-select" 
                 value={role}
                 onChange={(e) => { setRole(e.target.value); setError(''); }}
               >
                 <option value="" disabled>Select Role</option>
                 <option value="Admin">Admin</option>
                 <option value="Event Lead">Event Lead</option>
                 <option value="User">User</option>
               </select>
            </div>
          </div>

          <div className="input-group">
            <div className="input-icon-wrapper">
              <Mail className="input-icon" size={18} />
              <input 
                type="email" 
                className="apple-input"
                placeholder="Email Address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
          </div>
          
          <div className="input-group">
            <div className="input-icon-wrapper">
              <Lock className="input-icon" size={18} />
              <input 
                type="password" 
                className="apple-input"
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="form-actions-row">
             {error ? <div className="error-message">{error}</div> : <div></div>}
            <a href="#forgot" className="forgot-link">Forgot Password?</a>
          </div>

          <button type="submit" className="apple-primary-btn group" disabled={isLoading}>
            {isLoading ? (
              <Loader2 size={20} className="spin-loader" />
            ) : (
              <>
                <span>Login</span>
                <ArrowRight size={18} className="btn-icon" />
              </>
            )}
          </button>
          
        </form>

        <div className="login-footer">
          <p>Don't have an account? <a href="#register">Sign up</a></p>
        </div>

      </div>
      
      {/* Background decoration */}
      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>
      <div className="bg-blob blob-3"></div>
    </div>
  );
};

export default Login;

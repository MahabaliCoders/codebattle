import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, UserCircle, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { auth, db } from '../../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import './Login.css';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!role) {
      return setError('Please select an account type.');
    }

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const normalizedRole = role.toLowerCase().replace(/ /g, '-');
      
      // Create user profile with role in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name: fullName,
        email: user.email,
        role: normalizedRole,
        createdAt: new Date().toISOString()
      });

      // Cache for DashboardLayout to avoid rendering lag
      localStorage.setItem('userRole', normalizedRole); 

      // Navigate to the appropriate dashboard based on role
      if (normalizedRole === 'admin') navigate('/dashboard/admin');
      else if (normalizedRole === 'event-lead') navigate('/dashboard/event-lead');
      else navigate('/dashboard/user');
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || 'Error signing up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className={`login-glass-card ${isLoaded ? 'fade-in' : ''}`}>
        <div className="login-header">
           <div className="brand-logo">
             <div className="logo-mark" style={{background: 'linear-gradient(135deg, #007aff 0%, #10b981 100%)'}}></div>
           </div>
          <h2>Create Account</h2>
          <p>Join the Code Battle platform</p>
        </div>
        
        {error && <div className="error-message" style={{color: '#ff3b30', textAlign: 'center', marginBottom: '16px', fontSize: '0.9rem'}}>{error}</div>}
        
        <form className="login-form" onSubmit={handleSignup}>
          
          <div className="input-group">
            <div className="input-icon-wrapper">
              <UserCircle className="input-icon" size={18} />
              <select 
                id="role" 
                value={role}
                onChange={(e) => { setRole(e.target.value); setError(''); }}
                className="apple-input apple-select"
                required
              >
                <option value="" disabled>Select Account Type</option>
                <option value="User">Participant (User)</option>
                <option value="Event Lead">Student Coordinator (Event Lead)</option>
                <option value="Admin">Faculty/Superuser (Admin)</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <div className="input-icon-wrapper">
              <UserCircle className="input-icon" size={18} />
              <input 
                type="text" 
                className="apple-input"
                placeholder="Full Name" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="input-group">
            <div className="input-icon-wrapper">
              <Mail className="input-icon" size={18} />
              <input 
                type="email" 
                id="email" 
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
                id="password" 
                className="apple-input"
                placeholder="Create Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="input-group">
            <div className="input-icon-wrapper">
              <ShieldCheck className="input-icon" size={18} />
              <input 
                type="password" 
                id="confirmPassword" 
                className="apple-input"
                placeholder="Confirm Password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required 
              />
            </div>
          </div>

          <button type="submit" className="apple-primary-btn" disabled={loading}>
            {loading ? (
               <Loader2 size={20} className="spin-loader" />
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight size={18} className="btn-icon" />
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>Already have an account? <Link to="/">Sign In</Link></p>
        </div>
      </div>

      {/* Background decoration */}
      <div className="bg-blob blob-1" style={{background: 'rgba(16, 185, 129, 0.2)'}}></div>
      <div className="bg-blob blob-2" style={{background: 'rgba(0, 122, 255, 0.2)'}}></div>
    </div>
  );
};

export default Signup;


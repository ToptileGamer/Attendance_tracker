import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, UserPlus } from 'lucide-react';

const Login = () => {
  const { login, register, isLoading } = useAuth();
  const [isLoginView, setIsLoginView] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim() || !password) {
      setError('Please fill in all fields');
      return;
    }

    const action = isLoginView ? login : register;
    const result = await action(username, password);
    
    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <div className="login-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="header-title" style={{ justifyContent: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0 }}>{isLoginView ? 'Welcome Back' : 'Create Account'}</h2>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)', borderRadius: '8px', fontSize: '0.9rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="premium-date-picker" 
              style={{ width: '100%', cursor: 'text' }}
              placeholder="Enter username"
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="premium-date-picker"
              style={{ width: '100%', cursor: 'text' }}
              placeholder="Enter password"
            />
          </div>

          <button 
            type="submit" 
            className="day-pill active" 
            style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', opacity: isLoading ? 0.7 : 1 }}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : (isLoginView ? <><LogIn size={18} /> Login</> : <><UserPlus size={18} /> Register</>)}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          {isLoginView ? "Don't have an account? " : "Already have an account? "}
          <span 
            onClick={() => { setIsLoginView(!isLoginView); setError(''); }} 
            style={{ color: 'var(--accent-color)', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {isLoginView ? "Register" : "Login"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;

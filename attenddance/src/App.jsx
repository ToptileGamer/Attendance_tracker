import React from 'react';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LogOut } from 'lucide-react';

const AppContent = () => {
  const { user, logout } = useAuth();

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-title">
          <h1>TrackIt LMS</h1>
        </div>
        {user ? (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <p>AIML Sem IV, Sec-A</p>
            <button 
              onClick={logout} 
              className="btn" 
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        ) : (
          <p>LMS Portal</p>
        )}
      </header>

      <main className="main-content">
        {user ? <Dashboard /> : <Login />}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

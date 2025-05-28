import { useState, useEffect } from 'react';
import { apiClient } from './config/api';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Loading from './components/Loading';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('login'); // 'login' or 'register'

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check if user was logged in previously
      const isLoggedIn = localStorage.getItem('isLoggedIn');

      if (isLoggedIn === 'demo') {
        // Demo mode - create mock user
        setUser({
          id: 1,
          username: 'demo-user',
          role: 'manager'
        });
        return;
      }

      if (isLoggedIn === 'true') {
        // Try to verify session with backend
        const response = await apiClient.get('/auth/check');
        if (response.data.success && response.data.authenticated) {
          setUser(response.data.data?.user || response.data.user || {
            id: 1,
            username: 'user',
            role: 'manager'
          });
          return;
        }
      }

      // No valid session found
      localStorage.removeItem('isLoggedIn');
      setUser(null);
    } catch (error) {
      console.error('Auth check failed:', error);
      // If backend is not available but user was logged in, keep them logged in
      const isLoggedIn = localStorage.getItem('isLoggedIn');
      if (isLoggedIn) {
        setUser({
          id: 1,
          username: 'demo-user',
          role: 'manager'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentView('login');
  };

  const handleRegisterSuccess = (userData) => {
    // Registration successful, switch to login
    setCurrentView('login');
  };

  const handleSwitchToRegister = () => {
    setCurrentView('register');
  };

  const handleSwitchToLogin = () => {
    setCurrentView('login');
  };

  const handleLogout = async () => {
    try {
      // Try to logout from backend session
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage and user state
      localStorage.removeItem('isLoggedIn');
      setUser(null);
      setCurrentView('login');
    }
  };

  if (loading) {
    return <Loading message="Loading SmartPark PSMS..." />;
  }

  return (
    <div className="App">
      {user ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : currentView === 'register' ? (
        <Register
          onRegisterSuccess={handleRegisterSuccess}
          onSwitchToLogin={handleSwitchToLogin}
        />
      ) : (
        <Login
          onLogin={handleLogin}
          onSwitchToRegister={handleSwitchToRegister}
        />
      )}
    </div>
  );
}

export default App;
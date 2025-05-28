import { useState } from 'react';
import { apiClient } from '../config/api';

const Login = ({ onLogin, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return; // Prevent double submission

    setLoading(true);
    setError('');

    try {
      console.log('Attempting login with:', {
        username: formData.username,
        password: formData.password ? '***' : 'empty',
        passwordLength: formData.password?.length
      });

      // Try real backend authentication with session
      const loginPayload = {
        username: formData.username.trim(),
        password: formData.password.trim()
      };

      console.log('Sending login payload:', {
        username: loginPayload.username,
        password: '***',
        passwordLength: loginPayload.password.length
      });

      const response = await apiClient.post('/auth/login', loginPayload);
      console.log('Login response:', response.data);

      if (response.data.success) {
        // Store login status (session is handled by cookies)
        localStorage.setItem('isLoggedIn', 'true');

        // Call onLogin with user data
        const userData = response.data.data?.user || response.data.user || {
          id: 1,
          username: formData.username,
          role: 'manager'
        };

        console.log('Login successful, user data:', userData);
        onLogin(userData);
        return;
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        responseText: error.response?.data?.message || 'No message'
      });

      // Log the full response data to see what backend is saying
      if (error.response?.data) {
        console.log('Backend response:', error.response.data);
      }

      // Check if it's a network error or backend unavailable
      if (!error.response || error.response.status >= 500 || error.code === 'NETWORK_ERROR') {
        // Backend is not available, use demo mode
        if (formData.username && formData.password) {
          setError('Backend server not available. Using demo mode.');

          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Store demo login status
          localStorage.setItem('isLoggedIn', 'demo');

          // Mock successful login
          const mockUser = {
            id: 1,
            username: formData.username,
            role: 'manager'
          };

          console.log('Using demo mode, user data:', mockUser);
          onLogin(mockUser);
          return;
        }
      }

      // Handle authentication errors
      const errorMessage = error.response?.data?.message ||
                          error.message ||
                          'Login failed. Please check your credentials.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-2xl font-bold rounded-xl p-4 inline-block mb-4 shadow-lg">
            SmartPark
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
            SmartPark PSMS
          </h1>
          <p className="text-slate-400 text-lg">Parking Space Management System</p>
          <p className="text-slate-500 text-sm mt-2">Professional Parking Management</p>
        </div>

        {/* Login Form */}
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-2xl p-8 border border-slate-700/50">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Login to Your Account</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500/50 focus:bg-slate-700 transition-all duration-200"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500/50 focus:bg-slate-700 transition-all duration-200 hover:border-slate-500"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-orange-500/50 disabled:to-orange-600/50 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-800 shadow-lg hover:shadow-orange-500/25"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Registration Link */}
          <div className="mt-6 text-center">
            <p className="text-slate-400">
              Don't have an account?{' '}
              <button
                onClick={onSwitchToRegister}
                className="text-orange-400 hover:text-orange-300 font-medium transition-colors duration-200"
              >
                Create one here
              </button>
            </p>
          </div>

          {/* Demo Credentials */}
          <div className="mt-8 p-4 bg-slate-700/50 rounded-lg">
            <h3 className="text-sm font-medium text-slate-300 mb-2">Authentication:</h3>
            <div className="text-sm text-slate-400 space-y-1">
              <p><span className="text-orange-400">Backend:</span> Connects to your database if available</p>
              <p><span className="text-orange-400">Demo:</span> Any credentials work if backend is offline</p>
              <p className="text-xs text-slate-500 mt-2">System automatically detects backend availability</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-slate-500 text-sm">
            © 2025 SmartPark PSMS. All rights reserved.
          </p>
          <p className="text-slate-600 text-xs mt-1">
            Rubavu District, West Province, Rwanda
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

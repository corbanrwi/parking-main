import { useState } from 'react';
import { apiClient } from '../config/api';

const Register = ({ onRegisterSuccess, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: 'manager'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const validateForm = () => {
    if (!formData.username || !formData.password || !formData.fullName) {
      setError('All fields are required');
      return false;
    }

    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters long');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;

    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('Attempting registration with:', {
        username: formData.username,
        fullName: formData.fullName,
        role: formData.role
      });

      const registrationData = {
        username: formData.username.trim(),
        password: formData.password.trim(),
        fullName: formData.fullName.trim(),
        role: formData.role
      };

      const response = await apiClient.post('/auth/register', registrationData);
      console.log('Registration response:', response.data);

      if (response.data.success) {
        setSuccess('Registration successful! You can now login.');
        setFormData({
          username: '',
          password: '',
          confirmPassword: '',
          fullName: '',
          role: 'manager'
        });

        // Call success callback if provided
        if (onRegisterSuccess) {
          onRegisterSuccess(response.data.data?.user || response.data.user);
        }

        // Auto-switch to login after 2 seconds
        setTimeout(() => {
          if (onSwitchToLogin) {
            onSwitchToLogin();
          }
        }, 2000);

      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      const errorMessage = error.response?.data?.message ||
                          error.message ||
                          'Registration failed. Please try again.';
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
          <p className="text-slate-500 text-sm mt-2">Create Your Account</p>
        </div>

        {/* Registration Form */}
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-2xl p-8 border border-slate-700/50">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Create Your Account</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg mb-6">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-300 mb-2">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500/50 focus:bg-slate-700 transition-all duration-200"
                placeholder="Enter your full name"
              />
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-2">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500/50 focus:bg-slate-700 transition-all duration-200"
                placeholder="Choose a username"
              />
            </div>

            {/* Role */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-slate-300 mb-2">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500/50 focus:bg-slate-700 transition-all duration-200"
              >
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500/50 focus:bg-slate-700 transition-all duration-200"
                placeholder="Create a password"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500/50 focus:bg-slate-700 transition-all duration-200"
                placeholder="Confirm your password"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-orange-500/50 disabled:to-orange-600/50 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-800 shadow-lg hover:shadow-orange-500/25"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Switch to Login */}
          <div className="mt-6 text-center">
            <p className="text-slate-400">
              Already have an account?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-orange-400 hover:text-orange-300 font-medium transition-colors duration-200"
              >
                Sign in here
              </button>
            </p>
          </div>

          {/* Registration Info */}
          <div className="mt-8 p-4 bg-slate-700/50 rounded-lg">
            <h3 className="text-sm font-medium text-slate-300 mb-2">Registration Requirements:</h3>
            <div className="text-sm text-slate-400 space-y-1">
              <p><span className="text-orange-400">Username:</span> Must be at least 3 characters</p>
              <p><span className="text-orange-400">Password:</span> Must be at least 6 characters</p>
              <p><span className="text-orange-400">Role:</span> Choose Manager or Admin access level</p>
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

export default Register;

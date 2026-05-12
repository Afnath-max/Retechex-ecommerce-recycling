import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import PasswordInput from '../../components/PasswordInput';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.login(formData);
      const { token, user } = response.data;

      // Check if user is admin
      if (user.role !== 'admin') {
        toast.error('Access denied. Admin credentials required.');
        setLoading(false);
        return;
      }

      // Use login with token and user (no additional API call)
      login(token, user);
      toast.success('Admin login successful!');
      
      // Navigate immediately
      navigate('/admin/dashboard', { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid admin credentials');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-16 w-16 bg-red-600 rounded-full flex items-center justify-center">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Administrator access only
          </p>
        </div>

        <form className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-md" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Admin Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field"
                placeholder="admin@retechex.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <PasswordInput
                id="password"
                name="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter admin password"
                required
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary bg-red-600 hover:bg-red-700"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign in as Admin'
              )}
            </button>
          </div>

          <div className="text-center space-y-2">
            <Link to="/staff/login" className="text-sm text-blue-600 hover:text-blue-700">
              Staff Login →
            </Link>
            <br />
            <Link to="/login" className="text-sm text-gray-600 hover:text-gray-700">
              Customer Login →
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
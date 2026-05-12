import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Users } from 'lucide-react';
import toast from 'react-hot-toast';
import PasswordInput from '../../components/PasswordInput';

const StaffLogin = () => {
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

      // Check if user is staff
      if (user.role !== 'staff') {
        toast.error('Access denied. Staff credentials required.');
        setLoading(false);
        return;
      }

      // Use login with token and user (no additional API call)
      login(token, user);
      toast.success('Staff login successful!');
      
      // Navigate immediately
      navigate('/staff/dashboard', { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid staff credentials');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
            <Users className="h-10 w-10 text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Staff Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Staff member access
          </p>
        </div>

        <form className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-md" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Staff Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field"
                placeholder="staff@retechex.com"
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
                placeholder="Enter staff password"
                required
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign in as Staff'
              )}
            </button>
          </div>

          <div className="text-center space-y-2">
            <Link to="/admin/login" className="text-sm text-red-600 hover:text-red-700">
              Admin Login →
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

export default StaffLogin;
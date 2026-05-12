import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';
import PasswordInput from '../components/PasswordInput';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: email, 2: otp+password
  const [email, setEmail] = useState('');
  const [otp, setOTP] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authAPI.forgotPassword({ email });
      toast.success('Reset code sent to your email!');
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await authAPI.resetPassword({ email, otp, newPassword });
      toast.success('Password reset successful!');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="card">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {step === 1 ? 'Forgot Password?' : 'Reset Password'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {step === 1 
                ? 'Enter your email to receive a reset code'
                : 'Enter the code and your new password'
              }
            </p>
          </div>

          {step === 1 ? (
            /* Step 1: Email */
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-primary w-full"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Code'}
              </button>

              <div className="text-center">
                <Link to="/login" className="text-sm text-primary-600 hover:text-primary-700">
                  ← Back to Login
                </Link>
              </div>
            </form>
          ) : (
            /* Step 2: OTP + New Password */
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                  Reset Code
                </label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOTP(e.target.value)}
                  className="input-field text-center text-2xl tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Check your email for the 6-digit code
                </p>
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <PasswordInput
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Must be at least 6 characters
                </p>
              </div>

              <button
                type="submit"
                className="btn-primary w-full"
                disabled={loading}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  ← Use different email
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Need help? Contact{' '}
            <a href="mailto:support@retechex.com" className="text-primary-600 hover:text-primary-700">
              support@retechex.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

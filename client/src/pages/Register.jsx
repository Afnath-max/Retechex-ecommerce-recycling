// client/src/pages/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/PasswordInput';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';
import { 
  validateName, 
  validateEmail, 
  validatePhone, 
  checkPasswordStrength 
} from '../utils/validation';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'name':
        if (!validateName(value)) {
          error = 'Name can only contain letters and spaces';
        } else if (value.trim().length < 2) {
          error = 'Name must be at least 2 characters';
        }
        break;
      case 'email':
        if (!validateEmail(value)) {
          error = 'Please enter a valid email address';
        }
        break;
      case 'phone':
        if (value && !validatePhone(value)) {
          error = 'Please enter a valid Sri Lankan phone number (10 digits starting with 0)';
        }
        break;
      case 'password':
        const passwordCheck = checkPasswordStrength(value);
        if (!passwordCheck.isValid) {
          error = 'Password must be at least medium strength';
        }
        break;
      default:
        break;
    }
    
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // For name field, prevent numbers from being typed
    if (name === 'name' && /\d/.test(value)) {
      return;
    }
    
    setFormData((p) => ({ ...p, [name]: value }));
    
    // Validate on change
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleFile = (e) => {
    const f = e.target.files && e.target.files[0];
    
    // Validate file size (5MB max)
    if (f && f.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }
    
    setFile(f || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Final validation
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    
    // Check required fields
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix the errors before submitting');
      return;
    }
    
    setLoading(true);

    // Build multipart form data
    const fd = new FormData();
    fd.append('name', formData.name.trim());
    fd.append('email', formData.email.toLowerCase().trim());
    fd.append('password', formData.password);
    fd.append('phone', formData.phone);
    if (file) fd.append('image', file); // must match upload.single('image')

    const result = await register(fd);
    setLoading(false);

    if (result?.success) {
      navigate('/marketplace');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4">
      <div className="max-w-md w-full card">
        <h2 className="text-3xl font-bold text-center mb-8">Create Account</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className={`input-field ${errors.name ? 'border-red-500' : ''}`}
              placeholder="John Doe"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className={`input-field ${errors.email ? 'border-red-500' : ''}`}
              placeholder="your@email.com"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone (Optional)</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`input-field ${errors.phone ? 'border-red-500' : ''}`}
              placeholder="0771234567"
              maxLength="10"
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">Sri Lankan format: 10 digits starting with 0</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <PasswordInput
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className={errors.password ? 'border-red-500' : ''}
            />
            <PasswordStrengthIndicator password={formData.password} />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {/* New: Profile Photo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
            <input
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleFile}
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            <p className="text-xs text-gray-500 mt-1">PNG, JPG, or WEBP up to 5 MB.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
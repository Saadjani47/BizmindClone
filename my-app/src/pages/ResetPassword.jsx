import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Lock, AlertCircle, Check, Eye, EyeOff } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { resetPassword } from '../services/auth';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || searchParams.get('reset_password_token') || '';

  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState({ success: '', error: '' });
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const nextErrors = {};
    if (!token) nextErrors.token = 'Reset token is missing. Please use the link from your email.';
    if (!formData.password) {
      nextErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setFeedback({ success: '', error: '' });

    try {
      await resetPassword({
        token,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      setFeedback({ success: 'Password updated successfully. You can now sign in.', error: '' });
      setTimeout(() => navigate('/login'), 800);
    } catch (err) {
      const apiMessage = err?.response?.data?.errors?.[0] || 'Unable to reset password. The link may be expired.';
      setFeedback({ success: '', error: apiMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  return (
    <AuthLayout
      title="Set a new password"
      subtitle="Choose a strong password to secure your account"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {feedback.error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertCircle className="h-4 w-4" />
            <span>{feedback.error}</span>
          </div>
        )}

        {feedback.success && (
          <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            <Check className="h-4 w-4" />
            <span>{feedback.success}</span>
          </div>
        )}

        {!token && (
          <div className="flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-700">
            <AlertCircle className="h-4 w-4" />
            <span>Reset token missing. Open the link from your email to include the token.</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">New password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-offset-1 focus:outline-none transition-colors ${
                errors.password
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
              }`}
              placeholder="••••••••"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
          {errors.password && (
            <div className="flex items-center mt-1 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.password}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Confirm password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-offset-1 focus:outline-none transition-colors ${
                errors.confirmPassword
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
              }`}
              placeholder="••••••••"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <div className="flex items-center mt-1 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.confirmPassword}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !token}
          className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-300 ${
            isLoading || !token
              ? 'bg-blue-300 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 hover:shadow-lg'
          }`}
        >
          {isLoading ? 'Updating password...' : 'Update password'}
        </button>

        <div className="text-center pt-4 text-sm text-gray-600">
          Return to{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import api from '../utils/api';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await api.post(`/api/auth/reset-password/${token}`, { password: formData.password });
      toast.success('Password reset successful!');
      setDone(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-[#4F46E5] items-center justify-center p-12">
        <div className="max-w-md text-white">
          <div className="flex items-center gap-3 mb-6">
            <GraduationCap size={48} />
            <h1 className="text-4xl font-bold">AJM International Institution</h1>
          </div>
          <p className="text-xl text-white/90 leading-relaxed">
            Set a new password for your account.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-semibold text-[#0F172A] mb-2">Set New Password</h2>
              <p className="text-[#64748B]">Enter your new password below</p>
            </div>

            {done ? (
              <div className="p-4 bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg text-center">
                <p className="text-[#166534] font-medium">Password reset successfully!</p>
                <p className="text-sm text-[#166534] mt-1">Redirecting to login...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-[#0F172A] mb-2">
                    New Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full h-10 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2 transition-all"
                    placeholder="At least 6 characters"
                  />
                </div>
                <div>
                  <label htmlFor="confirm" className="block text-sm font-medium text-[#0F172A] mb-2">
                    Confirm Password
                  </label>
                  <input
                    id="confirm"
                    type="password"
                    required
                    value={formData.confirm}
                    onChange={(e) => setFormData({ ...formData, confirm: e.target.value })}
                    className="w-full h-10 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2 transition-all"
                    placeholder="Repeat new password"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#4F46E5] text-white hover:bg-[#4338CA] h-10 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            )}

            <div className="mt-6 text-center">
              <a href="/login" className="text-[#4F46E5] hover:text-[#4338CA] text-sm font-medium transition-colors">
                ← Back to Login
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

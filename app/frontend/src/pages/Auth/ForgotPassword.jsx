import React, { useState } from 'react';
import { GraduationCap, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/utils/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetUrl, setResetUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/api/auth/forgot-password', { email });
      if (res.data.resetUrl) {
        setResetUrl(res.data.resetUrl);
        toast.success('Reset link generated!');
      } else {
        toast.success(res.data.message || 'Check your email for the reset link.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(resetUrl);
    setCopied(true);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
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
            Reset your password to regain access to your portal.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-semibold text-[#0F172A] mb-2">Forgot Password</h2>
              <p className="text-[#64748B]">Enter your registered email to receive a reset link</p>
            </div>

            {!resetUrl ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[#0F172A] mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-10 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2 transition-all"
                    placeholder="you@school.com"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#4F46E5] text-white hover:bg-[#4338CA] h-10 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Generating link...' : 'Generate Reset Link'}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg">
                  <p className="text-sm font-medium text-[#166534] mb-2">Reset link generated!</p>
                  <p className="text-xs text-[#166534]">Share this link with the user so they can reset their password. This link expires in 1 hour.</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={resetUrl}
                    className="flex-1 h-10 px-3 text-xs border border-slate-200 rounded-lg bg-[#F8FAFC] text-[#64748B] truncate"
                  />
                  <button
                    onClick={handleCopy}
                    className="flex-shrink-0 h-10 w-10 flex items-center justify-center border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    {copied ? <Check size={16} className="text-[#10B981]" /> : <Copy size={16} className="text-[#64748B]" />}
                  </button>
                </div>
                <button
                  onClick={() => { setResetUrl(''); setEmail(''); }}
                  className="w-full h-10 border border-slate-200 rounded-lg font-medium text-[#64748B] hover:bg-slate-50 transition-colors"
                >
                  Generate another link
                </button>
              </div>
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

export default ForgotPassword;

import React, { useState } from 'react';
import { toast } from 'sonner';
import { GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const getDefaultPath = (role) => {
  switch (role) {
    case 'staff': return '/staff/profile';
    case 'student': return '/student/profile';
    case 'parent': return '/parent/profile';
    default: return '/dashboard';
  }
};

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState('other'); // 'student' or 'other'
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [isEye, setIsEye] = useState(false);

  const handlePassword = () => {
    setIsEye((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const credentials = {
        password: formData.password,
        [loginType === 'student' ? 'rollNumber' : 'email']: formData.identifier,
      };
      const user = await login(credentials);
      console.log(user, "user");
      toast.success('Login successful!');
      navigate(getDefaultPath(user.role), { replace: true });
    } catch (error) {
      console.log(error, "error");
      toast.error(error.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ... Left Side remains same ... */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#4F46E5] items-center justify-center p-12">
        <div className="max-w-md text-white">
          <div className="flex items-center gap-3 mb-6">
            <GraduationCap size={48} />
            <h1 className="text-4xl font-bold">AJM International Institution</h1>
          </div>
          <p className="text-xl text-white/90 leading-relaxed mb-8">
            Complete School Management System for Modern Education
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h3 className="font-semibold mb-4">Demo Credentials:</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Admin:</strong> admin@school.com / Admin@123</p>
              <p><strong>Staff:</strong> john.smith@school.com / Staff@123</p>
              <p><strong>Student:</strong> STU2026002 / Dhuwa@123</p>
              <p><strong>Parent:</strong> parent1@school.com / Parent@123</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-semibold text-[#0F172A] mb-2">Welcome Back</h2>
              <p className="text-[#64748B]">Enter your credentials to access your portal</p>
            </div>

            {/* Login Type Toggle */}
            <div className="flex p-1 bg-slate-100 rounded-lg mb-6">
              <button
                type="button"
                onClick={() => {
                  setLoginType('other');
                  setFormData({ ...formData, identifier: '' });
                }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${loginType === 'other' ? 'bg-white text-[#4F46E5] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
              >
                Staff/Admin/Parent
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginType('student');
                  setFormData({ ...formData, identifier: '' });
                }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${loginType === 'student' ? 'bg-white text-[#4F46E5] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
              >
                Student
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="identifier" className="block text-sm font-medium text-[#0F172A] mb-2">
                  {loginType === 'student' ? 'Roll Number' : 'Email'}
                </label>
                <input
                  id="identifier"
                  type={loginType === 'student' ? 'text' : 'email'}
                  required
                  value={formData.identifier}
                  onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                  className="w-full h-10 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2 transition-all"
                  placeholder={loginType === 'student' ? 'STU2026001' : 'you@school.com'}
                />
              </div>

              <div className="relative">
                <label htmlFor="password" className="block text-sm font-medium text-[#0F172A] mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type={isEye ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full h-10 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2 transition-all"
                  placeholder="••••••••"
                />
                {isEye ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6 absolute bottom-2 right-1 cursor-pointer"
                    onClick={handlePassword}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6 absolute bottom-2 right-1 cursor-pointer"
                    onClick={handlePassword}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                    />
                  </svg>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#4F46E5] text-white hover:bg-[#4338CA] h-10 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Please wait...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <a href="/forgot-password" className="text-[#4F46E5] hover:text-[#4338CA] text-sm font-medium transition-colors">
                Forgot password?
              </a>
            </div>

            <div className="mt-4 text-center">
              <a href="/" className="text-[#4F46E5] hover:text-[#4338CA] text-sm font-medium transition-colors">
                ← Back to Home
              </a>
            </div>

            <div className="mt-6 p-4 bg-[#F8FAFC] rounded-lg lg:hidden">
              <p className="text-xs text-[#64748B] font-semibold mb-2">Demo Credentials:</p>
              <div className="space-y-1 text-xs text-[#64748B]">
                <p>Admin: admin@school.com / Admin@123</p>
                <p>Staff: john.smith@school.com / Staff@123</p>
                <p>Student: student1@school.com / Student@123</p>
                <p>Parent: parent1@school.com / Parent@123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

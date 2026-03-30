import { useState } from 'react';
import { toast } from 'sonner';
import { GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '@/utils/api';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    schoolName: '',
    schoolType: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    adminName: '',
    adminEmail: '',
    adminPhone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [isEye, setIsEye] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await api.post('/api/auth/signup', {
        schoolName: formData.schoolName,
        schoolType: formData.schoolType,
        address1: formData.address1,
        address2: formData.address2,
        city: formData.city,
        state: formData.state,
        adminName: formData.adminName,
        adminEmail: formData.adminEmail,
        adminPhone: formData.adminPhone,
        password: formData.password,
      });
      toast.success('School registered successfully! Please login.');
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
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
            <h1 className="text-4xl font-bold">
              School Management System
            </h1>
          </div>
          <p className="text-xl text-white/90 leading-relaxed mb-8">
            Register your school and start managing everything from one platform.
          </p>
          <div className="space-y-4 text-white/80">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">1</div>
              <span>Register your school</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">2</div>
              <span>Add teachers & students</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">3</div>
              <span>Start managing your school</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-semibold text-[#0F172A] mb-2">
                Register Your School
              </h2>
              <p className="text-[#64748B]">
                Create an account to get started
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="schoolName" className="block text-sm font-medium text-[#0F172A] mb-2">
                  School Name
                </label>
                <input
                  id="schoolName"
                  name="schoolName"
                  type="text"
                  required
                  value={formData.schoolName}
                  onChange={handleChange}
                  className="w-full h-10 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2 transition-all"
                  placeholder="ABC International School"
                />
              </div>

              <div>
                <label htmlFor="schoolType" className="block text-sm font-medium text-[#0F172A] mb-2">
                  School Type
                </label>
                <select
                  id="schoolType"
                  name="schoolType"
                  required
                  value={formData.schoolType}
                  onChange={handleChange}
                  className="w-full h-10 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2 transition-all bg-white"
                >
                  <option value="">-- Select School Type --</option>
                  <option value="matriculation">Matriculation</option>
                  <option value="cbse">CBSE</option>
                  <option value="state_board">State Board</option>
                  <option value="govt">Government School</option>
                  <option value="international">International School</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="address1" className="block text-sm font-medium text-[#0F172A] mb-2">
                  Address Line 1
                </label>
                <input
                  id="address1"
                  name="address1"
                  type="text"
                  required
                  value={formData.address1}
                  onChange={handleChange}
                  className="w-full h-10 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2 transition-all"
                  placeholder="123, Main Street"
                />
              </div>

              <div>
                <label htmlFor="address2" className="block text-sm font-medium text-[#0F172A] mb-2">
                  Address Line 2
                </label>
                <input
                  id="address2"
                  name="address2"
                  type="text"
                  value={formData.address2}
                  onChange={handleChange}
                  className="w-full h-10 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2 transition-all"
                  placeholder="Near landmark, Area"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-[#0F172A] mb-2">
                    City
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full h-10 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2 transition-all"
                    placeholder="Chennai"
                  />
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-[#0F172A] mb-2">
                    State
                  </label>
                  <input
                    id="state"
                    name="state"
                    type="text"
                    required
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full h-10 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2 transition-all"
                    placeholder="Tamil Nadu"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="adminName" className="block text-sm font-medium text-[#0F172A] mb-2">
                  Admin Name
                </label>
                <input
                  id="adminName"
                  name="adminName"
                  type="text"
                  required
                  value={formData.adminName}
                  onChange={handleChange}
                  className="w-full h-10 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2 transition-all"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="adminEmail" className="block text-sm font-medium text-[#0F172A] mb-2">
                  Admin Email
                </label>
                <input
                  id="adminEmail"
                  name="adminEmail"
                  type="email"
                  required
                  value={formData.adminEmail}
                  onChange={handleChange}
                  className="w-full h-10 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2 transition-all"
                  placeholder="admin@school.com"
                />
              </div>

              <div>
                <label htmlFor="adminPhone" className="block text-sm font-medium text-[#0F172A] mb-2">
                  Phone Number
                </label>
                <input
                  id="adminPhone"
                  name="adminPhone"
                  type="tel"
                  required
                  value={formData.adminPhone}
                  onChange={handleChange}
                  className="w-full h-10 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2 transition-all"
                  placeholder="+91 9876543210"
                />
              </div>

              <div className="relative">
                <label htmlFor="password" className="block text-sm font-medium text-[#0F172A] mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type={isEye ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full h-10 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2 transition-all"
                  placeholder="••••••••"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6 absolute bottom-2 right-1 cursor-pointer"
                  onClick={() => setIsEye(!isEye)}
                >
                  {isEye ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                  )}
                </svg>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#0F172A] mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full h-10 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2 transition-all"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#4F46E5] text-white hover:bg-[#4338CA] h-10 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating School...' : 'Register School'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <span className="text-[#64748B] text-sm">Already have an account? </span>
              <a
                href="/login"
                className="text-[#4F46E5] hover:text-[#4338CA] text-sm font-medium transition-colors"
              >
                Sign In
              </a>
            </div>

            <div className="mt-4 text-center">
              <a
                href="/"
                className="text-[#4F46E5] hover:text-[#4338CA] text-sm font-medium transition-colors"
              >
                ← Back to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;

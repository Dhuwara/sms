import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, GraduationCap, Users, Calendar, DollarSign, BookOpen, MessageSquare, BarChart, Shield, CheckCircle } from 'lucide-react';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const features = [
    { icon: Calendar, title: 'Attendance Management', desc: 'Mark attendance digitally and generate reports instantly.' },
    { icon: DollarSign, title: 'Fee Management', desc: 'Track paid, due, and pending fees with automatic reminders.' },
    { icon: GraduationCap, title: 'Exams & Report Cards', desc: 'Create exams, enter marks, and generate digital report cards.' },
    { icon: BookOpen, title: 'Timetable Management', desc: 'Simple class and teacher scheduling.' },
    { icon: MessageSquare, title: 'Parent Communication', desc: 'Send notices, updates, and alerts via SMS or WhatsApp.' },
    { icon: BarChart, title: 'Reports & Analytics', desc: 'Get clear insights into attendance, fees, and performance.' },
  ];

  const benefits = [
    'One platform for all school operations',
    'Easy to use for teachers & office staff',
    'Reduces paperwork and manual errors',
    'Improves transparency with parents',
    'Secure, cloud-based access',
    'Dedicated setup, training & support',
  ];

  const schools = [
    'CBSE Schools',
    'ICSE/CISCE Schools',
    'Matriculation Schools',
    'State Board Schools',
    'Higher Secondary Schools',
    'Private & Trust-run Institutions',
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you! We will contact you soon.');
    setFormData({ name: '', email: '', message: '' });
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b-4 border-[#FCD34D] shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="https://customer-assets.emergentagent.com/job_school-hub-ajm/artifacts/xr5umcwl_logo.jpg" 
                alt="AJMII Logo" 
                className="h-12 w-12 object-contain rounded-lg"
              />
              <div>
                <span className="text-2xl font-bold text-[#0F172A]">AJM International Institution</span>
                <p className="text-xs text-[#64748B]">(AJM Silicon Valley)</p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollToSection('home')} className="text-[#0F172A] hover:text-[#F59E0B] font-medium transition-colors">Home</button>
              <button onClick={() => scrollToSection('about')} className="text-[#0F172A] hover:text-[#F59E0B] font-medium transition-colors">About</button>
              <button onClick={() => scrollToSection('features')} className="text-[#0F172A] hover:text-[#F59E0B] font-medium transition-colors">Features</button>
              <button onClick={() => scrollToSection('contact')} className="text-[#0F172A] hover:text-[#F59E0B] font-medium transition-colors">Contact</button>
              <Link
                to="/login"
                data-testid="nav-login-button"
                className="bg-[#DC2626] text-white hover:bg-[#B91C1C] px-6 py-2.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
              >
                Login
              </Link>
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-3 border-t pt-4">
              <button onClick={() => scrollToSection('home')} className="block w-full text-left text-[#0F172A] hover:text-[#F59E0B] font-medium py-2">Home</button>
              <button onClick={() => scrollToSection('about')} className="block w-full text-left text-[#0F172A] hover:text-[#F59E0B] font-medium py-2">About</button>
              <button onClick={() => scrollToSection('features')} className="block w-full text-left text-[#0F172A] hover:text-[#F59E0B] font-medium py-2">Features</button>
              <button onClick={() => scrollToSection('contact')} className="block w-full text-left text-[#0F172A] hover:text-[#F59E0B] font-medium py-2">Contact</button>
              <Link to="/login" className="block bg-[#DC2626] text-white px-6 py-2.5 rounded-lg font-semibold text-center">Login</Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="py-20 px-6 bg-[#FEF3C7]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white text-[#DC2626] px-4 py-2 rounded-full font-semibold text-sm mb-6">
                <CheckCircle size={16} />
                Trusted by 500+ Schools
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-[#0F172A] mb-6 leading-tight">
                Complete School Management Software for 
                <span className="text-[#DC2626]"> Modern Schools</span>
              </h1>
              <p className="text-xl text-[#0F172A]/80 mb-8 leading-relaxed">
                Streamline attendance, fees, exams, timetables, and parent communication with our comprehensive platform designed for Indian and International schools.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="bg-[#DC2626] text-white hover:bg-[#B91C1C] px-8 py-4 rounded-lg font-semibold text-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                  Book a Free Demo
                </button>
                <button className="bg-white text-[#DC2626] border-2 border-[#DC2626] hover:bg-[#DC2626] hover:text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all shadow-md">
                  Request Pricing
                </button>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-[#0F172A]/70">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-[#0F172A]" />
                  <span>Free Setup & Training</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-[#0F172A]" />
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-white rounded-2xl blur opacity-30"></div>
              <img
                src="https://images.unsplash.com/photo-1562774053-701939374585?w=800"
                alt="School building"
                className="relative rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why Section */}
      <section id="about" className="py-20 px-6 bg-gradient-to-r from-[#FEF3C7] to-[#FEE2E2]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white text-[#DC2626] px-4 py-2 rounded-full font-semibold text-sm mb-4 shadow-sm">
              <Shield size={16} />
              Why Choose Us
            </div>
            <h2 className="text-4xl font-bold text-[#0F172A] mb-4">Why AJM Silicon Valley?</h2>
            <p className="text-[#64748B] text-lg max-w-2xl mx-auto">Everything you need to run a modern school efficiently with dedicated support</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-white/50 shadow-sm hover:shadow-md transition-all hover:bg-white">
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-1 bg-[#10B981]/10 rounded-full">
                    <CheckCircle className="text-[#10B981]" size={20} />
                  </div>
                  <p className="text-[#0F172A] font-medium">{benefit}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#FEF3C7] text-[#DC2626] px-4 py-2 rounded-full font-semibold text-sm mb-4">
              <BarChart size={16} />
              Core Features
            </div>
            <h2 className="text-4xl font-bold text-[#0F172A] mb-4">Everything You Need in One Platform</h2>
            <p className="text-[#64748B] text-lg max-w-2xl mx-auto">Comprehensive tools designed specifically for Indian schools to manage all operations efficiently</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="group bg-white p-8 rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all hover:border-[#FCD34D] hover:-translate-y-1">
                  <div className="p-3 bg-gradient-to-br from-[#FEF3C7] to-[#FCD34D] rounded-lg w-fit mb-4 group-hover:from-[#FCD34D] group-hover:to-[#F59E0B] transition-all">
                    <Icon className="text-[#DC2626]" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold text-[#0F172A] mb-2">{feature.title}</h3>
                  <p className="text-[#64748B]">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Who Can Use */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#FEF3C7] text-[#DC2626] px-4 py-2 rounded-full font-semibold text-sm mb-4">
            <Users size={16} />
            Perfect For
          </div>
          <h2 className="text-4xl font-bold text-[#0F172A] mb-4">Who Can Use This?</h2>
          <p className="text-[#64748B] mb-12 text-lg max-w-2xl mx-auto">Perfect for all types of educational institutions across India</p>
          <div className="flex flex-wrap justify-center gap-4">
            {schools.map((school, index) => (
              <div key={index} className="bg-gradient-to-r from-[#FEF3C7] to-[#FCD34D] px-6 py-3 rounded-lg shadow-sm font-semibold text-[#DC2626] hover:from-[#FCD34D] hover:to-[#F59E0B] transition-all hover:shadow-md">
                {school}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-6 bg-gradient-to-br from-[#FEF3C7] via-white to-[#FEE2E2]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white text-[#DC2626] px-4 py-2 rounded-full font-semibold text-sm mb-4 shadow-sm">
              <MessageSquare size={16} />
              Get In Touch
            </div>
            <h2 className="text-4xl font-bold text-[#0F172A] mb-4">Ready to Transform Your School?</h2>
            <p className="text-[#64748B] text-lg max-w-2xl mx-auto">Contact us today for a free demo and see how we can help streamline your school operations</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-white/50">
              <h3 className="text-2xl font-semibold text-[#0F172A] mb-6">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-[#FCD34D] rounded-lg">
                    <GraduationCap className="text-[#DC2626]" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-[#0F172A]">School Name:</p>
                    <p className="text-[#64748B]">AJM International Institution</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-[#FCD34D] rounded-lg">
                    <MessageSquare className="text-[#DC2626]" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-[#0F172A]">Email:</p>
                    <p className="text-[#64748B]">ajminstitution@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-[#FCD34D] rounded-lg">
                    <Users className="text-[#DC2626]" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-[#0F172A]">Phone:</p>
                    <p className="text-[#64748B]">+91 9884620202</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-[#FCD34D] rounded-lg">
                    <Calendar className="text-[#DC2626]" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-[#0F172A]">Address:</p>
                    <p className="text-[#64748B]">24, Mannady St, opposite to post office, Chennai - 600001</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200">
              <h3 className="text-2xl font-semibold text-[#0F172A] mb-6">Send Us a Message</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-[#0F172A] mb-2">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-12 px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-[#FCD34D] transition-colors"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0F172A] mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-12 px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-[#FCD34D] transition-colors"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0F172A] mb-2">Message</label>
                  <textarea
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows="4"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-[#FCD34D] resize-none transition-colors"
                    placeholder="Tell us about your school and requirements..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#DC2626] text-white hover:bg-[#B91C1C] h-12 px-6 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F172A] text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <img 
                src="https://customer-assets.emergentagent.com/job_school-hub-ajm/artifacts/xr5umcwl_logo.jpg" 
                alt="AJMII Logo" 
                className="h-10 w-10 object-contain rounded-lg"
              />
              <span className="text-xl font-bold">AJM International Institution</span>
            </div>
            <p className="text-slate-400 text-center md:text-right">
              © 2024 AJM International Institution. All rights reserved.<br />
              This is a demo application showcasing school management features.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
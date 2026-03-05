import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Users, BookOpen, Calendar, GraduationCap, DollarSign, Library, Bus, Building, Mail, LogOut, Menu, X,
  User, FileText, ClipboardCheck, MessageSquare, FileQuestion, Book, Award, Settings,
  CreditCard, Activity, Bell, Heart, CalendarDays, Briefcase
} from 'lucide-react';

const Layout = ({ children, user, onLogout }) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Admin navigation
  const adminNavigation = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Students', path: '/students', icon: Users },
    { name: 'Teachers', path: '/teachers', icon: GraduationCap },
    { name: 'Classes', path: '/classes', icon: BookOpen },
    { name: 'Attendance', path: '/attendance', icon: Calendar },
    { name: 'Exams', path: '/exams', icon: GraduationCap },
    { name: 'Fees', path: '/fees', icon: DollarSign },
    { name: 'Library', path: '/library', icon: Library },
    { name: 'Transport', path: '/transport', icon: Bus },
    { name: 'Hostel', path: '/hostel', icon: Building },
    { name: 'Communication', path: '/communication', icon: Mail },
  ];

  // Staff navigation - 12 modules
  const staffNavigation = [
    { name: 'Profile', path: '/staff/profile', icon: User },
    { name: 'Attendance', path: '/staff/attendance', icon: Calendar },
    { name: 'Timetable', path: '/staff/timetable', icon: BookOpen },
    { name: 'Classes', path: '/staff/classes', icon: Users },
    { name: 'Academic', path: '/staff/academic', icon: FileText },
    { name: 'Marks', path: '/staff/marks', icon: ClipboardCheck },
    { name: 'Communication', path: '/staff/communication', icon: MessageSquare },
    { name: 'Payroll', path: '/staff/payroll', icon: DollarSign },
    { name: 'Leave & Requests', path: '/staff/leave', icon: FileQuestion },
    { name: 'Documents', path: '/staff/documents', icon: Book },
    { name: 'Performance', path: '/staff/performance', icon: Award },
    { name: 'Settings', path: '/staff/settings', icon: Settings },
  ];

  // Student navigation - 12 modules
  const studentNavigation = [
    { name: 'Profile', path: '/student/profile', icon: User },
    { name: 'Attendance', path: '/student/attendance', icon: Calendar },
    { name: 'Timetable', path: '/student/timetable', icon: BookOpen },
    { name: 'Subjects', path: '/student/subjects', icon: FileText },
    { name: 'Homework', path: '/student/homework', icon: ClipboardCheck },
    { name: 'Exams', path: '/student/exams', icon: GraduationCap },
    { name: 'Communication', path: '/student/communication', icon: MessageSquare },
    { name: 'Fees', path: '/student/fees', icon: DollarSign },
    { name: 'Library', path: '/student/library', icon: Library },
    { name: 'Activities', path: '/student/activities', icon: Activity },
    { name: 'Requests', path: '/student/requests', icon: FileQuestion },
    { name: 'Settings', path: '/student/settings', icon: Settings },
  ];

  // Parent navigation - 12 modules
  const parentNavigation = [
    { name: 'Profile', path: '/parent/profile', icon: User },
    { name: 'Student Overview', path: '/parent/overview', icon: Users },
    { name: 'Attendance', path: '/parent/attendance', icon: Calendar },
    { name: 'Academic Progress', path: '/parent/academic', icon: GraduationCap },
    { name: 'Communication', path: '/parent/communication', icon: MessageSquare },
    { name: 'Fees', path: '/parent/fees', icon: DollarSign },
    { name: 'Behavior', path: '/parent/behavior', icon: Award },
    { name: 'Events', path: '/parent/events', icon: CalendarDays },
    { name: 'Requests', path: '/parent/requests', icon: FileQuestion },
    { name: 'Transport', path: '/parent/transport', icon: Bus },
    { name: 'Health', path: '/parent/health', icon: Heart },
    { name: 'Settings', path: '/parent/settings', icon: Settings },
  ];

  // Select navigation based on role
  const getNavigation = () => {
    switch(user?.role) {
      case 'admin': return adminNavigation;
      case 'staff': return staffNavigation;
      case 'student': return studentNavigation;
      case 'parent': return parentNavigation;
      default: return adminNavigation;
    }
  };

  const navigation = getNavigation();
  const showFullSidebar = true; // Now show sidebar for all roles

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showFullSidebar && (
            <button
              data-testid="mobile-menu-toggle"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}
          <h1 className="text-2xl font-semibold text-[#4F46E5]">
            {user?.role === 'admin' ? 'Admin Portal' : 
             user?.role === 'staff' ? 'Staff Portal' :
             user?.role === 'student' ? 'Student Portal' :
             user?.role === 'parent' ? 'Parent Portal' : 'School Management'}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-[#0F172A]">{user?.full_name}</p>
            <p className="text-xs text-[#64748B] capitalize">{user?.role}</p>
          </div>
          <button
            data-testid="logout-button"
            onClick={onLogout}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-[#64748B] hover:text-[#EF4444]"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <div className="flex">
        {showFullSidebar && (
          <aside
            className={`
              fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white border-r border-slate-200 p-4 flex flex-col gap-2 z-40 transition-transform duration-300
              ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}
          >
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  data-testid={`nav-${item.name.toLowerCase()}`}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-[#4F46E5] text-white' 
                      : 'text-[#64748B] hover:bg-slate-100 hover:text-[#0F172A]'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </aside>
        )}

        {showFullSidebar && isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <main className={`flex-1 p-6 md:p-8 ${showFullSidebar ? 'lg:p-12' : 'lg:p-8'}`}>
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
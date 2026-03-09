import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuth } from './context/AuthContext';
import LandingPage from './pages/Landing/LandingPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import Classes from './pages/Classes';
import Attendance from './pages/Attendance';
import Exams from './pages/Exams';
import Fees from './pages/Fees';
import Library from './pages/Library';
import Transport from './pages/Transport';
import Hostel from './pages/Hostel';
import Communication from './pages/Communication';
import Settings from './pages/Settings';
import StaffDashboard from './pages/Staff/StaffDashboard';
import StudentDashboard from './pages/Student/StudentDashboard';
import ParentDashboard from './pages/Parent/ParentDashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Substitutions from './pages/Substitutions';
import Scholarships from './pages/Scholarships';
import Payroll from './pages/Payroll';
import Layout from './components/Layout';

const getDefaultPath = (role) => {
  switch (role) {
    case 'staff': return '/staff/profile';
    case 'student': return '/student/profile';
    case 'parent': return '/parent/profile';
    default: return '/dashboard';
  }
};

function App() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!user) return <Navigate to="/login" replace />;
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return <Navigate to={getDefaultPath(user.role)} replace />;
    }
    return <Layout user={user} onLogout={logout}>{children}</Layout>;
  };

  return (
    <>
      <Toaster position="top-right" richColors />
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />

          <Route
            path="/login"
            element={user ? <Navigate to={getDefaultPath(user.role)} replace /> : <Login />}
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Admin Dashboard */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Dashboard user={user} />
            </ProtectedRoute>
          } />

          {/* Admin-only routes */}
          <Route path="/students" element={<ProtectedRoute allowedRoles={['admin']}><Students /></ProtectedRoute>} />
          <Route path="/teachers" element={<ProtectedRoute allowedRoles={['admin']}><Teachers /></ProtectedRoute>} />
          <Route path="/classes" element={<ProtectedRoute allowedRoles={['admin']}><Classes /></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute allowedRoles={['admin']}><Attendance /></ProtectedRoute>} />
          <Route path="/exams" element={<ProtectedRoute allowedRoles={['admin']}><Exams /></ProtectedRoute>} />
          <Route path="/fees" element={<ProtectedRoute allowedRoles={['admin']}><Fees /></ProtectedRoute>} />
          <Route path="/library" element={<ProtectedRoute allowedRoles={['admin']}><Library /></ProtectedRoute>} />
          <Route path="/transport" element={<ProtectedRoute allowedRoles={['admin']}><Transport /></ProtectedRoute>} />
          <Route path="/hostel" element={<ProtectedRoute allowedRoles={['admin']}><Hostel /></ProtectedRoute>} />
          <Route path="/communication" element={<ProtectedRoute allowedRoles={['admin']}><Communication /></ProtectedRoute>} />
          <Route path="/substitutions" element={<ProtectedRoute allowedRoles={['admin']}><Substitutions /></ProtectedRoute>} />
          <Route path="/scholarships" element={<ProtectedRoute allowedRoles={['admin']}><Scholarships /></ProtectedRoute>} />
          <Route path="/payroll" element={<ProtectedRoute allowedRoles={['admin']}><Payroll /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute allowedRoles={['admin']}><Settings /></ProtectedRoute>} />

          {/* Staff routes */}
          <Route path="/staff/profile" element={<ProtectedRoute allowedRoles={['staff']}><StaffDashboard user={user} module="profile" /></ProtectedRoute>} />
          <Route path="/staff/attendance" element={<ProtectedRoute allowedRoles={['staff']}><StaffDashboard user={user} module="attendance" /></ProtectedRoute>} />
          <Route path="/staff/timetable" element={<ProtectedRoute allowedRoles={['staff']}><StaffDashboard user={user} module="timetable" /></ProtectedRoute>} />
          <Route path="/staff/classes" element={<ProtectedRoute allowedRoles={['staff']}><StaffDashboard user={user} module="classes" /></ProtectedRoute>} />
          <Route path="/staff/academic" element={<ProtectedRoute allowedRoles={['staff']}><StaffDashboard user={user} module="academic" /></ProtectedRoute>} />
          <Route path="/staff/marks" element={<ProtectedRoute allowedRoles={['staff']}><StaffDashboard user={user} module="marks" /></ProtectedRoute>} />
          <Route path="/staff/communication" element={<ProtectedRoute allowedRoles={['staff']}><StaffDashboard user={user} module="communication" /></ProtectedRoute>} />
          <Route path="/staff/payroll" element={<ProtectedRoute allowedRoles={['staff']}><StaffDashboard user={user} module="payroll" /></ProtectedRoute>} />
          <Route path="/staff/documents" element={<ProtectedRoute allowedRoles={['staff']}><StaffDashboard user={user} module="documents" /></ProtectedRoute>} />
          <Route path="/staff/settings" element={<ProtectedRoute allowedRoles={['staff']}><StaffDashboard user={user} module="settings" /></ProtectedRoute>} />

          {/* Student routes */}
          <Route path="/student/profile" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard user={user} module="profile" /></ProtectedRoute>} />
          <Route path="/student/attendance" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard user={user} module="attendance" /></ProtectedRoute>} />
          <Route path="/student/timetable" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard user={user} module="timetable" /></ProtectedRoute>} />
          <Route path="/student/subjects" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard user={user} module="subjects" /></ProtectedRoute>} />
          <Route path="/student/homework" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard user={user} module="homework" /></ProtectedRoute>} />
          <Route path="/student/exams" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard user={user} module="exams" /></ProtectedRoute>} />
          <Route path="/student/communication" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard user={user} module="communication" /></ProtectedRoute>} />
          <Route path="/student/fees" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard user={user} module="fees" /></ProtectedRoute>} />
          <Route path="/student/library" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard user={user} module="library" /></ProtectedRoute>} />
          <Route path="/student/activities" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard user={user} module="activities" /></ProtectedRoute>} />
          <Route path="/student/requests" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard user={user} module="requests" /></ProtectedRoute>} />
          <Route path="/student/settings" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard user={user} module="settings" /></ProtectedRoute>} />

          {/* Parent routes */}
          <Route path="/parent/profile" element={<ProtectedRoute allowedRoles={['parent']}><ParentDashboard user={user} module="profile" /></ProtectedRoute>} />
          <Route path="/parent/overview" element={<ProtectedRoute allowedRoles={['parent']}><ParentDashboard user={user} module="overview" /></ProtectedRoute>} />
          <Route path="/parent/attendance" element={<ProtectedRoute allowedRoles={['parent']}><ParentDashboard user={user} module="attendance" /></ProtectedRoute>} />
          <Route path="/parent/academic" element={<ProtectedRoute allowedRoles={['parent']}><ParentDashboard user={user} module="academic" /></ProtectedRoute>} />
          <Route path="/parent/communication" element={<ProtectedRoute allowedRoles={['parent']}><ParentDashboard user={user} module="communication" /></ProtectedRoute>} />
          <Route path="/parent/fees" element={<ProtectedRoute allowedRoles={['parent']}><ParentDashboard user={user} module="fees" /></ProtectedRoute>} />
          <Route path="/parent/behavior" element={<ProtectedRoute allowedRoles={['parent']}><ParentDashboard user={user} module="behavior" /></ProtectedRoute>} />
          <Route path="/parent/events" element={<ProtectedRoute allowedRoles={['parent']}><ParentDashboard user={user} module="events" /></ProtectedRoute>} />
          <Route path="/parent/requests" element={<ProtectedRoute allowedRoles={['parent']}><ParentDashboard user={user} module="requests" /></ProtectedRoute>} />
          <Route path="/parent/transport" element={<ProtectedRoute allowedRoles={['parent']}><ParentDashboard user={user} module="transport" /></ProtectedRoute>} />
          <Route path="/parent/health" element={<ProtectedRoute allowedRoles={['parent']}><ParentDashboard user={user} module="health" /></ProtectedRoute>} />
          <Route path="/parent/settings" element={<ProtectedRoute allowedRoles={['parent']}><ParentDashboard user={user} module="settings" /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to={user ? getDefaultPath(user.role) : '/login'} replace />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;

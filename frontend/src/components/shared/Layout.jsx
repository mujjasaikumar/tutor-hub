import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { 
  GraduationCap, 
  LogOut, 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  CreditCard, 
  Calendar, 
  FileText,
  Menu,
  X,
  UserCircle
} from 'lucide-react';

export default function Layout({ children, role }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const adminLinks = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/batches', label: 'Batches', icon: BookOpen },
    { path: '/admin/tutors', label: 'Tutors', icon: Users },
    { path: '/admin/students', label: 'Students', icon: Users },
    { path: '/admin/schedule', label: 'Schedule', icon: Calendar },
    { path: '/admin/payments', label: 'Payments', icon: CreditCard },
    { path: '/admin/enquiries', label: 'Enquiries', icon: Users },
    { path: '/admin/invites', label: 'Invites', icon: Users },
    { path: '/admin/profile', label: 'Profile', icon: UserCircle },
  ];

  const tutorLinks = [
    { path: '/tutor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/tutor/classes', label: 'Classes', icon: Calendar },
    { path: '/tutor/materials', label: 'Materials', icon: FileText },
    { path: '/tutor/profile', label: 'Profile', icon: UserCircle },
  ];

  const studentLinks = [
    { path: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/student/classes', label: 'Classes', icon: Calendar },
    { path: '/student/materials', label: 'Materials', icon: FileText },
    { path: '/student/homework', label: 'Homework', icon: BookOpen },
    { path: '/student/profile', label: 'Profile', icon: UserCircle },
  ];

  const links = role === 'admin' ? adminLinks : role === 'tutor' ? tutorLinks : studentLinks;

  return (
    <div className="min-h-screen flex" data-testid="layout-container">
      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
        aria-label="Toggle menu"
      >
        {isSidebarOpen ? (
          <X className="w-6 h-6 text-gray-600" />
        ) : (
          <Menu className="w-6 h-6 text-gray-600" />
        )}
      </button>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-white border-r border-gray-200 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="p-6 border-b border-gray-200">
          <Link to="/" className="flex items-center gap-2" data-testid="logo-link" onClick={closeSidebar}>
            <div className="bg-indigo-100 p-2 rounded-lg">
              <GraduationCap className="w-6 h-6 text-indigo-600" />
            </div>
            <span className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              TutorHub
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                data-testid={`nav-link-${link.label.toLowerCase()}`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-900 truncate" data-testid="user-name">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize" data-testid="user-role">{user?.role}</p>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={handleLogout}
            data-testid="logout-button"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-50 w-full lg:w-auto">
        <div className="p-4 sm:p-6 lg:p-8 mt-16 lg:mt-0">{children}</div>
      </main>
    </div>
  );
}

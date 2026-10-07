import React from 'react';
import {
  LayoutDashboard,
  User,
  BookOpen,
  GraduationCap,
  Calculator,
  Award,
  CalendarCheck,
  TrendingUp,
  History,
  Bell,
  Sliders,
  LogOut,
  Users,
  X,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, onClose }) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const isStudent = user.role === 'student';

  const studentMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'marks', label: 'Marks & Grades', icon: GraduationCap },
    { id: 'sgpa-calc', label: 'SGPA Calculator', icon: Calculator },
    { id: 'cgpa-calc', label: 'CGPA Calculator', icon: Award },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
    { id: 'history', label: 'Semester History', icon: History },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'report', label: 'Print Academic Report', icon: FileText },
  ];

  const adminMenuItems = [
    { id: 'admin-dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
    { id: 'admin-students', label: 'Students Directory', icon: Users },
    { id: 'admin-subjects', label: 'Subjects Master', icon: BookOpen },
    { id: 'admin-marks', label: 'Marks Management', icon: GraduationCap },
    { id: 'admin-attendance', label: 'Attendance Monitor', icon: CalendarCheck },
    { id: 'admin-performance', label: 'Academic Analytics', icon: TrendingUp },
    { id: 'admin-rules', label: 'Grading Rules', icon: Sliders },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const menuItems = isStudent ? studentMenuItems : adminMenuItems;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 overflow-y-auto">
          {/* Header Mobile Close */}
          <div className="flex items-center justify-between pb-4 mb-2 border-b border-slate-100 dark:border-slate-800 lg:hidden">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg gradient-bg-primary flex items-center justify-center text-white font-black text-sm">
                CMR
              </div>
              <span className="font-bold text-slate-800 dark:text-white text-sm">CMR Portal</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Badge Info Card */}
          <div className="mb-6 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl gradient-bg-primary flex items-center justify-center text-white font-bold text-sm shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                {isStudent ? user.studentId || user.department : 'System Administrator'}
              </p>
            </div>
          </div>

          {/* Navigation Category Label */}
          <div className="px-3 mb-2">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {isStudent ? 'Student Navigation' : 'Admin Operations'}
            </p>
          </div>

          {/* Nav Items List */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all ${
                    isActive
                      ? 'gradient-bg-primary text-white font-semibold shadow-md shadow-sky-500/25'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Logout Button */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

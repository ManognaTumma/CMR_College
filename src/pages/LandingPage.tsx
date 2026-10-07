import React from 'react';
import {
  UserCheck,
  Calculator,
  Award,
  BookOpen,
  TrendingUp,
  CalendarCheck,
  History,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LandingPageProps {
  onNavigate: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { login } = useAuth();

  const handleDemoStudentLogin = async () => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: '217R1A0501', password: 'student123' }),
      });
      const data = await res.json();
      if (data.success) {
        login(data.token, data.user);
        onNavigate('dashboard');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDemoAdminLogin = async () => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: 'admin@cmr.edu.in', password: 'admin123' }),
      });
      const data = await res.json();
      if (data.success) {
        login(data.token, data.user);
        onNavigate('admin-dashboard');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const features = [
    {
      icon: UserCheck,
      title: 'Student Information',
      desc: 'Centralized student profile management with academic branch, department, and contact info.',
      color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
    },
    {
      icon: Calculator,
      title: 'SGPA Calculator',
      desc: 'Instant semester grade point calculation using official CMR Technical Campus credit weights.',
      color: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400',
    },
    {
      icon: Award,
      title: 'CGPA Calculator',
      desc: 'Multi-semester cumulative grade point average calculation with trend analytics.',
      color: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400',
    },
    {
      icon: BookOpen,
      title: 'Grade Management',
      desc: 'Configurable grading rules matrix (O, A+, A, B+, B, C, F) mapped to internal & external marks.',
      color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
    },
    {
      icon: TrendingUp,
      title: 'Academic Performance',
      desc: 'Visual analytics with line graphs, subject performance bar charts, and grade donuts.',
      color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400',
    },
    {
      icon: CalendarCheck,
      title: 'Attendance Tracking',
      desc: 'Real-time subject attendance percentages with bunk safety calculators and warning badges.',
      color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
    },
    {
      icon: History,
      title: 'Semester History',
      desc: 'Complete semester-wise archives, credit totals, pass/fail counts, and marks inspection.',
      color: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400',
    },
    {
      icon: ShieldCheck,
      title: 'Secure Student Login',
      desc: 'Role-based authorization with bcrypt password hashing and session tokens.',
      color: 'bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-400/20 dark:bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-72 h-72 bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-sky-100 dark:bg-sky-950 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 text-xs font-semibold shadow-xs">
            <Sparkles className="w-4 h-4 text-sky-500 animate-spin" />
            <span>CMR Technical Campus – Student Academic Information System</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            CMR Student <span className="gradient-text">Academic Portal</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed">
            Manage your academic information, calculate your SGPA & CGPA, and track your academic performance in one place.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onNavigate('login')}
              className="px-6 py-3.5 rounded-2xl text-sm font-bold text-white gradient-bg-primary shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:scale-105 transition-all flex items-center space-x-2"
            >
              <span>Student Login</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('register')}
              className="px-6 py-3.5 rounded-2xl text-sm font-bold text-slate-800 dark:text-white bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105 transition-all shadow-sm"
            >
              Create Account
            </button>
          </div>

          {/* Quick Demo Presets Banner */}
          <div className="pt-6 flex items-center justify-center space-x-3 text-xs text-slate-500">
            <span className="font-semibold text-slate-600 dark:text-slate-400">⚡ One-Click Demo Mode:</span>
            <button
              onClick={handleDemoStudentLogin}
              className="px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold border border-sky-200 dark:border-sky-800 hover:bg-sky-100 transition-colors"
            >
              Login as Student (Rahul Sharma)
            </button>
            <button
              onClick={handleDemoAdminLogin}
              className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800 hover:bg-purple-100 transition-colors"
            >
              Login as Admin (HOD)
            </button>
          </div>
        </div>

        {/* Dashboard Preview Visual */}
        <div className="mt-14 relative max-w-5xl mx-auto">
          <div className="p-3 rounded-3xl bg-slate-900/5 dark:bg-white/5 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-2xl">
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs font-mono text-slate-400 pl-2">portal.cmr.edu.in/dashboard</span>
                </div>
                <div className="flex items-center space-x-2 text-xs font-semibold text-sky-600">
                  <GraduationCap className="w-4 h-4" />
                  <span>Current SGPA: 8.81 | CGPA: 8.78</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/40">
                  <p className="text-xs text-slate-500">Student ID</p>
                  <p className="text-xl font-bold text-sky-900 dark:text-sky-300 font-mono">217R1A0501</p>
                </div>
                <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40">
                  <p className="text-xs text-slate-500">Current Semester</p>
                  <p className="text-xl font-bold text-purple-900 dark:text-purple-300">Semester 5 (CSE)</p>
                </div>
                <div className="p-4 rounded-2xl bg-cyan-50/70 dark:bg-cyan-950/30 border border-cyan-100 dark:border-cyan-900/40">
                  <p className="text-xs text-slate-500">Overall Attendance</p>
                  <p className="text-xl font-bold text-cyan-900 dark:text-cyan-300">87.4% (Good)</p>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                  <p className="text-xs text-slate-500">Total Completed Credits</p>
                  <p className="text-xl font-bold text-emerald-900 dark:text-emerald-300">75 Credits</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200/60 dark:border-slate-800">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Everything You Need for Academic Success
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Engineered specifically for CMR Technical Campus students to simplify academic tracking.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="py-8 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
        <p>© 2026 CMR Technical Campus. UGC Autonomous Institution, Hyderabad. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

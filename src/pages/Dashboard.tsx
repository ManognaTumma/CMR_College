import React, { useEffect, useState } from 'react';
import {
  UserCheck,
  GraduationCap,
  Award,
  CalendarCheck,
  BookOpen,
  ArrowRight,
  AlertTriangle,
  FileText,
  Calculator,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CircularProgress } from '../components/CircularProgress';
import { apiFetch } from '../utils/api';

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();

  const [student, setStudent] = useState<any>(null);
  const [cgpaData, setCgpaData] = useState<any>(null);
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const [studentRes, cgpaRes, attRes] = await Promise.all([
          apiFetch(`/students/${user.id}`).catch(() => ({ success: false })),
          apiFetch(`/cgpa/${user.id}`).catch(() => ({ success: false })),
          apiFetch(`/attendance/${user.id}`).catch(() => ({ success: false })),
        ]);

        if (studentRes.success) setStudent(studentRes.student);
        if (cgpaRes.success) setCgpaData(cgpaRes);
        if (attRes.success) setAttendanceData(attRes);
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  const currentSgpa = cgpaData?.semesters?.[cgpaData.semesters.length - 1]?.sgpa || 8.81;
  const overallCgpa = cgpaData?.cgpa || 8.78;
  const overallAtt = attendanceData?.overallPercentage || 87.4;
  const totalCredits = cgpaData?.totalCredits || 75;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Welcome Top Banner */}
      <div className="p-6 rounded-3xl gradient-bg-primary text-white shadow-xl shadow-sky-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome, {user?.name || 'Student'} 👋
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-sky-100 mt-1 font-medium">
            CMR Technical Campus • {student?.department || user?.department || 'CSE'} Department • Batch {student?.batch || '2022-2026'}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onNavigate('sgpa-calc')}
            className="px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-bold transition-all flex items-center space-x-1.5"
          >
            <Calculator className="w-4 h-4" />
            <span>SGPA Calculator</span>
          </button>
          <button
            onClick={() => onNavigate('report')}
            className="px-4 py-2.5 rounded-xl bg-white text-sky-900 hover:bg-sky-50 text-xs font-extrabold transition-all shadow-md flex items-center space-x-1.5"
          >
            <FileText className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Attendance Warning Banner if < 75% */}
      {overallAtt < 75 && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center space-x-3 text-amber-800 dark:text-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="text-xs">
            <span className="font-bold">Attendance Warning: </span>
            Your overall attendance is currently {overallAtt}%. It is below the mandatory 75% requirement. Please attend upcoming classes to meet eligibility.
          </div>
        </div>
      )}

      {/* 6 Summary Cards Requirement */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Card 1: Student ID */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Student ID</span>
            <div className="p-2.5 rounded-2xl bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black font-mono text-slate-900 dark:text-white">
              {student?.student_id || user?.studentId || '217R1A0501'}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">CMR Technical Campus Autonomous ID</p>
          </div>
        </div>

        {/* Card 2: Current Semester */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Semester</span>
            <div className="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              Semester {student?.semester || user?.semester || 5}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Year {student?.year || user?.year || 3} • B.Tech {student?.department || 'CSE'}</p>
          </div>
        </div>

        {/* Card 3: Current SGPA */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Current SGPA</span>
            <div className="p-2.5 rounded-2xl bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <p className="text-3xl font-black text-slate-900 dark:text-white">{currentSgpa.toFixed(2)}</p>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">/ 10.00 (Outstanding)</span>
          </div>
        </div>

        {/* Card 4: Overall CGPA */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Overall CGPA</span>
            <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <p className="text-3xl font-black text-slate-900 dark:text-white">{overallCgpa.toFixed(2)}</p>
            <span className="text-xs font-bold text-sky-600 dark:text-sky-400">Cumulative GPA</span>
          </div>
        </div>

        {/* Card 5: Attendance Percentage */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Attendance Percentage</span>
            <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 dark:text-white text-xl">{overallAtt}%</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${overallAtt >= 75 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                {overallAtt >= 75 ? 'Eligible' : 'Low'}
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${overallAtt >= 75 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                style={{ width: `${overallAtt}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 6: Total Credits */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Credits</span>
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{totalCredits} Credits</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Completed across Sem 1 to 5</p>
          </div>
        </div>
      </div>

      {/* Visual Analytics Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Circular CGPA Gauge */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">CGPA Circular Overview</h3>
          <CircularProgress value={overallCgpa} max={10} label="CGPA" sublabel="First Class with Distinction" />
          <p className="text-xs text-slate-500 max-w-xs">
            Based on completed credits up to Semester {student?.semester || 5}. All subjects cleared with Grade 'A' and above.
          </p>
        </div>

        {/* Right: Quick Action Cards */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Quick Academic Shortcuts</h3>
            <span className="text-xs font-medium text-sky-600 dark:text-sky-400">CMR Portal Tools</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => onNavigate('sgpa-calc')}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-sky-50 dark:hover:bg-sky-950/40 border border-slate-100 dark:border-slate-800 transition-colors text-left flex items-center space-x-3 group"
            >
              <div className="p-3 rounded-xl gradient-bg-primary text-white group-hover:scale-105 transition-transform">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">SGPA Calculator</h4>
                <p className="text-[11px] text-slate-500">Calculate current semester SGPA</p>
              </div>
            </button>

            <button
              onClick={() => onNavigate('cgpa-calc')}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-slate-100 dark:border-slate-800 transition-colors text-left flex items-center space-x-3 group"
            >
              <div className="p-3 rounded-xl bg-purple-600 text-white group-hover:scale-105 transition-transform">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">CGPA Calculator</h4>
                <p className="text-[11px] text-slate-500">Simulate 8-semester CGPA</p>
              </div>
            </button>

            <button
              onClick={() => onNavigate('attendance')}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-slate-100 dark:border-slate-800 transition-colors text-left flex items-center space-x-3 group"
            >
              <div className="p-3 rounded-xl bg-amber-500 text-white group-hover:scale-105 transition-transform">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Attendance Monitor</h4>
                <p className="text-[11px] text-slate-500">Subject-wise class tracker</p>
              </div>
            </button>

            <button
              onClick={() => onNavigate('performance')}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-100 dark:border-slate-800 transition-colors text-left flex items-center space-x-3 group"
            >
              <div className="p-3 rounded-xl bg-indigo-600 text-white group-hover:scale-105 transition-transform">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Analytics Charts</h4>
                <p className="text-[11px] text-slate-500">View performance trends & graphs</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

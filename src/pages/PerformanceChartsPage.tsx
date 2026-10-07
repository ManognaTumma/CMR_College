import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, BarChart2, PieChart as PieIcon, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';

export const PerformanceChartsPage: React.FC = () => {
  const { user } = useAuth();

  const [sgpaTrend, setSgpaTrend] = useState<any[]>([]);
  const [subjectMarksData, setSubjectMarksData] = useState<any[]>([]);
  const [gradePieData, setGradePieData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#10b981', '#0284c7', '#8b5cf6', '#f59e0b', '#ec4899', '#3b82f6', '#ef4444'];

  const loadChartData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [sgpaRes, subRes] = await Promise.all([
        apiFetch(`/sgpa/${user.id}`).catch(() => ({ success: false })),
        apiFetch(`/subjects?studentId=${user.id}&semester=5`).catch(() => ({ success: false })),
      ]);

      if (sgpaRes.success && Array.isArray(sgpaRes.semesters)) {
        const lineData = sgpaRes.semesters.map((s: any) => ({
          name: `Sem ${s.semester_number}`,
          SGPA: s.sgpa,
          Credits: s.total_credits,
        }));
        setSgpaTrend(lineData);
      }

      if (subRes.success && Array.isArray(subRes.subjects)) {
        const barData = subRes.subjects.map((s: any) => ({
          name: s.subject_code,
          Internal: s.internal_marks || 0,
          External: s.external_marks || 0,
          Total: s.total_marks || 0,
        }));
        setSubjectMarksData(barData);

        // Grade distribution count
        const counts: Record<string, number> = {};
        subRes.subjects.forEach((s: any) => {
          const g = s.grade || 'A+';
          counts[g] = (counts[g] || 0) + 1;
        });

        const pie = Object.keys(counts).map((g) => ({
          name: `Grade ${g}`,
          value: counts[g],
        }));
        setGradePieData(pie);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChartData();
  }, [user]);

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading performance analytics...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Academic Performance Analytics</h1>
        <p className="text-xs text-slate-500">
          Visual SGPA trajectories, subject marks distribution, and grade donut analytics
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: SGPA Trajectory Line Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <TrendingUp className="w-5 h-5 text-sky-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">SGPA Progression Across Semesters</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sgpaTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis domain={[0, 10]} stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="SGPA"
                  stroke="#0284c7"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#0284c7' }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Subject Marks Bar Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <BarChart2 className="w-5 h-5 text-purple-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Internal vs External Subject Marks</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectMarksData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend />
                <Bar dataKey="Internal" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="External" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Grade Distribution Donut Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <PieIcon className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Semester Grade Distribution</h3>
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gradePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {gradePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Academic Summary Banner */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-center">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Academic Standing Insights</h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Your SGPA has consistently maintained an average above <span className="font-bold text-sky-600">8.70</span> over 5 semesters. You are currently placed in the <span className="font-bold text-emerald-600">Top 5%</span> of the Computer Science & Engineering department.
          </p>
          <div className="p-4 rounded-2xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/40 text-xs">
            <span className="font-extrabold text-sky-800 dark:text-sky-300">Degree Classification Forecast:</span>
            <p className="text-slate-600 dark:text-slate-400 mt-1">First Class with Distinction (CGPA &gt; 8.0)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

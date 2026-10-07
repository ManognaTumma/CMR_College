import React, { useState, useEffect } from 'react';
import { Award, TrendingUp, RefreshCw, Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CircularProgress } from '../components/CircularProgress';
import { apiFetch } from '../utils/api';

interface SemesterRow {
  semNumber: number;
  sgpa: number;
  credits: number;
}

export const CGPACalculator: React.FC = () => {
  const { user } = useAuth();

  const [semesters, setSemesters] = useState<SemesterRow[]>([
    { semNumber: 1, sgpa: 8.73, credits: 15 },
    { semNumber: 2, sgpa: 8.73, credits: 15 },
    { semNumber: 3, sgpa: 9.27, credits: 15 },
    { semNumber: 4, sgpa: 8.79, credits: 14 },
    { semNumber: 5, sgpa: 8.81, credits: 16 },
    { semNumber: 6, sgpa: 0.0, credits: 15 },
    { semNumber: 7, sgpa: 0.0, credits: 15 },
    { semNumber: 8, sgpa: 0.0, credits: 15 },
  ]);

  const [loading, setLoading] = useState(false);

  const fetchDbSemesters = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await apiFetch(`/sgpa/${user.id}`);
      if (res.success && Array.isArray(res.semesters)) {
        const updated = [...semesters];
        res.semesters.forEach((s: any) => {
          const idx = s.semester_number - 1;
          if (idx >= 0 && idx < 8) {
            updated[idx] = {
              semNumber: s.semester_number,
              sgpa: s.sgpa || 0,
              credits: s.total_credits || 15,
            };
          }
        });
        setSemesters(updated);
      }
    } catch (err) {
      console.error('Error fetching semester history for CGPA:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDbSemesters();
  }, [user]);

  const handleSgpaChange = (semNum: number, value: number) => {
    setSemesters((prev) =>
      prev.map((s) => (s.semNumber === semNum ? { ...s, sgpa: value } : s))
    );
  };

  const handleCreditChange = (semNum: number, value: number) => {
    setSemesters((prev) =>
      prev.map((s) => (s.semNumber === semNum ? { ...s, credits: value } : s))
    );
  };

  // Perform CGPA Calculation
  const activeSemesters = semesters.filter((s) => s.sgpa > 0);

  let totalWeightedSgpa = 0;
  let totalCredits = 0;
  let highestSgpa = 0;
  let lowestSgpa = 10;
  let sgpaSum = 0;

  activeSemesters.forEach((s) => {
    totalWeightedSgpa += s.sgpa * s.credits;
    totalCredits += s.credits;
    sgpaSum += s.sgpa;

    if (s.sgpa > highestSgpa) highestSgpa = s.sgpa;
    if (s.sgpa < lowestSgpa) lowestSgpa = s.sgpa;
  });

  const cgpa = totalCredits > 0 ? Math.round((totalWeightedSgpa / totalCredits) * 100) / 100 : 0;
  const averageSgpa = activeSemesters.length > 0 ? Math.round((sgpaSum / activeSemesters.length) * 100) / 100 : 0;

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">CGPA Cumulative Calculator</h1>
          <p className="text-xs text-slate-500">
            Multi-semester Cumulative Grade Point Average calculation for Semesters 1 to 8
          </p>
        </div>

        <button
          onClick={fetchDbSemesters}
          className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors flex items-center space-x-1.5 self-start"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reload Database SGPAs</span>
        </button>
      </div>

      {/* Metrics Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Highest SGPA</p>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{highestSgpa.toFixed(2)}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Lowest SGPA</p>
          <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">{lowestSgpa === 10 ? '0.00' : lowestSgpa.toFixed(2)}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Average SGPA</p>
          <p className="text-xl font-black text-sky-600 dark:text-sky-400 mt-1">{averageSgpa.toFixed(2)}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Total Credits</p>
          <p className="text-xl font-black text-purple-600 dark:text-purple-400 mt-1">{totalCredits}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center col-span-2 sm:col-span-1">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Completed Semesters</p>
          <p className="text-xl font-black text-slate-800 dark:text-slate-200 mt-1">{activeSemesters.length} / 8</p>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* All 8 Semesters Inputs Grid */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
            Semester 1 to Semester 8 Breakdown
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {semesters.map((s) => (
              <div
                key={s.semNumber}
                className={`p-4 rounded-2xl border transition-all ${
                  s.sgpa > 0
                    ? 'bg-sky-50/40 dark:bg-sky-950/20 border-sky-200 dark:border-sky-800'
                    : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200">
                    Semester {s.semNumber}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {s.sgpa > 0 ? 'Completed' : 'Pending'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">SGPA</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      value={s.sgpa || ''}
                      onChange={(e) => handleSgpaChange(s.semNumber, parseFloat(e.target.value) || 0)}
                      placeholder="e.g. 8.5"
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Credits</label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={s.credits}
                      onChange={(e) => handleCreditChange(s.semNumber, parseInt(e.target.value, 10) || 15)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Overall CGPA Result Gauge */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Cumulative CGPA Result</h3>
            <CircularProgress value={cgpa} max={10} label="CGPA" sublabel="Overall Academic Performance" />

            <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 text-left text-xs space-y-1.5">
              <p className="font-bold text-purple-900 dark:text-purple-300">CGPA Calculation Method:</p>
              <p className="font-mono text-slate-600 dark:text-slate-400 text-[11px]">
                CGPA = Σ(Semester SGPA × Semester Credits) / Σ(Total Credits)
              </p>
              <p className="font-semibold text-slate-800 dark:text-slate-200 pt-1">
                Calculated: {totalWeightedSgpa.toFixed(2)} / {totalCredits} = <span className="font-black text-purple-600">{cgpa}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

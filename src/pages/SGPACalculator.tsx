import React, { useState } from 'react';
import { Calculator, Plus, Trash2, Save, Sparkles, CheckCircle, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { CircularProgress } from '../components/CircularProgress';
import { apiFetch } from '../utils/api';

interface SubjectRow {
  id: string;
  name: string;
  code: string;
  credits: number;
  internalMarks: number;
  externalMarks: number;
}

export const SGPACalculator: React.FC = () => {
  const { user } = useAuth();

  const [semesterNumber, setSemesterNumber] = useState<number>(5);
  const [subjects, setSubjects] = useState<SubjectRow[]>([
    { id: '1', name: 'Computer Networks', code: 'CS501', credits: 4, internalMarks: 26, externalMarks: 62 },
    { id: '2', name: 'Web Technologies (React & Node)', code: 'CS502', credits: 4, internalMarks: 29, externalMarks: 66 },
    { id: '3', name: 'Artificial Intelligence', code: 'CS503', credits: 3, internalMarks: 23, externalMarks: 52 },
    { id: '4', name: 'Cloud Computing & DevOps', code: 'CS504', credits: 3, internalMarks: 20, externalMarks: 48 },
    { id: '5', name: 'Full Stack Development Lab', code: 'CS505', credits: 2, internalMarks: 28, externalMarks: 67 },
  ]);

  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);

  // Derive Grade and Grade Point dynamically
  const calculateGradeDetails = (total: number) => {
    if (total >= 90) return { grade: 'O', gp: 10.0 };
    if (total >= 80) return { grade: 'A+', gp: 9.0 };
    if (total >= 70) return { grade: 'A', gp: 8.0 };
    if (total >= 60) return { grade: 'B+', gp: 7.0 };
    if (total >= 50) return { grade: 'B', gp: 6.0 };
    if (total >= 40) return { grade: 'C', gp: 5.0 };
    return { grade: 'F', gp: 0.0 };
  };

  // Perform SGPA calculation
  let totalWeightedPoints = 0;
  let totalCredits = 0;
  let passedCount = 0;
  let failedCount = 0;

  const subjectCalculations = subjects.map((sub) => {
    const totalMarks = (sub.internalMarks || 0) + (sub.externalMarks || 0);
    const { grade, gp } = calculateGradeDetails(totalMarks);
    const weighted = sub.credits * gp;

    totalWeightedPoints += weighted;
    totalCredits += sub.credits;

    if (gp >= 5.0) passedCount++;
    else failedCount++;

    return {
      ...sub,
      totalMarks,
      grade,
      gp,
      weighted,
    };
  });

  const sgpa = totalCredits > 0 ? Math.round((totalWeightedPoints / totalCredits) * 100) / 100 : 0;

  const handleAddRow = () => {
    setSubjects((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: `Subject ${prev.length + 1}`,
        code: `CS50${prev.length + 1}`,
        credits: 3,
        internalMarks: 25,
        externalMarks: 55,
      },
    ]);
  };

  const handleRemoveRow = (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  };

  const handleChange = (id: string, field: keyof SubjectRow, value: any) => {
    setSubjects((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const handleSaveSgpa = async () => {
    if (!user) return;
    try {
      const res = await apiFetch('/sgpa/save', {
        method: 'POST',
        body: JSON.stringify({
          studentId: user.id,
          semesterNumber,
          sgpa,
          totalCredits,
          passedSubjects: passedCount,
          failedSubjects: failedCount,
          attendancePercentage: 87.5,
        }),
      });

      if (res.success) {
        setSavedSuccess(`Semester ${semesterNumber} SGPA (${sgpa}) saved to database!`);
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        setTimeout(() => setSavedSuccess(null), 4000);
      }
    } catch (err: any) {
      alert(err.message || 'Error saving SGPA.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">SGPA Grade Point Calculator</h1>
          <p className="text-xs text-slate-500">
            Automated Credit Weight × Grade Point SGPA computation engine for CMR Technical Campus
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
            <span className="font-bold text-slate-500">Target Semester:</span>
            <select
              value={semesterNumber}
              onChange={(e) => setSemesterNumber(parseInt(e.target.value, 10))}
              className="font-bold text-sky-600 bg-transparent focus:outline-none"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSaveSgpa}
            className="px-4 py-2.5 rounded-xl gradient-bg-primary text-white font-bold text-xs shadow-md shadow-sky-500/20 hover:opacity-95 transition-all flex items-center space-x-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Save Result to Record</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-500" />
          <span>{savedSuccess}</span>
        </div>
      )}

      {/* Main Grid: Calculator Inputs + Animated Circular Result Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Subject Input Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Semester Subject Entries</h3>
              <button
                onClick={handleAddRow}
                className="px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 font-bold text-xs border border-sky-200 dark:border-sky-800 hover:bg-sky-100 transition-colors flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Row</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-extrabold uppercase">
                    <th className="pb-2">Code / Title</th>
                    <th className="pb-2 text-center">Credits</th>
                    <th className="pb-2 text-center">Int (30)</th>
                    <th className="pb-2 text-center">Ext (70)</th>
                    <th className="pb-2 text-center">Total</th>
                    <th className="pb-2 text-center">Grade</th>
                    <th className="pb-2 text-center">GP</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {subjectCalculations.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{sub.code}</div>
                        <input
                          type="text"
                          value={sub.name}
                          onChange={(e) => handleChange(sub.id, 'name', e.target.value)}
                          className="w-full bg-transparent text-[11px] text-slate-500 focus:outline-none border-b border-dashed border-slate-300 dark:border-slate-700"
                        />
                      </td>
                      <td className="py-2.5 text-center">
                        <input
                          type="number"
                          min="1"
                          max="6"
                          value={sub.credits}
                          onChange={(e) => handleChange(sub.id, 'credits', parseInt(e.target.value, 10) || 1)}
                          className="w-12 text-center px-1 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
                        />
                      </td>
                      <td className="py-2.5 text-center">
                        <input
                          type="number"
                          min="0"
                          max="30"
                          value={sub.internalMarks}
                          onChange={(e) => handleChange(sub.id, 'internalMarks', parseInt(e.target.value, 10) || 0)}
                          className="w-14 text-center px-1 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
                        />
                      </td>
                      <td className="py-2.5 text-center">
                        <input
                          type="number"
                          min="0"
                          max="70"
                          value={sub.externalMarks}
                          onChange={(e) => handleChange(sub.id, 'externalMarks', parseInt(e.target.value, 10) || 0)}
                          className="w-14 text-center px-1 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
                        />
                      </td>
                      <td className="py-2.5 text-center font-extrabold text-slate-900 dark:text-white">
                        {sub.totalMarks}
                      </td>
                      <td className="py-2.5 text-center">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold text-[11px]">
                          {sub.grade}
                        </span>
                      </td>
                      <td className="py-2.5 text-center font-bold text-sky-600 dark:text-sky-400">
                        {sub.gp}
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={() => handleRemoveRow(sub.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: Large Circular SGPA Result Meter */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Semester {semesterNumber} SGPA Result</h3>
            <CircularProgress value={sgpa} max={10} label="SGPA" sublabel={`${passedCount} Passed, ${failedCount} Failed`} />

            <div className="p-4 rounded-2xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/40 text-left text-xs space-y-1.5">
              <p className="font-bold text-sky-900 dark:text-sky-300">Official SGPA Formula:</p>
              <p className="font-mono text-slate-600 dark:text-slate-400 text-[11px]">
                SGPA = Σ(Credit × Grade Point) / Σ(Credits)
              </p>
              <p className="font-semibold text-slate-800 dark:text-slate-200 pt-1">
                Calculated: {totalWeightedPoints.toFixed(2)} / {totalCredits} = <span className="font-black text-sky-600">{sgpa}</span>
              </p>
            </div>
          </div>

          {/* Configurable Grading Rules Reference Matrix */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">University Grading Scale Matrix</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between">
                <span className="font-bold">O (90-100)</span>
                <span className="text-sky-600 font-bold">10.0 GP</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between">
                <span className="font-bold">A+ (80-89)</span>
                <span className="text-sky-600 font-bold">9.0 GP</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between">
                <span className="font-bold">A (70-79)</span>
                <span className="text-sky-600 font-bold">8.0 GP</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between">
                <span className="font-bold">B+ (60-69)</span>
                <span className="text-sky-600 font-bold">7.0 GP</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between">
                <span className="font-bold">B (50-59)</span>
                <span className="text-sky-600 font-bold">6.0 GP</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between">
                <span className="font-bold">C (40-49)</span>
                <span className="text-sky-600 font-bold">5.0 GP</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

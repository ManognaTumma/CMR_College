import React, { useState, useEffect } from 'react';
import { CalendarCheck, AlertTriangle, CheckCircle2, XCircle, Info, Edit3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CircularProgress } from '../components/CircularProgress';
import { apiFetch } from '../utils/api';
import { StudentSubjectMark } from '../types';
import { Modal } from '../components/Modal';

export const AttendancePage: React.FC = () => {
  const { user } = useAuth();

  const [records, setRecords] = useState<StudentSubjectMark[]>([]);
  const [overallAtt, setOverallAtt] = useState<number>(87.4);
  const [totalConducted, setTotalConducted] = useState<number>(182);
  const [totalAttended, setTotalAttended] = useState<number>(159);
  const [loading, setLoading] = useState(true);

  // Edit attendance modal
  const [editingRecord, setEditingRecord] = useState<StudentSubjectMark | null>(null);
  const [conductedInput, setConductedInput] = useState<number>(40);
  const [attendedInput, setAttendedInput] = useState<number>(35);

  const fetchAttendance = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await apiFetch(`/attendance/${user.id}`);
      if (res.success) {
        setRecords(res.records || []);
        setOverallAtt(res.overallPercentage || 87.4);
        setTotalConducted(res.totalConducted || 182);
        setTotalAttended(res.totalAttended || 159);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [user]);

  const handleUpdateAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    if (attendedInput > conductedInput) {
      alert('Attended classes cannot exceed conducted classes.');
      return;
    }

    try {
      await apiFetch(`/attendance/${editingRecord.student_subject_id || editingRecord.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          classesConducted: conductedInput,
          classesAttended: attendedInput,
        }),
      });

      setEditingRecord(null);
      fetchAttendance();
    } catch (err: any) {
      alert(err.message || 'Failed to update attendance.');
    }
  };

  const getStatusBadge = (pct: number) => {
    if (pct >= 75) {
      return (
        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[11px] flex items-center space-x-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Good Attendance</span>
        </span>
      );
    } else if (pct >= 65) {
      return (
        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold text-[11px] flex items-center space-x-1">
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          <span>Warning (65-74%)</span>
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold text-[11px] flex items-center space-x-1">
        <XCircle className="w-3 h-3 text-rose-600" />
        <span>Low Attendance (&lt;65%)</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Attendance Management & Tracker</h1>
        <p className="text-xs text-slate-500">
          Subject-wise attendance monitoring with mandatory 75% threshold status tracking
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Circular Progress */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-4 flex flex-col items-center justify-center">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Overall Attendance</h3>
          <CircularProgress
            value={overallAtt}
            max={100}
            label="Attendance"
            sublabel={overallAtt >= 75 ? 'Eligible for Exams' : 'Condonation Required'}
            colorGradient={overallAtt >= 75 ? ['#10b981', '#06b6d4'] : ['#f43f5e', '#f59e0b']}
          />

          <div className="flex justify-center space-x-6 text-xs border-t border-slate-100 dark:border-slate-800 pt-3 w-full">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Conducted</p>
              <p className="font-extrabold text-slate-800 dark:text-slate-200">{totalConducted} Classes</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Attended</p>
              <p className="font-extrabold text-sky-600 dark:text-sky-400">{totalAttended} Classes</p>
            </div>
          </div>
        </div>

        {/* Bunk / Safety Assistant */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
            Attendance Safety & Bunk Assistant
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 space-y-2">
              <span className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300">Safe Class Skips Available</span>
              <p className="text-2xl font-black text-emerald-900 dark:text-emerald-200">
                {Math.max(0, Math.floor((totalAttended - 0.75 * totalConducted) / 0.75))} Classes
              </p>
              <p className="text-[11px] text-slate-500">
                You can safely miss up to this many classes while maintaining your attendance above the mandatory 75% line.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/40 space-y-2">
              <span className="text-xs font-extrabold text-sky-800 dark:text-sky-300">Target for 85% Distinction</span>
              <p className="text-2xl font-black text-sky-900 dark:text-sky-200">
                {Math.max(0, Math.ceil((0.85 * totalConducted - totalAttended) / (1 - 0.85)))} Classes
              </p>
              <p className="text-[11px] text-slate-500">
                Consecutive upcoming classes required to reach an 85% attendance rating.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Subject Wise Attendance Table / Cards */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
          Subject-Wise Attendance Breakdown
        </h3>

        {loading ? (
          <div className="p-6 text-center text-xs text-slate-400">Loading attendance data...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {records.map((r) => (
              <div
                key={r.id || r.subject_code}
                className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded-md bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-mono font-bold text-[11px]">
                      {r.subject_code}
                    </span>
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white mt-1">
                      {r.subject_name}
                    </h4>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(r.attendance_percentage)}
                    <button
                      onClick={() => {
                        setEditingRecord(r);
                        setConductedInput(r.classes_conducted || 40);
                        setAttendedInput(r.classes_attended || 35);
                      }}
                      className="p-1 text-slate-400 hover:text-sky-600"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">
                      Attended {r.classes_attended} / {r.classes_conducted} Classes
                    </span>
                    <span className="font-black text-slate-900 dark:text-white">{r.attendance_percentage}%</span>
                  </div>

                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        r.attendance_percentage >= 75
                          ? 'bg-emerald-500'
                          : r.attendance_percentage >= 65
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(r.attendance_percentage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={Boolean(editingRecord)}
        onClose={() => setEditingRecord(null)}
        title="Update Subject Attendance"
      >
        <form onSubmit={handleUpdateAttendance} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Classes Conducted</label>
            <input
              type="number"
              min="1"
              required
              value={conductedInput}
              onChange={(e) => setConductedInput(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Classes Attended</label>
            <input
              type="number"
              min="0"
              required
              value={attendedInput}
              onChange={(e) => setAttendedInput(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setEditingRecord(null)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl gradient-bg-primary text-white text-xs font-bold shadow-md"
            >
              Save Attendance
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

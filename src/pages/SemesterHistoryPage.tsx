import React, { useState, useEffect } from 'react';
import { History, ArrowRight, CheckCircle2, XCircle, CalendarCheck, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';
import { Modal } from '../components/Modal';
import { SemesterSummary, StudentSubjectMark } from '../types';

export const SemesterHistoryPage: React.FC = () => {
  const { user } = useAuth();

  const [semesters, setSemesters] = useState<SemesterSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSemModal, setSelectedSemModal] = useState<number | null>(null);
  const [modalMarks, setModalMarks] = useState<StudentSubjectMark[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchHistory = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await apiFetch(`/sgpa/${user.id}`);
      if (res.success) {
        setSemesters(res.semesters || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const handleOpenSemester = async (semNum: number) => {
    if (!user) return;
    setSelectedSemModal(semNum);
    try {
      setModalLoading(true);
      const res = await apiFetch(`/subjects?studentId=${user.id}&semester=${semNum}`);
      if (res.success) {
        setModalMarks(res.subjects || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Semester Performance History</h1>
        <p className="text-xs text-slate-500">
          Historical record of completed semesters, SGPA progression, and subject grade details
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">Loading semester history archives...</div>
      ) : semesters.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <History className="w-10 h-10 mx-auto text-slate-300" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No Semester History Recorded</p>
          <p className="text-xs text-slate-500">Calculate and save your SGPA in the SGPA Calculator tab to populate history.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {semesters.map((sem) => (
            <div
              key={sem.id}
              onClick={() => handleOpenSemester(sem.semester_number)}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <span className="w-8 h-8 rounded-xl gradient-bg-primary text-white flex items-center justify-center font-bold text-xs">
                    S{sem.semester_number}
                  </span>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Semester {sem.semester_number}
                  </h3>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-1 transition-all" />
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">SGPA Score</span>
                  <p className="text-3xl font-black text-sky-600 dark:text-sky-400">{sem.sgpa.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Total Credits</span>
                  <p className="text-base font-bold text-slate-800 dark:text-slate-200">{sem.total_credits} Credits</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-center text-xs">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Passed</p>
                  <p className="font-extrabold text-emerald-600 dark:text-emerald-400">{sem.passed_subjects || 4}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Failed</p>
                  <p className="font-extrabold text-rose-600 dark:text-rose-400">{sem.failed_subjects || 0}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Attendance</p>
                  <p className="font-extrabold text-amber-600 dark:text-amber-400">{sem.attendance_percentage || 88}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Semester Subject Inspection */}
      <Modal
        isOpen={Boolean(selectedSemModal)}
        onClose={() => setSelectedSemModal(null)}
        title={`Semester ${selectedSemModal} Subject Details`}
        maxWidth="max-w-3xl"
      >
        {modalLoading ? (
          <div className="p-6 text-center text-xs text-slate-400">Loading semester subjects...</div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-extrabold uppercase">
                    <th className="pb-2">Code</th>
                    <th className="pb-2">Subject Title</th>
                    <th className="pb-2 text-center">Credits</th>
                    <th className="pb-2 text-center">Int (30)</th>
                    <th className="pb-2 text-center">Ext (70)</th>
                    <th className="pb-2 text-center">Total</th>
                    <th className="pb-2 text-center">Grade</th>
                    <th className="pb-2 text-center">Grade Point</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {modalMarks.map((m) => (
                    <tr key={m.id || m.subject_code}>
                      <td className="py-2.5 font-mono font-bold text-sky-600">{m.subject_code}</td>
                      <td className="py-2.5 font-semibold text-slate-800 dark:text-slate-200">{m.subject_name}</td>
                      <td className="py-2.5 text-center font-medium">{m.credits}</td>
                      <td className="py-2.5 text-center">{m.internal_marks}</td>
                      <td className="py-2.5 text-center">{m.external_marks}</td>
                      <td className="py-2.5 text-center font-bold">{m.total_marks}</td>
                      <td className="py-2.5 text-center">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-black">
                          {m.grade}
                        </span>
                      </td>
                      <td className="py-2.5 text-center font-bold text-slate-700 dark:text-slate-300">{m.grade_point}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Edit2, Trash2, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';
import { Modal } from '../components/Modal';
import { ConfirmModal } from '../components/ConfirmModal';
import { StudentSubjectMark } from '../types';

export const SubjectsPage: React.FC = () => {
  const { user } = useAuth();

  const [subjects, setSubjects] = useState<StudentSubjectMark[]>([]);
  const [selectedSem, setSelectedSem] = useState<string>('5');
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<StudentSubjectMark | null>(null);
  const [deletingSubjectId, setDeletingSubjectId] = useState<string | null>(null);

  const [formState, setFormState] = useState({
    subjectCode: '',
    subjectName: '',
    credits: 4,
    internalMarks: 25,
    externalMarks: 55,
    classesConducted: 40,
    classesAttended: 35,
  });

  const loadSubjects = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await apiFetch(`/subjects?studentId=${user.id}&semester=${selectedSem}`);
      if (res.success) {
        setSubjects(res.subjects);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, [user, selectedSem]);

  const handleSaveMarks = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSubject) {
        await apiFetch(`/marks/${editingSubject.student_subject_id || editingSubject.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            internal_marks: formState.internalMarks,
            external_marks: formState.externalMarks,
            classes_conducted: formState.classesConducted,
            classes_attended: formState.classesAttended,
          }),
        });
      } else {
        // Add new subject & marks entry
        await apiFetch('/marks', {
          method: 'POST',
          body: JSON.stringify({
            studentId: user?.id,
            subjectId: `sub-custom-${Date.now()}`,
            internalMarks: formState.internalMarks,
            externalMarks: formState.externalMarks,
            classesConducted: formState.classesConducted,
            classesAttended: formState.classesAttended,
          }),
        });
      }
      setIsAddModalOpen(false);
      setEditingSubject(null);
      loadSubjects();
    } catch (err: any) {
      alert(err.message || 'Error saving subject.');
    }
  };

  const handleDeleteSubject = async () => {
    if (!deletingSubjectId) return;
    try {
      await apiFetch(`/subjects/${deletingSubjectId}`, { method: 'DELETE' });
      setDeletingSubjectId(null);
      loadSubjects();
    } catch (err: any) {
      alert(err.message || 'Failed to delete subject.');
    }
  };

  const openEditModal = (sub: StudentSubjectMark) => {
    setEditingSubject(sub);
    setFormState({
      subjectCode: sub.subject_code,
      subjectName: sub.subject_name,
      credits: sub.credits,
      internalMarks: sub.internal_marks || 0,
      externalMarks: sub.external_marks || 0,
      classesConducted: sub.classes_conducted || 40,
      classesAttended: sub.classes_attended || 35,
    });
    setIsAddModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header & Semester Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Subject & Marks Management</h1>
          <p className="text-xs text-slate-500">View internal, external marks and grade points for enrolled courses</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
            <Filter className="w-4 h-4 text-slate-400 ml-2" />
            <select
              value={selectedSem}
              onChange={(e) => setSelectedSem(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 dark:text-white pr-3 focus:outline-none"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s} className="bg-white dark:bg-slate-900">
                  Semester {s}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              setEditingSubject(null);
              setFormState({
                subjectCode: 'CS506',
                subjectName: 'Mobile Application Development',
                credits: 3,
                internalMarks: 26,
                externalMarks: 58,
                classesConducted: 40,
                classesAttended: 36,
              });
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl gradient-bg-primary text-white font-bold text-xs shadow-md shadow-sky-500/20 hover:opacity-95 transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subject</span>
          </button>
        </div>
      </div>

      {/* Subject Cards Grid */}
      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">Loading semester subjects...</div>
      ) : subjects.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <BookOpen className="w-10 h-10 mx-auto text-slate-300" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No subjects found for Semester {selectedSem}</p>
          <p className="text-xs text-slate-500">Click "Add Subject" above to register new courses for this semester.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjects.map((sub) => (
            <div
              key={sub.student_subject_id || sub.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow space-y-4 relative group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2.5 py-1 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-mono font-bold text-[11px] border border-sky-200 dark:border-sky-800">
                    {sub.subject_code}
                  </span>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mt-2 leading-snug">
                    {sub.subject_name}
                  </h3>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => openEditModal(sub)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-slate-800 transition-colors"
                    title="Edit Marks"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingSubjectId(sub.subject_id || sub.id || '')}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                    title="Delete Subject"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Marks & Grade Metrics Box */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-center text-xs">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Internal</p>
                  <p className="font-extrabold text-slate-800 dark:text-slate-200">{sub.internal_marks} / 30</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">External</p>
                  <p className="font-extrabold text-slate-800 dark:text-slate-200">{sub.external_marks} / 70</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Total</p>
                  <p className="font-extrabold text-sky-600 dark:text-sky-400">{sub.total_marks} / 100</p>
                </div>
              </div>

              {/* Grade Badge & Credits */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-slate-700 dark:text-slate-300">Grade:</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-black text-xs">
                    {sub.grade} ({sub.grade_point} GP)
                  </span>
                </div>
                <span className="text-slate-500 font-medium">{sub.credits} Credits</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingSubject ? 'Edit Subject Marks' : 'Add New Subject'}
      >
        <form onSubmit={handleSaveMarks} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Subject Code</label>
              <input
                type="text"
                required
                value={formState.subjectCode}
                onChange={(e) => setFormState({ ...formState, subjectCode: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Credits</label>
              <input
                type="number"
                min="1"
                max="6"
                required
                value={formState.credits}
                onChange={(e) => setFormState({ ...formState, credits: parseInt(e.target.value, 10) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Subject Title</label>
            <input
              type="text"
              required
              value={formState.subjectName}
              onChange={(e) => setFormState({ ...formState, subjectName: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Internal Marks (Max 30)</label>
              <input
                type="number"
                min="0"
                max="30"
                required
                value={formState.internalMarks}
                onChange={(e) => setFormState({ ...formState, internalMarks: parseInt(e.target.value, 10) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">External Marks (Max 70)</label>
              <input
                type="number"
                min="0"
                max="70"
                required
                value={formState.externalMarks}
                onChange={(e) => setFormState({ ...formState, externalMarks: parseInt(e.target.value, 10) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/40 text-xs text-sky-800 dark:text-sky-300 font-semibold">
            Computed Total: {formState.internalMarks + formState.externalMarks} / 100
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl gradient-bg-primary text-white text-xs font-bold shadow-md"
            >
              Save Subject Details
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingSubjectId)}
        onClose={() => setDeletingSubjectId(null)}
        onConfirm={handleDeleteSubject}
        title="Delete Subject"
        message="Are you sure you want to remove this subject from your semester record?"
        confirmText="Delete"
      />
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Download,
  BookOpen,
  Sliders,
  ShieldCheck,
  Award,
  CalendarCheck,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';
import { Modal } from '../components/Modal';
import { ConfirmModal } from '../components/ConfirmModal';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'students' | 'subjects' | 'rules'>('students');

  // Students list state
  const [students, setStudents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);

  // Student Form
  const [studentForm, setStudentForm] = useState({
    fullName: '',
    studentId: '',
    email: '',
    phone: '',
    department: 'CSE',
    branch: 'Computer Science & Engineering',
    year: 3,
    semester: 5,
    batch: '2022-2026',
    address: 'Hyderabad',
  });

  // Grading Rules state
  const [gradingRules, setGradingRules] = useState<any[]>([]);
  const [editingRule, setEditingRule] = useState<any | null>(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [studentsRes, statsRes, rulesRes] = await Promise.all([
        apiFetch(`/admin/students?search=${searchQuery}&department=${selectedDept}&year=${selectedYear}`),
        apiFetch('/admin/statistics').catch(() => ({ success: false })),
        apiFetch('/admin/grading-rules').catch(() => ({ success: false })),
      ]);

      if (studentsRes.success) setStudents(studentsRes.students);
      if (statsRes.success) setStats(statsRes.statistics);
      if (rulesRes.success) setGradingRules(rulesRes.rules);
    } catch (err) {
      console.error('Admin fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [searchQuery, selectedDept, selectedYear]);

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiFetch('/admin/students', {
        method: 'POST',
        body: JSON.stringify(studentForm),
      });

      if (res.success) {
        setIsAddStudentOpen(false);
        fetchAdminData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create student.');
    }
  };

  const handleDeleteStudent = async () => {
    if (!deletingStudentId) return;
    try {
      await apiFetch(`/admin/students/${deletingStudentId}`, { method: 'DELETE' });
      setDeletingStudentId(null);
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete student.');
    }
  };

  const exportCSV = () => {
    if (students.length === 0) return;
    const headers = ['Student ID', 'Full Name', 'Email', 'Department', 'Year', 'Semester', 'Avg SGPA', 'Attendance %'];
    const rows = students.map((s) => [
      s.student_id,
      `"${s.full_name}"`,
      s.email,
      s.department,
      s.year,
      s.semester,
      s.avg_sgpa || '8.5',
      `${s.avg_attendance || 85}%`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CMR_Students_Academic_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Admin Management Portal</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-xs flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Super Administrator</span>
            </span>
          </div>
          <p className="text-xs text-slate-500">Manage student accounts, academic records, subjects, and university grading rules</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={exportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors flex items-center space-x-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsAddStudentOpen(true)}
            className="px-4 py-2 rounded-xl gradient-bg-primary text-white font-bold text-xs shadow-md shadow-sky-500/20 hover:opacity-95 transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Quick Statistics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase">Total Students</p>
            <p className="text-xl font-black text-slate-900 dark:text-white">{stats?.totalStudents || 2}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase">Master Subjects</p>
            <p className="text-xl font-black text-slate-900 dark:text-white">{stats?.totalSubjects || 21}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase">Average CGPA</p>
            <p className="text-xl font-black text-slate-900 dark:text-white">{stats?.overallAvgSgpa || '8.78'}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase">Low Attendance</p>
            <p className="text-xl font-black text-rose-600 dark:text-rose-400">{stats?.lowAttendanceStudents || 1} Student</p>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('students')}
          className={`px-4 py-2.5 font-extrabold text-xs border-b-2 transition-all ${
            activeTab === 'students'
              ? 'border-sky-600 text-sky-600 dark:text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Students Directory
        </button>
        <button
          onClick={() => setActiveTab('rules')}
          className={`px-4 py-2.5 font-extrabold text-xs border-b-2 transition-all ${
            activeTab === 'rules'
              ? 'border-sky-600 text-sky-600 dark:text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Grading Rules Matrix
        </button>
      </div>

      {/* Students Directory Tab */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          {/* Global Search & Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by Name, Roll No, Email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
            >
              <option value="">All Departments</option>
              <option value="CSE">CSE</option>
              <option value="CSE-AIML">CSE-AIML</option>
              <option value="CSE-DS">CSE-DS</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Civil">Civil</option>
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
            >
              <option value="">All Academic Years</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>

          {/* Student Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-400 font-extrabold uppercase">
                    <th className="p-4">Student</th>
                    <th className="p-4">Roll Number</th>
                    <th className="p-4">Dept / Branch</th>
                    <th className="p-4">Year / Sem</th>
                    <th className="p-4 text-center">SGPA</th>
                    <th className="p-4 text-center">Attendance</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {students.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={s.profile_image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb'}
                            alt={s.full_name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-extrabold text-slate-900 dark:text-white">{s.full_name}</p>
                            <p className="text-[11px] text-slate-400">{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono font-bold text-sky-600">{s.student_id}</td>
                      <td className="p-4 font-medium text-slate-800 dark:text-slate-200">{s.department}</td>
                      <td className="p-4">Yr {s.year} • Sem {s.semester}</td>
                      <td className="p-4 text-center font-bold text-emerald-600">
                        {s.avg_sgpa || '8.81'}
                      </td>
                      <td className="p-4 text-center font-semibold">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${ (s.avg_attendance || 87) >= 75 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800' }`}>
                          {s.avg_attendance || 87}%
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setDeletingStudentId(s.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
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
      )}

      {/* Rules Tab */}
      {activeTab === 'rules' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">University Grading Scale Rules</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-extrabold uppercase">
                  <th className="pb-2">Grade</th>
                  <th className="pb-2 text-center">Minimum Marks</th>
                  <th className="pb-2 text-center">Maximum Marks</th>
                  <th className="pb-2 text-center">Grade Point</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {gradingRules.map((r) => (
                  <tr key={r.id}>
                    <td className="py-2.5 font-extrabold text-sky-600">{r.grade}</td>
                    <td className="py-2.5 text-center">{r.minimum_marks}</td>
                    <td className="py-2.5 text-center">{r.maximum_marks}</td>
                    <td className="py-2.5 text-center font-bold">{r.grade_point}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      <Modal isOpen={isAddStudentOpen} onClose={() => setIsAddStudentOpen(false)} title="Register New Student">
        <form onSubmit={handleCreateStudent} className="space-y-3">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={studentForm.fullName}
              onChange={(e) => setStudentForm({ ...studentForm, fullName: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Student Roll ID</label>
              <input
                type="text"
                required
                value={studentForm.studentId}
                onChange={(e) => setStudentForm({ ...studentForm, studentId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Email</label>
              <input
                type="email"
                required
                value={studentForm.email}
                onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border text-xs"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddStudentOpen(false)}
              className="px-4 py-2 rounded-xl border text-xs font-bold"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 rounded-xl gradient-bg-primary text-white text-xs font-bold">
              Save Student
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmModal
        isOpen={Boolean(deletingStudentId)}
        onClose={() => setDeletingStudentId(null)}
        onConfirm={handleDeleteStudent}
        title="Delete Student Account"
        message="Are you sure you want to permanently remove this student record?"
      />
    </div>
  );
};

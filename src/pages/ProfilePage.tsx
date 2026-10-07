import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, BookOpen, Hash, Edit3, Save, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';
import { StudentProfile } from '../types';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();

  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    date_of_birth: '',
    batch: '',
    profile_image: '',
  });

  const loadProfile = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await apiFetch(`/students/${user.id}`);
      if (res.success && res.student) {
        setStudent(res.student);
        setFormData({
          full_name: res.student.full_name || user.name,
          phone: res.student.phone || '',
          address: res.student.address || '',
          date_of_birth: res.student.date_of_birth || '',
          batch: res.student.batch || '2022-2026',
          profile_image: res.student.profile_image || '',
        });
      }
    } catch (err) {
      console.error('Failed to load student profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;

    try {
      setSaving(true);
      const res = await apiFetch(`/students/${student.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });

      if (res.success) {
        setStudent(res.student);
        setIsEditing(false);
        setSuccessMsg('Profile updated successfully!');
        refreshUser();
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading student profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Student Profile</h1>
          <p className="text-xs text-slate-500">Manage your personal and academic contact information</p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 rounded-xl gradient-bg-primary text-white font-bold text-xs shadow-md shadow-sky-500/20 hover:opacity-95 transition-all flex items-center space-x-1.5"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-300 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      {successMsg && (
        <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-500" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        {/* Cover Graphic Banner */}
        <div className="h-32 gradient-card-blue relative flex items-end px-8 pb-4">
          <div className="absolute -bottom-10 left-8">
            <div className="relative">
              <img
                src={
                  formData.profile_image ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'
                }
                alt={student?.full_name}
                className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white dark:ring-slate-900 shadow-md"
              />
            </div>
          </div>
        </div>

        <div className="pt-14 px-8 pb-8 space-y-6">
          {/* Header info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                {student?.full_name || user?.name}
              </h2>
              <p className="text-xs text-sky-600 dark:text-sky-400 font-semibold mt-0.5">
                B.Tech in {student?.branch || 'Computer Science & Engineering'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-mono text-xs font-bold border border-sky-200 dark:border-sky-800">
                ID: {student?.student_id || user?.studentId}
              </span>
              <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-bold border border-purple-200 dark:border-purple-800">
                Year {student?.year} • Sem {student?.semester}
              </span>
            </div>
          </div>

          {/* Form / Display Details Grid */}
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                ) : (
                  <div className="flex items-center space-x-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                    <User className="w-4 h-4 text-slate-400" />
                    <span>{student?.full_name}</span>
                  </div>
                )}
              </div>

              {/* Student ID */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Student ID (Roll Number)
                </label>
                <div className="flex items-center space-x-2 text-xs font-mono font-semibold text-slate-800 dark:text-slate-200">
                  <Hash className="w-4 h-4 text-slate-400" />
                  <span>{student?.student_id}</span>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Institutional Email
                </label>
                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>{student?.email || user?.email}</span>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Contact Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                ) : (
                  <div className="flex items-center space-x-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{student?.phone || 'Not provided'}</span>
                  </div>
                )}
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Academic Department
                </label>
                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  <span>{student?.department}</span>
                </div>
              </div>

              {/* Batch */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Academic Batch
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.batch}
                    onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                ) : (
                  <div className="flex items-center space-x-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{student?.batch}</span>
                  </div>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Date of Birth
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                ) : (
                  <div className="flex items-center space-x-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{student?.date_of_birth || '2003-05-14'}</span>
                  </div>
                )}
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Residential Address
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                ) : (
                  <div className="flex items-center space-x-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{student?.address}</span>
                  </div>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl gradient-bg-primary text-white text-xs font-bold shadow-md shadow-sky-500/20 hover:opacity-95 transition-all flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

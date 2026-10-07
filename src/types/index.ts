export type Role = 'student' | 'admin';

export interface User {
  id: string;
  studentDbId?: string;
  studentId?: string;
  name: string;
  email: string;
  role: Role;
  department?: string;
  branch?: string;
  year?: number;
  semester?: number;
  profileImage?: string;
}

export interface StudentProfile {
  id: string;
  user_id: string;
  student_id: string;
  full_name: string;
  email: string;
  phone: string;
  department: string;
  branch: string;
  year: number;
  semester: number;
  batch: string;
  date_of_birth: string;
  address: string;
  profile_image: string;
  latest_sgpa?: number;
  avg_sgpa?: number;
  avg_attendance?: number;
}

export interface Subject {
  id: string;
  subject_code: string;
  subject_name: string;
  credits: number;
  department: string;
  semester: number;
}

export interface StudentSubjectMark {
  student_subject_id?: string;
  id?: string;
  subject_id: string;
  subject_code: string;
  subject_name: string;
  credits: number;
  semester: number;
  department?: string;
  internal_marks: number;
  external_marks: number;
  total_marks: number;
  grade: string;
  grade_point: number;
  attendance_percentage: number;
  classes_conducted: number;
  classes_attended: number;
}

export interface SemesterSummary {
  id: string;
  student_id: string;
  semester_number: number;
  sgpa: number;
  total_credits: number;
  passed_subjects: number;
  failed_subjects: number;
  attendance_percentage: number;
}

export interface GradeRule {
  id: string;
  grade: string;
  minimum_marks: number;
  maximum_marks: number;
  grade_point: number;
}

export interface NotificationItem {
  id: string;
  student_id?: string;
  title: string;
  message: string;
  is_read: number;
  created_at: string;
}

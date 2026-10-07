import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const dbPath = path.resolve(process.cwd(), 'server', 'database', 'cmr_university.db');

// Ensure directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  console.log('Initializing CMR University Database...');
  
  // Read and execute schema
  const schemaPath = path.resolve(process.cwd(), 'server', 'database', 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    db.exec(schemaSql);
  }

  // Seed default grading rules if empty
  const rulesCount = (db.prepare('SELECT COUNT(*) as count FROM grading_rules').get() as any).count;
  if (rulesCount === 0) {
    const defaultRules = [
      { id: 'gr-1', grade: 'O', minimum_marks: 90, maximum_marks: 100, grade_point: 10.0 },
      { id: 'gr-2', grade: 'A+', minimum_marks: 80, maximum_marks: 89, grade_point: 9.0 },
      { id: 'gr-3', grade: 'A', minimum_marks: 70, maximum_marks: 79, grade_point: 8.0 },
      { id: 'gr-4', grade: 'B+', minimum_marks: 60, maximum_marks: 69, grade_point: 7.0 },
      { id: 'gr-5', grade: 'B', minimum_marks: 50, maximum_marks: 59, grade_point: 6.0 },
      { id: 'gr-6', grade: 'C', minimum_marks: 40, maximum_marks: 49, grade_point: 5.0 },
      { id: 'gr-7', grade: 'F', minimum_marks: 0, maximum_marks: 39, grade_point: 0.0 },
    ];
    const insertRule = db.prepare(
      'INSERT INTO grading_rules (id, grade, minimum_marks, maximum_marks, grade_point) VALUES (?, ?, ?, ?, ?)'
    );
    for (const r of defaultRules) {
      insertRule.run(r.id, r.grade, r.minimum_marks, r.maximum_marks, r.grade_point);
    }
  }

  // Seed Admin & Demo Student if empty
  const usersCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as any).count;
  if (usersCount === 0) {
    seedDemoData();
  }
}

export function seedDemoData() {
  console.log('Seeding CMR Technical Campus Demo Data...');
  const passwordHash = bcrypt.hashSync('student123', 10);
  const adminPasswordHash = bcrypt.hashSync('admin123', 10);

  // 1. Admin User
  db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role)
    VALUES (?, ?, ?, ?, ?)
  `).run('user-admin-1', 'Dr. K. V. Rao (HOD - Academic Affairs)', 'admin@cmr.edu.in', adminPasswordHash, 'admin');

  // 2. Demo Student 1: Rahul Sharma (CSE)
  const student1UserId = 'user-student-1';
  const student1Id = 'std-217R1A0501';
  db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role)
    VALUES (?, ?, ?, ?, ?)
  `).run(student1UserId, 'Rahul Sharma', 'rahul.217r1a0501@cmr.edu.in', passwordHash, 'student');

  db.prepare(`
    INSERT INTO students (id, user_id, student_id, full_name, phone, department, branch, year, semester, batch, date_of_birth, address, profile_image)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    student1Id,
    student1UserId,
    '217R1A0501',
    'Rahul Sharma',
    '+91 98765 43210',
    'CSE',
    'Computer Science & Engineering',
    3,
    5,
    '2022-2026',
    '2003-05-14',
    'Kandlakoya (V), Medchal Road, Hyderabad, Telangana 501401',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'
  );

  // 3. Demo Student 2: Ananya Reddy (CSE-AIML)
  const student2UserId = 'user-student-2';
  const student2Id = 'std-217R1A6605';
  db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role)
    VALUES (?, ?, ?, ?, ?)
  `).run(student2UserId, 'Ananya Reddy', 'ananya.217r1a6605@cmr.edu.in', passwordHash, 'student');

  db.prepare(`
    INSERT INTO students (id, user_id, student_id, full_name, phone, department, branch, year, semester, batch, date_of_birth, address, profile_image)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    student2Id,
    student2UserId,
    '217R1A6605',
    'Ananya Reddy',
    '+91 91234 56789',
    'CSE-AIML',
    'Artificial Intelligence & Machine Learning',
    3,
    5,
    '2022-2026',
    '2003-08-22',
    'Gachibowli, Hyderabad, Telangana',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400'
  );

  // Subjects definition for CSE
  const cseSubjects = [
    // Sem 1
    { id: 'sub-101', code: 'CS101', name: 'Mathematics - I', credits: 4, dept: 'CSE', sem: 1 },
    { id: 'sub-102', code: 'CS102', name: 'Engineering Chemistry', credits: 4, dept: 'CSE', sem: 1 },
    { id: 'sub-103', code: 'CS103', name: 'Basic Electrical Engineering', credits: 3, dept: 'CSE', sem: 1 },
    { id: 'sub-104', code: 'CS104', name: 'Programming for Problem Solving (C)', credits: 4, dept: 'CSE', sem: 1 },

    // Sem 2
    { id: 'sub-201', code: 'CS201', name: 'Mathematics - II', credits: 4, dept: 'CSE', sem: 2 },
    { id: 'sub-202', code: 'CS202', name: 'Applied Physics', credits: 4, dept: 'CSE', sem: 2 },
    { id: 'sub-203', code: 'CS203', name: 'Data Structures using C++', credits: 4, dept: 'CSE', sem: 2 },
    { id: 'sub-204', code: 'CS204', name: 'Engineering Graphics & Design', credits: 3, dept: 'CSE', sem: 2 },

    // Sem 3
    { id: 'sub-301', code: 'CS301', name: 'Discrete Mathematics', credits: 3, dept: 'CSE', sem: 3 },
    { id: 'sub-302', code: 'CS302', name: 'Object Oriented Programming through Java', credits: 4, dept: 'CSE', sem: 3 },
    { id: 'sub-303', code: 'CS303', name: 'Digital Electronics & Computer Architecture', credits: 4, dept: 'CSE', sem: 3 },
    { id: 'sub-304', code: 'CS304', name: 'Database Management Systems', credits: 4, dept: 'CSE', sem: 3 },

    // Sem 4
    { id: 'sub-401', code: 'CS401', name: 'Formal Languages & Automata Theory', credits: 3, dept: 'CSE', sem: 4 },
    { id: 'sub-402', code: 'CS402', name: 'Design and Analysis of Algorithms', credits: 4, dept: 'CSE', sem: 4 },
    { id: 'sub-403', code: 'CS403', name: 'Operating Systems', credits: 4, dept: 'CSE', sem: 4 },
    { id: 'sub-404', code: 'CS404', name: 'Software Engineering', credits: 3, dept: 'CSE', sem: 4 },

    // Sem 5 (Current)
    { id: 'sub-501', code: 'CS501', name: 'Computer Networks', credits: 4, dept: 'CSE', sem: 5 },
    { id: 'sub-502', code: 'CS502', name: 'Web Technologies (React & Node)', credits: 4, dept: 'CSE', sem: 5 },
    { id: 'sub-503', code: 'CS503', name: 'Artificial Intelligence', credits: 3, dept: 'CSE', sem: 5 },
    { id: 'sub-504', code: 'CS504', name: 'Cloud Computing & DevOps', credits: 3, dept: 'CSE', sem: 5 },
    { id: 'sub-505', code: 'CS505', name: 'Full Stack Development Lab', credits: 2, dept: 'CSE', sem: 5 },
  ];

  const insertSubject = db.prepare(`
    INSERT INTO subjects (id, subject_code, subject_name, credits, department, semester)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const s of cseSubjects) {
    insertSubject.run(s.id, s.code, s.name, s.credits, s.dept, s.sem);
  }

  // Populate student_subjects for Rahul Sharma (Sem 1 - 5)
  const rahulMarks = [
    // Sem 1
    { subId: 'sub-101', internal: 26, external: 60, total: 86, grade: 'A+', gp: 9.0, cond: 40, att: 36 },
    { subId: 'sub-102', internal: 25, external: 55, total: 80, grade: 'A+', gp: 9.0, cond: 40, att: 35 },
    { subId: 'sub-103', internal: 22, external: 50, total: 72, grade: 'A', gp: 8.0, cond: 35, att: 30 },
    { subId: 'sub-104', internal: 28, external: 64, total: 92, grade: 'O', gp: 10.0, cond: 42, att: 39 },

    // Sem 2
    { subId: 'sub-201', internal: 24, external: 58, total: 82, grade: 'A+', gp: 9.0, cond: 40, att: 34 },
    { subId: 'sub-202', internal: 22, external: 52, total: 74, grade: 'A', gp: 8.0, cond: 38, att: 32 },
    { subId: 'sub-203', internal: 27, external: 61, total: 88, grade: 'A+', gp: 9.0, cond: 40, att: 37 },
    { subId: 'sub-204', internal: 25, external: 56, total: 81, grade: 'A+', gp: 9.0, cond: 36, att: 31 },

    // Sem 3
    { subId: 'sub-301', internal: 25, external: 60, total: 85, grade: 'A+', gp: 9.0, cond: 38, att: 34 },
    { subId: 'sub-302', internal: 29, external: 65, total: 94, grade: 'O', gp: 10.0, cond: 45, att: 42 },
    { subId: 'sub-303', internal: 24, external: 54, total: 78, grade: 'A', gp: 8.0, cond: 40, att: 33 },
    { subId: 'sub-304', internal: 28, external: 63, total: 91, grade: 'O', gp: 10.0, cond: 42, att: 38 },

    // Sem 4
    { subId: 'sub-401', internal: 23, external: 51, total: 74, grade: 'A', gp: 8.0, cond: 36, att: 30 },
    { subId: 'sub-402', internal: 26, external: 60, total: 86, grade: 'A+', gp: 9.0, cond: 40, att: 36 },
    { subId: 'sub-403', internal: 27, external: 59, total: 86, grade: 'A+', gp: 9.0, cond: 40, att: 35 },
    { subId: 'sub-404', internal: 25, external: 55, total: 80, grade: 'A+', gp: 9.0, cond: 36, att: 33 },

    // Sem 5 (Current)
    { subId: 'sub-501', internal: 26, external: 62, total: 88, grade: 'A+', gp: 9.0, cond: 30, att: 27 }, // 90%
    { subId: 'sub-502', internal: 29, external: 66, total: 95, grade: 'O', gp: 10.0, cond: 32, att: 30 },  // 93.75%
    { subId: 'sub-503', internal: 23, external: 52, total: 75, grade: 'A', gp: 8.0, cond: 28, att: 24 },   // 85.7%
    { subId: 'sub-504', internal: 20, external: 48, total: 68, grade: 'B+', gp: 7.0, cond: 25, att: 17 },  // 68% - Warning!
    { subId: 'sub-505', internal: 28, external: 67, total: 95, grade: 'O', gp: 10.0, cond: 20, att: 19 },  // 95%
  ];

  const insertStudentSub = db.prepare(`
    INSERT INTO student_subjects (id, student_id, subject_id, internal_marks, external_marks, total_marks, grade, grade_point, attendance_percentage, classes_conducted, classes_attended)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  rahulMarks.forEach((m, idx) => {
    const attPct = Math.round((m.att / m.cond) * 100 * 10) / 10;
    insertStudentSub.run(
      `ss-rahul-${idx + 1}`,
      student1Id,
      m.subId,
      m.internal,
      m.external,
      m.total,
      m.grade,
      m.gp,
      attPct,
      m.cond,
      m.att
    );
  });

  // Calculate & insert Semester records for Rahul
  const semesterSummaries = [
    { sem: 1, sgpa: 8.73, credits: 15, pass: 4, fail: 0, att: 88.5 },
    { sem: 2, sgpa: 8.73, credits: 15, pass: 4, fail: 0, att: 85.7 },
    { sem: 3, sgpa: 9.27, credits: 15, pass: 4, fail: 0, att: 90.4 },
    { sem: 4, sgpa: 8.79, credits: 14, pass: 4, fail: 0, att: 84.8 },
    { sem: 5, sgpa: 8.81, credits: 16, pass: 5, fail: 0, att: 87.4 },
  ];

  const insertSem = db.prepare(`
    INSERT INTO semesters (id, student_id, semester_number, sgpa, total_credits, passed_subjects, failed_subjects, attendance_percentage)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  semesterSummaries.forEach((s) => {
    insertSem.run(`sem-rahul-${s.sem}`, student1Id, s.sem, s.sgpa, s.credits, s.pass, s.fail, s.att);
  });

  // Seed Notifications for Rahul
  const insertNotif = db.prepare(`
    INSERT INTO notifications (id, student_id, title, message, is_read, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertNotif.run(
    'notif-1',
    student1Id,
    'Semester 5 Results Declared',
    'Your Semester 5 mid-term and internal grades have been calculated. Current SGPA: 8.81.',
    0,
    new Date(Date.now() - 3600000 * 2).toISOString()
  );

  insertNotif.run(
    'notif-2',
    student1Id,
    '⚠️ Attendance Alert: CS504',
    'Your attendance in CS504 (Cloud Computing & DevOps) is 68%, which is below the required 75% threshold.',
    0,
    new Date(Date.now() - 3600000 * 24).toISOString()
  );

  insertNotif.run(
    'notif-3',
    student1Id,
    'Profile Details Updated',
    'Your contact phone number and residential address were updated successfully.',
    1,
    new Date(Date.now() - 3600000 * 72).toISOString()
  );
}

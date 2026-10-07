import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../database/db.js';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Apply auth & admin guard to all admin routes
router.use(authenticateToken);
router.use(requireAdmin);

// GET /api/admin/students (List students with global search, filters by dept, year, semester)
router.get('/students', (req, res) => {
  try {
    const { search, department, year, semester } = req.query;

    let query = `
      SELECT s.*, u.email, u.name as user_name,
             (SELECT MAX(sgpa) FROM semesters WHERE student_id = s.id) as latest_sgpa,
             (SELECT ROUND(AVG(sgpa), 2) FROM semesters WHERE student_id = s.id) as avg_sgpa,
             (SELECT ROUND(AVG(attendance_percentage), 1) FROM student_subjects WHERE student_id = s.id) as avg_attendance
      FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search) {
      query += ` AND (s.full_name LIKE ? OR s.student_id LIKE ? OR u.email LIKE ? OR s.branch LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    if (department) {
      query += ` AND s.department = ?`;
      params.push(department);
    }
    if (year) {
      query += ` AND s.year = ?`;
      params.push(parseInt(year as string, 10));
    }
    if (semester) {
      query += ` AND s.semester = ?`;
      params.push(parseInt(semester as string, 10));
    }

    query += ` ORDER BY s.student_id ASC`;

    const students = db.prepare(query).all(...params);

    return res.json({ success: true, count: students.length, students });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error retrieving students.' });
  }
});

// POST /api/admin/students (Add new student from Admin panel)
router.post('/students', (req, res) => {
  try {
    const { fullName, studentId, email, phone, department, branch, year, semester, batch, address } = req.body;

    if (!fullName || !studentId || !email || !department) {
      return res.status(400).json({ success: false, message: 'Missing required student details.' });
    }

    const userId = `user-${Date.now()}`;
    const studentDbId = `std-${Date.now()}`;
    const passwordHash = bcrypt.hashSync('student123', 10);

    const insertUser = db.prepare('INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)');
    const insertStudent = db.prepare(`
      INSERT INTO students (id, user_id, student_id, full_name, phone, department, branch, year, semester, batch, date_of_birth, address, profile_image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertUser.run(userId, fullName, email, passwordHash, 'student');
    insertStudent.run(
      studentDbId,
      userId,
      studentId,
      fullName,
      phone || '',
      department,
      branch || department,
      parseInt(year || 1, 10),
      parseInt(semester || 1, 10),
      batch || '2022-2026',
      '2003-01-01',
      address || 'CMR Technical Campus',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'
    );

    return res.status(201).json({ success: true, message: 'Student created successfully!' });
  } catch (error: any) {
    if (error.message.includes('UNIQUE')) {
      return res.status(400).json({ success: false, message: 'Student ID or Email already exists.' });
    }
    return res.status(500).json({ success: false, message: 'Error creating student.' });
  }
});

// DELETE /api/admin/students/:id
router.delete('/students/:id', (req, res) => {
  try {
    const { id } = req.params;
    const student: any = db.prepare('SELECT user_id FROM students WHERE id = ? OR student_id = ?').get(id, id);
    if (student) {
      db.prepare('DELETE FROM users WHERE id = ?').run(student.user_id);
    }
    return res.json({ success: true, message: 'Student account deleted.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error deleting student.' });
  }
});

// GET /api/admin/statistics
router.get('/statistics', (req, res) => {
  try {
    const totalStudents = (db.prepare('SELECT COUNT(*) as count FROM students').get() as any).count;
    const totalSubjects = (db.prepare('SELECT COUNT(*) as count FROM subjects').get() as any).count;
    
    const avgSgpaRec = db.prepare('SELECT ROUND(AVG(sgpa), 2) as avg FROM semesters WHERE sgpa > 0').get() as any;
    const overallAvgSgpa = avgSgpaRec?.avg || 8.5;

    const lowAttCount = (db.prepare('SELECT COUNT(DISTINCT student_id) as count FROM student_subjects WHERE attendance_percentage < 75').get() as any).count;

    // Dept distribution
    const deptDist = db.prepare('SELECT department, COUNT(*) as count FROM students GROUP BY department').all();

    return res.json({
      success: true,
      statistics: {
        totalStudents,
        totalSubjects,
        overallAvgSgpa,
        lowAttendanceStudents: lowAttCount,
        departmentDistribution: deptDist,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error fetching statistics.' });
  }
});

// GET /api/admin/grading-rules
router.get('/grading-rules', (req, res) => {
  try {
    const rules = db.prepare('SELECT * FROM grading_rules ORDER BY minimum_marks DESC').all();
    return res.json({ success: true, rules });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error fetching grading rules.' });
  }
});

// PUT /api/admin/grading-rules/:id
router.put('/grading-rules/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { minimum_marks, maximum_marks, grade_point, grade } = req.body;

    db.prepare(`
      UPDATE grading_rules 
      SET minimum_marks = COALESCE(?, minimum_marks),
          maximum_marks = COALESCE(?, maximum_marks),
          grade_point = COALESCE(?, grade_point),
          grade = COALESCE(?, grade)
      WHERE id = ?
    `).run(minimum_marks, maximum_marks, grade_point, grade, id);

    return res.json({ success: true, message: 'Grading rule updated successfully.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error updating rule.' });
  }
});

export default router;

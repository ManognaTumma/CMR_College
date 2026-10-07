import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../database/db.js';
import { JWT_SECRET, authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/register
router.post('/register', (req, res) => {
  try {
    const {
      fullName,
      studentId,
      email,
      phone,
      password,
      department,
      branch,
      year,
      semester,
    } = req.body;

    if (!fullName || !studentId || !email || !password || !department) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }

    // Check existing
    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const existingStudentId = db.prepare('SELECT * FROM students WHERE student_id = ?').get(studentId);
    if (existingStudentId) {
      return res.status(400).json({ success: false, message: 'This Student ID is already registered.' });
    }

    const userId = `user-${Date.now()}`;
    const studentDbId = `std-${Date.now()}`;
    const passwordHash = bcrypt.hashSync(password, 10);
    const batchYear = `${new Date().getFullYear()}-${new Date().getFullYear() + 4}`;

    // Transaction for user & student insertion
    const insertUser = db.prepare(
      'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)'
    );
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
      batchYear,
      '2003-01-01',
      'CMR Technical Campus Campus Hostels / Hyderabad',
      `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400`
    );

    // Populate initial subjects for student's department and semester
    const deptSubjects = db
      .prepare('SELECT * FROM subjects WHERE department = ? AND semester = ?')
      .all(department, semester) as any[];

    const insertStudentSub = db.prepare(`
      INSERT INTO student_subjects (id, student_id, subject_id, internal_marks, external_marks, total_marks, grade, grade_point, attendance_percentage, classes_conducted, classes_attended)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    deptSubjects.forEach((sub, idx) => {
      insertStudentSub.run(
        `ss-${studentDbId}-${idx}`,
        studentDbId,
        sub.id,
        25,
        55,
        80,
        'A+',
        9.0,
        85.0,
        40,
        34
      );
    });

    // Create welcome notification
    db.prepare(`
      INSERT INTO notifications (id, student_id, title, message)
      VALUES (?, ?, ?, ?)
    `).run(
      `notif-${Date.now()}`,
      studentDbId,
      'Welcome to CMR Student Academic Portal!',
      `Hello ${fullName}, welcome to CMR Technical Campus Student Academic Information System. Manage your grades and SGPA efficiently!`
    );

    const token = jwt.sign({ id: userId, email, role: 'student', name: fullName }, JWT_SECRET, {
      expiresIn: '7d',
    });

    return res.status(201).json({
      success: true,
      message: 'Student account registered successfully!',
      token,
      user: {
        id: userId,
        studentDbId,
        name: fullName,
        email,
        role: 'student',
        studentId,
        department,
        semester,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { identifier, password } = req.body; // email or student_id

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Please enter Email/Student ID and Password.' });
    }

    // Check by email or student_id
    let user: any = db.prepare('SELECT * FROM users WHERE email = ?').get(identifier);

    if (!user) {
      // Try searching student_id
      const studentRec: any = db
        .prepare('SELECT user_id FROM students WHERE student_id = ?')
        .get(identifier);
      if (studentRec) {
        user = db.prepare('SELECT * FROM users WHERE id = ?').get(studentRec.user_id);
      }
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    const passwordMatch = bcrypt.compareSync(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password. Please try again.' });
    }

    // Fetch student profile details if student
    let studentDetails: any = null;
    if (user.role === 'student') {
      studentDetails = db.prepare('SELECT * FROM students WHERE user_id = ?').get(user.id);
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, {
      expiresIn: '7d',
    });

    return res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        studentDbId: studentDetails?.id,
        studentId: studentDetails?.student_id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: studentDetails?.department,
        branch: studentDetails?.branch,
        semester: studentDetails?.semester,
        year: studentDetails?.year,
        profileImage: studentDetails?.profile_image,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error during authentication.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req: AuthRequest, res) => {
  try {
    const user: any = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(req.user!.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    let studentDetails: any = null;
    if (user.role === 'student') {
      studentDetails = db.prepare('SELECT * FROM students WHERE user_id = ?').get(user.id);
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        studentDbId: studentDetails?.id,
        studentId: studentDetails?.student_id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: studentDetails?.department,
        branch: studentDetails?.branch,
        semester: studentDetails?.semester,
        year: studentDetails?.year,
        profileImage: studentDetails?.profile_image,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

export default router;

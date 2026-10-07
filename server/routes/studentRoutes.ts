import { Router } from 'express';
import { db } from '../database/db.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/students/:id (Get full student profile)
router.get('/:id', authenticateToken, (req: AuthRequest, res) => {
  try {
    const studentIdParam = req.params.id;
    let student: any = null;

    // Search by student database id or student_id string or user_id
    student = db.prepare(`
      SELECT s.*, u.email, u.name as user_name 
      FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = ? OR s.student_id = ? OR s.user_id = ?
    `).get(studentIdParam, studentIdParam, studentIdParam);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    // Security check: Students can only view their own profile unless Admin
    if (req.user?.role === 'student' && req.user?.id !== student.user_id) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to student profile.' });
    }

    return res.json({ success: true, student });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Server error retrieving profile.' });
  }
});

// PUT /api/students/:id (Update student profile)
router.put('/:id', authenticateToken, (req: AuthRequest, res) => {
  try {
    const studentIdParam = req.params.id;
    const student: any = db.prepare('SELECT * FROM students WHERE id = ? OR student_id = ?').get(studentIdParam, studentIdParam);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    // Security check
    if (req.user?.role === 'student' && req.user?.id !== student.user_id) {
      return res.status(403).json({ success: false, message: 'Unauthorized profile update.' });
    }

    const { full_name, phone, address, date_of_birth, batch, profile_image } = req.body;

    db.prepare(`
      UPDATE students 
      SET full_name = COALESCE(?, full_name),
          phone = COALESCE(?, phone),
          address = COALESCE(?, address),
          date_of_birth = COALESCE(?, date_of_birth),
          batch = COALESCE(?, batch),
          profile_image = COALESCE(?, profile_image)
      WHERE id = ?
    `).run(full_name, phone, address, date_of_birth, batch, profile_image, student.id);

    if (full_name) {
      db.prepare('UPDATE users SET name = ? WHERE id = ?').run(full_name, student.user_id);
    }

    const updatedStudent = db.prepare(`
      SELECT s.*, u.email 
      FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = ?
    `).get(student.id);

    return res.json({
      success: true,
      message: 'Student profile updated successfully!',
      student: updatedStudent,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Server error updating profile.' });
  }
});

export default router;

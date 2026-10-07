import { Router } from 'express';
import { db } from '../database/db.js';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/subjects (Get all subjects or filtered by department / semester / studentId)
router.get('/', authenticateToken, (req: AuthRequest, res) => {
  try {
    const { department, semester, studentId } = req.query;

    if (studentId) {
      // Return student's subject enrollment with marks and grade details
      const studentRec: any = db
        .prepare('SELECT id FROM students WHERE id = ? OR student_id = ? OR user_id = ?')
        .get(studentId, studentId, studentId);

      if (!studentRec) {
        return res.status(404).json({ success: false, message: 'Student not found.' });
      }

      let query = `
        SELECT sub.id as subject_id, sub.subject_code, sub.subject_name, sub.credits, sub.department, sub.semester,
               ss.id as student_subject_id, ss.internal_marks, ss.external_marks, ss.total_marks,
               ss.grade, ss.grade_point, ss.attendance_percentage, ss.classes_conducted, ss.classes_attended
        FROM student_subjects ss
        JOIN subjects sub ON ss.subject_id = sub.id
        WHERE ss.student_id = ?
      `;
      const params: any[] = [studentRec.id];

      if (semester) {
        query += ' AND sub.semester = ?';
        params.push(parseInt(semester as string, 10));
      }

      query += ' ORDER BY sub.semester ASC, sub.subject_code ASC';

      const subjects = db.prepare(query).all(...params);
      return res.json({ success: true, subjects });
    }

    // Master subjects list
    let query = 'SELECT * FROM subjects WHERE 1=1';
    const params: any[] = [];

    if (department) {
      query += ' AND department = ?';
      params.push(department);
    }
    if (semester) {
      query += ' AND semester = ?';
      params.push(parseInt(semester as string, 10));
    }

    query += ' ORDER BY semester ASC, subject_code ASC';
    const subjects = db.prepare(query).all(...params);

    return res.json({ success: true, subjects });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error retrieving subjects.' });
  }
});

// POST /api/subjects (Add subject - Admin only)
router.post('/', authenticateToken, requireAdmin, (req: AuthRequest, res) => {
  try {
    const { subjectCode, subjectName, credits, department, semester } = req.body;

    if (!subjectCode || !subjectName || !credits || !department || !semester) {
      return res.status(400).json({ success: false, message: 'Please provide all subject details.' });
    }

    const id = `sub-${Date.now()}`;

    db.prepare(`
      INSERT INTO subjects (id, subject_code, subject_name, credits, department, semester)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, subjectCode, subjectName, parseInt(credits, 10), department, parseInt(semester, 10));

    const newSubject = db.prepare('SELECT * FROM subjects WHERE id = ?').get(id);

    return res.status(201).json({
      success: true,
      message: 'Subject added successfully!',
      subject: newSubject,
    });
  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ success: false, message: 'Subject Code already exists.' });
    }
    return res.status(500).json({ success: false, message: 'Error creating subject.' });
  }
});

// PUT /api/subjects/:id (Edit subject)
router.put('/:id', authenticateToken, requireAdmin, (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { subject_code, subject_name, credits, department, semester } = req.body;

    db.prepare(`
      UPDATE subjects 
      SET subject_code = COALESCE(?, subject_code),
          subject_name = COALESCE(?, subject_name),
          credits = COALESCE(?, credits),
          department = COALESCE(?, department),
          semester = COALESCE(?, semester)
      WHERE id = ?
    `).run(subject_code, subject_name, credits, department, semester, id);

    const updated = db.prepare('SELECT * FROM subjects WHERE id = ?').get(id);
    return res.json({ success: true, message: 'Subject updated successfully!', subject: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error updating subject.' });
  }
});

// DELETE /api/subjects/:id (Delete subject)
router.delete('/:id', authenticateToken, requireAdmin, (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM subjects WHERE id = ?').run(id);
    return res.json({ success: true, message: 'Subject deleted successfully.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error deleting subject.' });
  }
});

export default router;

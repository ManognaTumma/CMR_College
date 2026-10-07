import { Router } from 'express';
import { db } from '../database/db.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/attendance/:studentId
router.get('/:studentId', authenticateToken, (req: AuthRequest, res) => {
  try {
    const studentIdParam = req.params.studentId;
    const student: any = db
      .prepare('SELECT id FROM students WHERE id = ? OR student_id = ? OR user_id = ?')
      .get(studentIdParam, studentIdParam, studentIdParam);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found.' });
    }

    const attendanceRecords = db.prepare(`
      SELECT ss.id, ss.attendance_percentage, ss.classes_conducted, ss.classes_attended,
             sub.subject_code, sub.subject_name, sub.credits, sub.semester
      FROM student_subjects ss
      JOIN subjects sub ON ss.subject_id = sub.id
      WHERE ss.student_id = ?
      ORDER BY sub.semester DESC, sub.subject_code ASC
    `).all(student.id) as any[];

    let totalConducted = 0;
    let totalAttended = 0;

    attendanceRecords.forEach((r) => {
      totalConducted += r.classes_conducted || 0;
      totalAttended += r.classes_attended || 0;
    });

    const overallPercentage =
      totalConducted > 0 ? Math.round((totalAttended / totalConducted) * 100 * 10) / 10 : 0;

    return res.json({
      success: true,
      overallPercentage,
      totalConducted,
      totalAttended,
      records: attendanceRecords,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error retrieving attendance.' });
  }
});

// PUT /api/attendance/:id (Update subject attendance counts)
router.put('/:id', authenticateToken, (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { classesConducted, classesAttended } = req.body;

    const cond = parseInt(classesConducted, 10);
    const att = parseInt(classesAttended, 10);

    if (att > cond) {
      return res.status(400).json({ success: false, message: 'Attended classes cannot exceed conducted classes.' });
    }

    const attPct = cond > 0 ? Math.round((att / cond) * 100 * 10) / 10 : 0;

    db.prepare(`
      UPDATE student_subjects 
      SET classes_conducted = ?, classes_attended = ?, attendance_percentage = ?
      WHERE id = ?
    `).run(cond, att, attPct, id);

    return res.json({
      success: true,
      message: 'Attendance updated successfully!',
      computed: { attendancePercentage: attPct },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error updating attendance.' });
  }
});

export default router;

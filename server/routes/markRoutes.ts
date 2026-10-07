import { Router } from 'express';
import { db } from '../database/db.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Helper to determine Grade and Grade Point from total marks using grading_rules
function calculateGrade(totalMarks: number) {
  const rules = db
    .prepare('SELECT * FROM grading_rules ORDER BY minimum_marks DESC')
    .all() as any[];

  for (const r of rules) {
    if (totalMarks >= r.minimum_marks && totalMarks <= r.maximum_marks) {
      return { grade: r.grade, gradePoint: r.grade_point };
    }
  }
  return { grade: 'F', gradePoint: 0.0 };
}

// GET /api/marks/:studentId
router.get('/:studentId', authenticateToken, (req: AuthRequest, res) => {
  try {
    const studentIdParam = req.params.id || req.params.studentId;
    const student: any = db
      .prepare('SELECT id FROM students WHERE id = ? OR student_id = ? OR user_id = ?')
      .get(studentIdParam, studentIdParam, studentIdParam);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found.' });
    }

    const marks = db.prepare(`
      SELECT ss.id, ss.student_id, ss.subject_id, ss.internal_marks, ss.external_marks, ss.total_marks,
             ss.grade, ss.grade_point, ss.attendance_percentage, ss.classes_conducted, ss.classes_attended,
             sub.subject_code, sub.subject_name, sub.credits, sub.semester, sub.department
      FROM student_subjects ss
      JOIN subjects sub ON ss.subject_id = sub.id
      WHERE ss.student_id = ?
      ORDER BY sub.semester ASC, sub.subject_code ASC
    `).all(student.id);

    return res.json({ success: true, marks });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error fetching marks.' });
  }
});

// POST or PUT /api/marks (Add or update student marks)
router.post('/', authenticateToken, (req: AuthRequest, res) => {
  try {
    const { studentId, subjectId, internalMarks, externalMarks, classesConducted, classesAttended } = req.body;

    const student: any = db
      .prepare('SELECT id FROM students WHERE id = ? OR student_id = ?')
      .get(studentId, studentId);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const internal = parseInt(internalMarks || 0, 10);
    const external = parseInt(externalMarks || 0, 10);
    const totalMarks = internal + external;
    const { grade, gradePoint } = calculateGrade(totalMarks);

    const cond = parseInt(classesConducted || 0, 10);
    const att = parseInt(classesAttended || 0, 10);
    const attPct = cond > 0 ? Math.round((att / cond) * 100 * 10) / 10 : 0.0;

    const existing: any = db
      .prepare('SELECT * FROM student_subjects WHERE student_id = ? AND subject_id = ?')
      .get(student.id, subjectId);

    if (existing) {
      db.prepare(`
        UPDATE student_subjects 
        SET internal_marks = ?,
            external_marks = ?,
            total_marks = ?,
            grade = ?,
            grade_point = ?,
            attendance_percentage = ?,
            classes_conducted = ?,
            classes_attended = ?
        WHERE id = ?
      `).run(internal, external, totalMarks, grade, gradePoint, attPct, cond, att, existing.id);
    } else {
      const id = `ss-${Date.now()}`;
      db.prepare(`
        INSERT INTO student_subjects (id, student_id, subject_id, internal_marks, external_marks, total_marks, grade, grade_point, attendance_percentage, classes_conducted, classes_attended)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, student.id, subjectId, internal, external, totalMarks, grade, gradePoint, attPct, cond, att);
    }

    return res.json({
      success: true,
      message: 'Marks updated successfully!',
      computed: { totalMarks, grade, gradePoint, attendancePercentage: attPct },
    });
  } catch (error: any) {
    console.error('Save marks error:', error);
    return res.status(500).json({ success: false, message: 'Error saving student marks.' });
  }
});

// PUT /api/marks/:id
router.put('/:id', authenticateToken, (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { internal_marks, external_marks, classes_conducted, classes_attended } = req.body;

    const existing: any = db.prepare('SELECT * FROM student_subjects WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Record not found.' });
    }

    const internal = internal_marks !== undefined ? parseInt(internal_marks, 10) : existing.internal_marks;
    const external = external_marks !== undefined ? parseInt(external_marks, 10) : existing.external_marks;
    const totalMarks = internal + external;
    const { grade, gradePoint } = calculateGrade(totalMarks);

    const cond = classes_conducted !== undefined ? parseInt(classes_conducted, 10) : existing.classes_conducted;
    const att = classes_attended !== undefined ? parseInt(classes_attended, 10) : existing.classes_attended;
    const attPct = cond > 0 ? Math.round((att / cond) * 100 * 10) / 10 : 0.0;

    db.prepare(`
      UPDATE student_subjects 
      SET internal_marks = ?,
          external_marks = ?,
          total_marks = ?,
          grade = ?,
          grade_point = ?,
          attendance_percentage = ?,
          classes_conducted = ?,
          classes_attended = ?
      WHERE id = ?
    `).run(internal, external, totalMarks, grade, gradePoint, attPct, cond, att, id);

    return res.json({ success: true, message: 'Marks updated successfully.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error updating marks.' });
  }
});

export default router;

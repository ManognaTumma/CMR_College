import { Router } from 'express';
import { db } from '../database/db.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/sgpa/:studentId (Get SGPA calculation or breakdown by semester)
router.get('/:studentId', authenticateToken, (req: AuthRequest, res) => {
  try {
    const studentIdParam = req.params.studentId;
    const student: any = db
      .prepare('SELECT id FROM students WHERE id = ? OR student_id = ? OR user_id = ?')
      .get(studentIdParam, studentIdParam, studentIdParam);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found.' });
    }

    const semesters = db
      .prepare('SELECT * FROM semesters WHERE student_id = ? ORDER BY semester_number ASC')
      .all(student.id);

    return res.json({ success: true, semesters });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error retrieving SGPA.' });
  }
});

// POST /api/sgpa/calculate (Calculate SGPA dynamically from items array)
router.post('/calculate', (req, res) => {
  try {
    const { subjects } = req.body; // Array of { credits, gradePoint } or { credits, totalMarks }

    if (!Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({ success: false, message: 'Subjects array is required.' });
    }

    let totalWeightedPoints = 0;
    let totalCredits = 0;

    const breakdown = subjects.map((sub: any) => {
      const credits = Number(sub.credits) || 0;
      let gradePoint = Number(sub.gradePoint);

      if (isNaN(gradePoint) && sub.totalMarks !== undefined) {
        // Derive grade point from total marks using grading rules
        const rules = db.prepare('SELECT * FROM grading_rules ORDER BY minimum_marks DESC').all() as any[];
        const matched = rules.find((r) => sub.totalMarks >= r.minimum_marks && sub.totalMarks <= r.maximum_marks);
        gradePoint = matched ? matched.grade_point : 0;
      }

      const weighted = credits * (gradePoint || 0);
      totalWeightedPoints += weighted;
      totalCredits += credits;

      return {
        subjectName: sub.subjectName || sub.subject_name || 'Subject',
        credits,
        gradePoint: gradePoint || 0,
        weightedPoints: weighted,
      };
    });

    const sgpa = totalCredits > 0 ? Math.round((totalWeightedPoints / totalCredits) * 100) / 100 : 0;

    return res.json({
      success: true,
      sgpa,
      totalCredits,
      totalWeightedPoints,
      formula: `SGPA = Σ(Credit × Grade Point) / Σ(Credits) = ${totalWeightedPoints.toFixed(2)} / ${totalCredits}`,
      breakdown,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error calculating SGPA.' });
  }
});

// POST /api/sgpa/save (Save SGPA result to DB for student semester)
router.post('/save', authenticateToken, (req: AuthRequest, res) => {
  try {
    const { studentId, semesterNumber, sgpa, totalCredits, passedSubjects, failedSubjects, attendancePercentage } = req.body;

    const student: any = db
      .prepare('SELECT id FROM students WHERE id = ? OR student_id = ?')
      .get(studentId, studentId);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found.' });
    }

    const semNum = parseInt(semesterNumber, 10);
    const existing: any = db
      .prepare('SELECT * FROM semesters WHERE student_id = ? AND semester_number = ?')
      .get(student.id, semNum);

    if (existing) {
      db.prepare(`
        UPDATE semesters 
        SET sgpa = ?, total_credits = ?, passed_subjects = ?, failed_subjects = ?, attendance_percentage = ?
        WHERE id = ?
      `).run(sgpa, totalCredits, passedSubjects || 0, failedSubjects || 0, attendancePercentage || 85.0, existing.id);
    } else {
      const semId = `sem-${Date.now()}`;
      db.prepare(`
        INSERT INTO semesters (id, student_id, semester_number, sgpa, total_credits, passed_subjects, failed_subjects, attendance_percentage)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(semId, student.id, semNum, sgpa, totalCredits, passedSubjects || 0, failedSubjects || 0, attendancePercentage || 85.0);
    }

    return res.json({ success: true, message: `Semester ${semNum} SGPA saved successfully!` });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error saving SGPA to semester record.' });
  }
});

export default router;

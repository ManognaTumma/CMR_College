import { Router } from 'express';
import { db } from '../database/db.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/cgpa/:studentId (Calculate & return student CGPA metrics)
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
      .prepare('SELECT * FROM semesters WHERE student_id = ? AND sgpa > 0 ORDER BY semester_number ASC')
      .all(student.id) as any[];

    if (semesters.length === 0) {
      return res.json({
        success: true,
        cgpa: 0,
        highestSgpa: 0,
        lowestSgpa: 0,
        averageSgpa: 0,
        totalCredits: 0,
        completedSemesters: 0,
        semesters: [],
      });
    }

    let totalWeightedSgpa = 0;
    let totalCredits = 0;
    let highestSgpa = 0;
    let lowestSgpa = 10;
    let sgpaSum = 0;

    semesters.forEach((sem) => {
      const sgpa = sem.sgpa;
      const credits = sem.total_credits || 15;

      totalWeightedSgpa += sgpa * credits;
      totalCredits += credits;
      sgpaSum += sgpa;

      if (sgpa > highestSgpa) highestSgpa = sgpa;
      if (sgpa < lowestSgpa) lowestSgpa = sgpa;
    });

    const cgpa = totalCredits > 0 ? Math.round((totalWeightedSgpa / totalCredits) * 100) / 100 : 0;
    const averageSgpa = Math.round((sgpaSum / semesters.length) * 100) / 100;

    return res.json({
      success: true,
      cgpa,
      highestSgpa,
      lowestSgpa: lowestSgpa === 10 ? 0 : lowestSgpa,
      averageSgpa,
      totalCredits,
      completedSemesters: semesters.length,
      semesters,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error calculating CGPA.' });
  }
});

// POST /api/cgpa/calculate (Calculate CGPA on custom dynamic semester inputs)
router.post('/calculate', (req, res) => {
  try {
    const { semesterData } = req.body; // Array of { semesterNumber, sgpa, credits }

    if (!Array.isArray(semesterData) || semesterData.length === 0) {
      return res.status(400).json({ success: false, message: 'Semester data array is required.' });
    }

    let totalWeightedSgpa = 0;
    let totalCredits = 0;
    let highestSgpa = 0;
    let lowestSgpa = 10;
    let sgpaSum = 0;

    const activeSemesters = semesterData.filter((s: any) => Number(s.sgpa) > 0);

    if (activeSemesters.length === 0) {
      return res.json({ success: true, cgpa: 0, highestSgpa: 0, lowestSgpa: 0, averageSgpa: 0, totalCredits: 0, completedSemesters: 0 });
    }

    activeSemesters.forEach((sem: any) => {
      const sgpa = Number(sem.sgpa);
      const credits = Number(sem.credits) || 15;

      totalWeightedSgpa += sgpa * credits;
      totalCredits += credits;
      sgpaSum += sgpa;

      if (sgpa > highestSgpa) highestSgpa = sgpa;
      if (sgpa < lowestSgpa) lowestSgpa = sgpa;
    });

    const cgpa = totalCredits > 0 ? Math.round((totalWeightedSgpa / totalCredits) * 100) / 100 : 0;
    const averageSgpa = Math.round((sgpaSum / activeSemesters.length) * 100) / 100;

    return res.json({
      success: true,
      cgpa,
      highestSgpa,
      lowestSgpa: lowestSgpa === 10 ? 0 : lowestSgpa,
      averageSgpa,
      totalCredits,
      completedSemesters: activeSemesters.length,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error calculating CGPA.' });
  }
});

export default router;

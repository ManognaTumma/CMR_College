import { Router } from 'express';
import { db } from '../database/db.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/notifications
router.get('/', authenticateToken, (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const student: any = db.prepare('SELECT id FROM students WHERE user_id = ?').get(userId);

    if (!student && req.user!.role === 'student') {
      return res.json({ success: true, notifications: [] });
    }

    let notifications: any[] = [];
    if (student) {
      notifications = db
        .prepare('SELECT * FROM notifications WHERE student_id = ? ORDER BY created_at DESC')
        .all(student.id);
    } else {
      // Admin sees general system alerts
      notifications = [
        {
          id: 'admin-notif-1',
          title: 'Semester 5 Marks Moderation Active',
          message: 'Faculty members are currently submitting external marks for Semester 5.',
          is_read: 0,
          created_at: new Date().toISOString(),
        },
        {
          id: 'admin-notif-2',
          title: 'Low Attendance Report Generated',
          message: '12 students across CSE and ECE have attendance below 75%.',
          is_read: 0,
          created_at: new Date().toISOString(),
        },
      ];
    }

    return res.json({ success: true, notifications });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error retrieving notifications.' });
  }
});

// PUT /api/notifications/:id/read (Mark notification as read)
router.put('/:id/read', authenticateToken, (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').run(id);
    return res.json({ success: true, message: 'Notification marked as read.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error updating notification.' });
  }
});

export default router;

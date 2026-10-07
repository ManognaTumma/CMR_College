import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { initDatabase } from './database/db.js';
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import subjectRoutes from './routes/subjectRoutes.js';
import markRoutes from './routes/markRoutes.js';
import sgpaRoutes from './routes/sgpaRoutes.js';
import cgpaRoutes from './routes/cgpaRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

dotenv.config();

// Initialize database schema and demo seed
initDatabase();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Route Mounts
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/marks', markRoutes);
app.use('/api/sgpa', sgpaRoutes);
app.use('/api/cgpa', cgpaRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'CMR University Student Information System API',
    institution: 'CMR Technical Campus',
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`🎓 CMR Academic Portal Backend API running on http://localhost:${PORT}`);
});

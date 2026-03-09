import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import connectDB from './src/config/db.js';
import errorHandler from './src/middleware/errorHandler.js';

// Role-based routes
import authRoutes from './src/routes/auth.routes.js';
import adminRoutes from './src/routes/admin.routes.js';
import staffRoutes from './src/routes/staff.routes.js';
import studentRoutes from './src/routes/student.routes.js';
import parentRoutes from './src/routes/parent.routes.js';

// Module routes (flat API consumed by frontend pages)
import studentsRoutes from './src/routes/students.routes.js';
import teachersRoutes from './src/routes/teachers.routes.js';
import classesRoutes from './src/routes/classes.routes.js';
import attendanceRoutes from './src/routes/attendance.routes.js';
import examsRoutes from './src/routes/exams.routes.js';
import feesRoutes from './src/routes/fees.routes.js';
import libraryRoutes from './src/routes/library.routes.js';
import transportRoutes from './src/routes/transport.routes.js';
import hostelRoutes from './src/routes/hostel.routes.js';
import communicationRoutes from './src/routes/communication.routes.js';
import counterRoutes from './src/routes/counter.routes.js';
import classConfigRoutes from './src/routes/classConfig.routes.js';
import classMappingRoutes from './src/routes/classMapping.routes.js';
import timetableRoutes from './src/routes/timetable.routes.js';
import homeworkRoutes from './src/routes/homework.routes.js';
import payrollRoutes from './src/routes/payroll.routes.js';
import documentRoutes from './src/routes/document.routes.js';
import lessonPlanRoutes from './src/routes/lessonPlan.routes.js';
import studyMaterialRoutes from './src/routes/studyMaterial.routes.js';
import notificationRoutes from './src/routes/notification.routes.js';
import substitutionRoutes from './src/routes/substitution.routes.js';
import scholarshipRoutes from './src/routes/scholarship.routes.js';

const app = express();

connectDB();

app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
  ],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Role-scoped routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/parent', parentRoutes);

// Module routes (matched by frontend pages)
app.use('/api/students', studentsRoutes);
app.use('/api/teachers', teachersRoutes);
app.use('/api/classes', classesRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/exams', examsRoutes);
app.use('/api/fees', feesRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/transport', transportRoutes);
app.use('/api/hostel', hostelRoutes);
app.use('/api/communication', communicationRoutes);
app.use('/api/counter', counterRoutes);
app.use('/api/class-config', classConfigRoutes);
app.use('/api/classmapping', classMappingRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/homework', homeworkRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/lesson-plans', lessonPlanRoutes);
app.use('/api/study-materials', studyMaterialRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/substitutions', substitutionRoutes);
app.use('/api/scholarships', scholarshipRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

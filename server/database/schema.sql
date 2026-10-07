-- CMR University / CMR Technical Campus Student Information System Schema
-- Compatible with PostgreSQL and SQLite

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT CHECK (role IN ('student', 'admin')) NOT NULL DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    student_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    department TEXT NOT NULL,
    branch TEXT NOT NULL,
    year INTEGER NOT NULL DEFAULT 1,
    semester INTEGER NOT NULL DEFAULT 1,
    batch TEXT NOT NULL,
    date_of_birth TEXT,
    address TEXT,
    profile_image TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS semesters (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    semester_number INTEGER NOT NULL,
    sgpa REAL DEFAULT 0.0,
    total_credits INTEGER DEFAULT 0,
    passed_subjects INTEGER DEFAULT 0,
    failed_subjects INTEGER DEFAULT 0,
    attendance_percentage REAL DEFAULT 0.0,
    UNIQUE(student_id, semester_number),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS subjects (
    id TEXT PRIMARY KEY,
    subject_code TEXT UNIQUE NOT NULL,
    subject_name TEXT NOT NULL,
    credits INTEGER NOT NULL,
    department TEXT NOT NULL,
    semester INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS student_subjects (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    internal_marks INTEGER DEFAULT 0,
    external_marks INTEGER DEFAULT 0,
    total_marks INTEGER DEFAULT 0,
    grade TEXT DEFAULT 'F',
    grade_point REAL DEFAULT 0.0,
    attendance_percentage REAL DEFAULT 0.0,
    classes_conducted INTEGER DEFAULT 0,
    classes_attended INTEGER DEFAULT 0,
    UNIQUE(student_id, subject_id),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS grading_rules (
    id TEXT PRIMARY KEY,
    grade TEXT UNIQUE NOT NULL,
    minimum_marks INTEGER NOT NULL,
    maximum_marks INTEGER NOT NULL,
    grade_point REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_students_dept ON students(department);
CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);
CREATE INDEX IF NOT EXISTS idx_student_subjects_student ON student_subjects(student_id);
CREATE INDEX IF NOT EXISTS idx_semesters_student ON semesters(student_id);

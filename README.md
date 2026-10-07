# CMR Technical Campus – Student Information & Grade Point Calculator

A complete, modern, responsive full-stack web application built for **CMR Technical Campus** to manage student information, subjects, marks, grades, SGPA calculation, CGPA simulation, attendance tracking, semester history archives, academic analytics charts, and administrator controls.

## 🚀 Technology Stack
- **Frontend**: React + TypeScript + Vite + Tailwind CSS + Lucide Icons + Recharts + Framer Motion + Canvas Confetti
- **Backend**: Node.js + Express + TypeScript + RESTful API layer
- **Authentication**: JWT token authentication + bcrypt password hashing + Role-based access (Student vs Admin)
- **Database**: SQLite (`better-sqlite3`) relational database with SQL schema scripts

## 🌟 Key Features
- 🏠 **Landing Page**: Modern hero section, CMR branding, 8 animated feature cards, quick demo login presets.
- 🔑 **Authentication System**: Student registration & login supporting Student ID or Email, remember me, and show/hide password.
- 📊 **Student Dashboard**: 6 summary cards with animated circular meters and live progress indicators.
- 👤 **Student Profile**: Roll No, Department, Branch, Batch, DOB, Address, with editable profile details.
- 📚 **Subject Management**: Semester-filtered subject grid, internal & external marks breakdown, add/edit/delete modals.
- 🧮 **SGPA Calculator**: Dynamic subject row builder, configurable grading scale matrix ($O, A^+, A, B^+, B, C, F$), SGPA formula breakdown, circular result meter, and database persistence.
- 📈 **CGPA Calculator**: Semester 1 to 8 simulation, overall CGPA circular gauge, highest/lowest/average SGPA metrics, total completed credits.
- 📚 **Semester History**: Semester cards with SGPA, pass/fail count, attendance %, and subject drill-down modal.
- 📅 **Attendance Tracker**: Subject attendance bars, color-coded threshold status badges (Green ≥ 75%, Yellow 65-74%, Red < 65%), and Bunk Safety Assistant.
- 📈 **Performance Analytics**: Visual Recharts line graphs for SGPA trajectory, subject marks bar charts, and grade distribution donut charts.
- 👨‍🎓 **Admin Suite**: Student Directory, global search/filters, Add/Edit/Delete student modal, grading rules editor, and CSV export.
- 🖨️ **Printable Report**: Official transcript generator formatted for PDF printing with institutional seals and signatures.

## 🏃 How to Run Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ManognaTumma/cmrtechnicalcampus.git
   cd cmrtechnicalcampus
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run Dev Server (Backend + Frontend)**:
   ```bash
   npm run dev
   ```
   - Frontend app running on: `http://localhost:3000`
   - Backend API running on: `http://localhost:5000`

## 🔑 Quick Demo Credentials
- **Student Login**:
  - Student ID: `217R1A0501`
  - Password: `student123`
- **Admin Login**:
  - Email: `admin@cmr.edu.in`
  - Password: `admin123`

---
© 2026 CMR Technical Campus. UGC Autonomous Institution, Hyderabad.

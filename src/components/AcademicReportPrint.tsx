import React from 'react';
import { StudentProfile, StudentSubjectMark, SemesterSummary } from '../types';

interface AcademicReportPrintProps {
  student: StudentProfile | null;
  marks: StudentSubjectMark[];
  semesters: SemesterSummary[];
  cgpa: number;
}

export const AcademicReportPrint: React.FC<AcademicReportPrintProps> = ({
  student,
  marks,
  semesters,
  cgpa,
}) => {
  if (!student) return null;

  return (
    <div className="p-8 bg-white text-slate-900 font-sans max-w-4xl mx-auto border border-slate-200 rounded-3xl shadow-sm print:border-none print:shadow-none print:p-0">
      {/* Official Header */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b-2 border-slate-900">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-wider text-sky-900">CMR TECHNICAL CAMPUS</h1>
          <p className="text-xs font-bold text-slate-600 uppercase">UGC Autonomous Institution | Accredited by NAAC & NBA</p>
          <p className="text-[11px] text-slate-500">Kandlakoya (V), Medchal Road, Hyderabad - 501401, Telangana</p>
        </div>
        <div className="text-right">
          <span className="px-3 py-1 bg-sky-900 text-white font-extrabold text-xs rounded-md uppercase tracking-wider">
            OFFICIAL TRANSCRIPT
          </span>
          <p className="text-[10px] text-slate-500 mt-2">Issued Date: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Student Details Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
        <div>
          <p className="text-slate-500">Student Name:</p>
          <p className="font-bold text-slate-900 text-sm">{student.full_name}</p>
        </div>
        <div>
          <p className="text-slate-500">Roll Number / Student ID:</p>
          <p className="font-bold font-mono text-slate-900 text-sm">{student.student_id}</p>
        </div>
        <div>
          <p className="text-slate-500">Department / Branch:</p>
          <p className="font-semibold text-slate-800">{student.department} - {student.branch}</p>
        </div>
        <div>
          <p className="text-slate-500">Academic Batch:</p>
          <p className="font-semibold text-slate-800">{student.batch}</p>
        </div>
      </div>

      {/* Semester Wise Marks Tables */}
      <div className="space-y-6">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 pb-1 border-b border-slate-300">
          Semester Course Breakdown & Grades
        </h2>

        {semesters.map((sem) => {
          const semMarks = marks.filter((m) => m.semester === sem.semester_number);
          return (
            <div key={sem.id} className="space-y-2">
              <div className="flex items-center justify-between font-bold text-xs bg-slate-100 p-2 rounded-lg">
                <span>Semester {sem.semester_number}</span>
                <span className="text-sky-800">SGPA: {sem.sgpa.toFixed(2)} | Credits: {sem.total_credits}</span>
              </div>

              <table className="w-full text-left text-xs border-collapse border border-slate-200">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                    <th className="p-2 border-r border-slate-200">Code</th>
                    <th className="p-2 border-r border-slate-200">Subject Title</th>
                    <th className="p-2 border-r border-slate-200 text-center">Credits</th>
                    <th className="p-2 border-r border-slate-200 text-center">Int (30)</th>
                    <th className="p-2 border-r border-slate-200 text-center">Ext (70)</th>
                    <th className="p-2 border-r border-slate-200 text-center">Total (100)</th>
                    <th className="p-2 border-r border-slate-200 text-center">Grade</th>
                    <th className="p-2 text-center">Grade Point</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {semMarks.map((m) => (
                    <tr key={m.id || m.subject_code}>
                      <td className="p-2 font-mono font-semibold border-r border-slate-200">{m.subject_code}</td>
                      <td className="p-2 border-r border-slate-200">{m.subject_name}</td>
                      <td className="p-2 text-center border-r border-slate-200">{m.credits}</td>
                      <td className="p-2 text-center border-r border-slate-200">{m.internal_marks}</td>
                      <td className="p-2 text-center border-r border-slate-200">{m.external_marks}</td>
                      <td className="p-2 text-center font-bold border-r border-slate-200">{m.total_marks}</td>
                      <td className="p-2 text-center font-extrabold text-sky-800 border-r border-slate-200">{m.grade}</td>
                      <td className="p-2 text-center font-semibold">{m.grade_point}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>

      {/* Summary Box */}
      <div className="mt-8 p-4 bg-sky-50 border-2 border-sky-200 rounded-2xl flex items-center justify-between">
        <div>
          <p className="text-xs text-sky-800 font-bold uppercase tracking-wider">CUMULATIVE GRADE POINT AVERAGE (CGPA)</p>
          <p className="text-xs text-slate-600">Calculated across all completed semesters</p>
        </div>
        <div className="text-right">
          <span className="text-3xl font-black text-sky-900">{cgpa.toFixed(2)}</span>
          <span className="text-xs font-bold text-sky-700 ml-1">/ 10.00</span>
        </div>
      </div>

      {/* Signatures */}
      <div className="mt-12 flex items-center justify-between pt-6 border-t border-slate-300 text-xs">
        <div className="text-center">
          <div className="h-10"></div>
          <p className="font-bold border-t border-slate-400 pt-1">Prepared By</p>
        </div>
        <div className="text-center">
          <div className="h-10"></div>
          <p className="font-bold border-t border-slate-400 pt-1">Controller of Examinations</p>
        </div>
        <div className="text-center">
          <div className="h-10"></div>
          <p className="font-bold border-t border-slate-400 pt-1">Principal / Director</p>
        </div>
      </div>
    </div>
  );
};

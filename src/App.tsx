import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { Dashboard } from './pages/Dashboard';
import { ProfilePage } from './pages/ProfilePage';
import { SubjectsPage } from './pages/SubjectsPage';
import { SGPACalculator } from './pages/SGPACalculator';
import { CGPACalculator } from './pages/CGPACalculator';
import { SemesterHistoryPage } from './pages/SemesterHistoryPage';
import { AttendancePage } from './pages/AttendancePage';
import { PerformanceChartsPage } from './pages/PerformanceChartsPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AcademicReportPrint } from './components/AcademicReportPrint';
import { apiFetch } from './utils/api';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  const [activeTab, setActiveTab] = useState<string>('landing');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Print Report States
  const [reportData, setReportData] = useState<any>({
    student: null,
    marks: [],
    semesters: [],
    cgpa: 8.78,
  });
  const [reportLoading, setReportLoading] = useState(false);

  const fetchPrintData = async () => {
    if (!user) return;
    try {
      setReportLoading(true);
      const [stdRes, subRes, semRes, cgpaRes] = await Promise.all([
        apiFetch(`/students/${user.id}`).catch(() => ({ success: false })),
        apiFetch(`/subjects?studentId=${user.id}`).catch(() => ({ success: false })),
        apiFetch(`/sgpa/${user.id}`).catch(() => ({ success: false })),
        apiFetch(`/cgpa/${user.id}`).catch(() => ({ success: false })),
      ]);

      setReportData({
        student: stdRes.student,
        marks: subRes.subjects || [],
        semesters: semRes.semesters || [],
        cgpa: cgpaRes.cgpa || 8.78,
      });
    } catch (err) {
      console.error('Report load error:', err);
    } finally {
      setReportLoading(false);
    }
  };

  const handleNavigate = (tab: string) => {
    if (tab === 'report') {
      fetchPrintData();
    }
    setActiveTab(tab);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl gradient-bg-primary flex items-center justify-center text-white font-black text-xl shadow-lg shadow-sky-500/30 animate-bounce mx-auto">
            CMR
          </div>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Loading CMR Academic Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-slate-950 transition-colors">
      <Navbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        activeTab={activeTab}
        setActiveTab={handleNavigate}
      />

      <div className="flex-1 flex">
        {user && (
          <Sidebar
            activeTab={activeTab}
            setActiveTab={handleNavigate}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {/* Unauthenticated Landing / Auth Router */}
          {!user ? (
            <>
              {activeTab === 'login' && <LoginPage onNavigate={handleNavigate} />}
              {activeTab === 'register' && <RegisterPage onNavigate={handleNavigate} />}
              {(activeTab === 'landing' || (activeTab !== 'login' && activeTab !== 'register')) && (
                <LandingPage onNavigate={handleNavigate} />
              )}
            </>
          ) : (
            <>
              {/* Student Views */}
              {(activeTab === 'dashboard' || activeTab === 'landing') && <Dashboard onNavigate={handleNavigate} />}
              {activeTab === 'profile' && <ProfilePage />}
              {activeTab === 'subjects' && <SubjectsPage />}
              {activeTab === 'marks' && <SubjectsPage />}
              {activeTab === 'sgpa-calc' && <SGPACalculator />}
              {activeTab === 'cgpa-calc' && <CGPACalculator />}
              {activeTab === 'attendance' && <AttendancePage />}
              {activeTab === 'performance' && <PerformanceChartsPage />}
              {activeTab === 'history' && <SemesterHistoryPage />}
              {activeTab === 'notifications' && <Dashboard onNavigate={handleNavigate} />}

              {/* Printable Official Report */}
              {activeTab === 'report' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center no-print">
                    <button
                      onClick={() => handleNavigate('dashboard')}
                      className="px-4 py-2 rounded-xl bg-slate-200 text-xs font-bold text-slate-700"
                    >
                      ← Back to Dashboard
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="px-6 py-2.5 rounded-xl gradient-bg-primary text-white text-xs font-bold shadow-lg"
                    >
                      Print Transcript (PDF)
                    </button>
                  </div>
                  {reportLoading ? (
                    <div className="p-8 text-center text-xs text-slate-400">Preparing official transcript...</div>
                  ) : (
                    <AcademicReportPrint
                      student={reportData.student}
                      marks={reportData.marks}
                      semesters={reportData.semesters}
                      cgpa={reportData.cgpa}
                    />
                  )}
                </div>
              )}

              {/* Admin Views */}
              {user.role === 'admin' &&
                (activeTab.startsWith('admin') || activeTab === 'dashboard') && (
                  <AdminDashboard />
                )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;

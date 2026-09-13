import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { ToastProvider } from './context/ToastContext.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { AuthModal } from './components/auth/AuthModal.tsx';
import { LandingHero } from './components/home/LandingHero.tsx';
import { StudentDashboard } from './components/student/StudentDashboard.tsx';
import { AdminPortal } from './components/admin/AdminPortal.tsx';
import { ShieldCheck, Heart } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');

  const handleOpenLogin = () => {
    setAuthInitialMode('login');
    setAuthModalOpen(true);
  };

  const handleOpenRegister = () => {
    setAuthInitialMode('register');
    setAuthModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-500">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold font-['Outfit']">Iniciando Voto Escolar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col font-['Plus_Jakarta_Sans'] transition-colors">
      <Navbar
        onOpenLogin={handleOpenLogin}
        onOpenRegister={handleOpenRegister}
      />

      <div className="flex-1">
        {!user ? (
          <LandingHero
            onOpenLogin={handleOpenLogin}
            onOpenRegister={handleOpenRegister}
          />
        ) : user.role === 'admin' ? (
          <AdminPortal />
        ) : (
          <StudentDashboard />
        )}
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Voto Escolar
            </span>
            <span>— Sistema Institucional de Elecciones y Finanzas del Curso</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <span>Democracia estudiantil garantizada con secreto del voto</span>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authInitialMode}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

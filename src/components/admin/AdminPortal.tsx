import React, { useState } from 'react';
import { AdminSidebar, AdminSection } from './AdminSidebar.tsx';
import { AdminOverview } from './AdminOverview.tsx';
import { AdminElections } from './AdminElections.tsx';
import { AdminCandidates } from './AdminCandidates.tsx';
import { AdminStudents } from './AdminStudents.tsx';
import { AdminResults } from './AdminResults.tsx';
import { AdminActivities } from './AdminActivities.tsx';
import { AdminFinances } from './AdminFinances.tsx';
import { AdminSettings } from './AdminSettings.tsx';
import { Menu } from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const [currentSection, setCurrentSection] = useState<AdminSection>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      {/* Sidebar Navigation */}
      <AdminSidebar
        currentSection={currentSection}
        onSelectSection={setCurrentSection}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Mobile Sub-Header to open menu */}
        <div className="lg:hidden p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold"
          >
            <Menu className="w-4 h-4" />
            Menú de Administración
          </button>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-['Outfit']">
            {currentSection}
          </span>
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentSection === 'dashboard' && (
            <AdminOverview onNavigate={(sec) => setCurrentSection(sec)} />
          )}
          {currentSection === 'elecciones' && <AdminElections />}
          {currentSection === 'candidatos' && <AdminCandidates />}
          {currentSection === 'estudiantes' && <AdminStudents />}
          {currentSection === 'resultados' && <AdminResults />}
          {currentSection === 'actividades' && <AdminActivities />}
          {currentSection === 'finanzas' && <AdminFinances />}
          {currentSection === 'configuracion' && <AdminSettings />}
        </main>
      </div>
    </div>
  );
};

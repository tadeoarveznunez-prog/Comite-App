import React from 'react';
import {
  LayoutDashboard,
  Vote,
  Users,
  GraduationCap,
  BarChart3,
  CalendarDays,
  DollarSign,
  Settings,
  X,
} from 'lucide-react';

export type AdminSection =
  | 'dashboard'
  | 'elecciones'
  | 'candidatos'
  | 'estudiantes'
  | 'resultados'
  | 'actividades'
  | 'finanzas'
  | 'configuracion';

interface AdminSidebarProps {
  currentSection: AdminSection;
  onSelectSection: (section: AdminSection) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentSection,
  onSelectSection,
  isOpenMobile,
  onCloseMobile,
}) => {
  const menuItems: { id: AdminSection; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'elecciones', label: 'Elecciones', icon: <Vote className="w-5 h-5" /> },
    { id: 'candidatos', label: 'Candidatos', icon: <Users className="w-5 h-5" /> },
    { id: 'estudiantes', label: 'Estudiantes', icon: <GraduationCap className="w-5 h-5" /> },
    { id: 'resultados', label: 'Resultados', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'actividades', label: 'Actividades', icon: <CalendarDays className="w-5 h-5" /> },
    { id: 'finanzas', label: 'Finanzas', icon: <DollarSign className="w-5 h-5" /> },
    { id: 'configuracion', label: 'Configuración', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between`}
      >
        <div className="p-4 overflow-y-auto">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800 lg:hidden">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Menú Administrativo</span>
            <button
              type="button"
              onClick={onCloseMobile}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-2">
            Panel de Control
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = currentSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectSection(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-colors text-left ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className={isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}>
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Info */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60">
            <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 block">
              Auditoría Segura
            </span>
            <span className="text-[10px] text-indigo-900/70 dark:text-indigo-400 leading-tight block mt-0.5">
              Urna digital anonimizada con registro único de votante.
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};

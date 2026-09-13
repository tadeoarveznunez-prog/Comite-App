import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useTheme } from '../context/ThemeContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import {
  Vote,
  Sun,
  Moon,
  LogOut,
  HelpCircle,
  Shield,
  GraduationCap,
  Sparkles,
  ChevronDown,
  UserCheck,
} from 'lucide-react';

interface NavbarProps {
  onOpenHelp: () => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenHelp, onOpenAuth }) => {
  const { user, logout, quickLoginAs } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const handleDemoSwitch = async (email: string, pass: string, roleName: string) => {
    setIsSwitching(true);
    setShowDemoMenu(false);
    try {
      await quickLoginAs(email, pass);
      showToast(`Has cambiado a la cuenta de ${roleName}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Error al cambiar de cuenta', 'error');
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
            <Vote className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5 font-['Outfit']">
              Comité App
            </span>
            <span className="hidden sm:block text-xs font-medium text-slate-500 dark:text-slate-400">
              Elecciones & Gestión Escolar
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Admin Quick Access for evaluation */}
          {!user && (
            <button
              type="button"
              onClick={() => handleDemoSwitch('admin@votoescolar.edu', 'Admin123!', 'Administrador')}
              disabled={isSwitching}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/70 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 transition-colors"
              title="Iniciar sesión directamente como Administrador"
            >
              <Shield className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>Acceso Admin</span>
            </button>
          )}

          {/* Help Button */}
          <button
            type="button"
            onClick={onOpenHelp}
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Ayuda y Funcionamiento del Sistema"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          {/* Dark mode toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>

          {/* User Session Info or Login/Register buttons */}
          {user ? (
            <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">
                  Hola, {user.name}
                </span>
                <div className="flex items-center justify-end gap-1.5 mt-0.5">
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300'
                    }`}
                  >
                    {user.role === 'admin' ? 'Administrador' : user.course || 'Estudiante'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={logout}
                className="p-2 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenAuth('login')}
                className="px-3.5 py-1.5 text-sm font-semibold text-slate-700 hover:text-indigo-600 dark:text-slate-200 dark:hover:text-indigo-400 transition-colors"
              >
                Acceder
              </button>
              <button
                type="button"
                onClick={() => onOpenAuth('register')}
                className="px-4 py-1.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all active:scale-98"
              >
                Registrarse
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

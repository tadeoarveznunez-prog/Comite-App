import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { Election, Activity } from '../../types.ts';
import { api } from '../../services/api.ts';
import {
  Vote,
  ShieldCheck,
  Users,
  Coins,
  ArrowRight,
  Sparkles,
  Calendar,
  Lock,
  GraduationCap,
  TrendingUp,
} from 'lucide-react';

interface LandingHeroProps {
  onOpenLogin: () => void;
  onOpenRegister: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onOpenLogin, onOpenRegister }) => {
  const { login } = useAuth();
  const [elections, setElections] = useState<Election[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [demoLoading, setDemoLoading] = useState(false);

  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        const [elecs, acts] = await Promise.all([
          api.getElections(),
          api.getActivities(),
        ]);
        setElections(elecs);
        setActivities(acts);
      } catch (e) {
        console.error('Error fetching public info:', e);
      }
    };
    fetchPublicData();
  }, []);

  const handleQuickDemoLogin = async (email: string, pass: string) => {
    setDemoLoading(true);
    try {
      await login(email, pass);
    } catch (e) {
      console.error('Demo login error:', e);
    } finally {
      setDemoLoading(false);
    }
  };

  const activeElection = elections.find((e) => e.status === 'activa');

  return (
    <div className="space-y-16 pb-16">
      {/* Main Hero Header */}
      <section className="relative overflow-hidden pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-indigo-500/15 via-violet-500/10 to-teal-500/15 blur-3xl -z-10 rounded-full" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 text-xs font-bold mb-6">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          Democracia Digital y Gestión Estudiantil Institucional
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight font-['Outfit'] max-w-3xl mx-auto leading-tight">
          Voz, Voto y Transparencia en tu <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 bg-clip-text text-transparent">Colegio</span>
        </h1>

        <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Plataforma oficial para elecciones estudiantiles, votación con secreto garantizado y seguimiento financiero transparente de las actividades del curso.
        </p>

        {/* Call to Actions & Demo Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={onOpenLogin}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <Vote className="w-4 h-4" />
            Acceder a Votar
          </button>

          <button
            type="button"
            onClick={onOpenRegister}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 font-bold text-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 transition-all"
          >
            <GraduationCap className="w-4 h-4" />
            Registrarme como Estudiante
          </button>
        </div>

        {/* 1-Click Quick Demo Switcher */}
        <div className="mt-6 pt-6 border-t border-slate-200/60 dark:border-slate-800/80 max-w-md mx-auto">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">
            Ingreso Rápido de Prueba (Demo)
          </span>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              disabled={demoLoading}
              onClick={() => handleQuickDemoLogin('estudiante@colegio.edu', 'demo123')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors border border-slate-200/70 dark:border-slate-700"
            >
              🎓 Entrar como Alumno Demo
            </button>
            <button
              type="button"
              disabled={demoLoading}
              onClick={() => handleQuickDemoLogin('admin@colegio.edu', 'admin123')}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 text-xs font-bold text-indigo-700 dark:text-indigo-300 transition-colors border border-indigo-200/80 dark:border-indigo-800"
            >
              ⚡ Entrar como Administrador
            </button>
          </div>
        </div>
      </section>

      {/* Feature Pillar Cards */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-['Outfit']">
              1 Estudiante = 1 Solo Voto
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Validación en el servidor con inmunidad a votación duplicada. La plataforma bloquea automáticamente intentos repetidos y emite un comprobante verificable.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-['Outfit']">
              Urna con Voto Secreto
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              La identidad del alumno se registra para auditar asistencia al proceso, pero su elección es separada y encriptada en la urna anónima.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Coins className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-['Outfit']">
              Finanzas & Actividades Lucrativas
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Registro contable claro de ventas de comida, rifas y kermeses con balance automático (Ingresos - Gastos = Ganancia) y seguimiento de metas.
            </p>
          </div>
        </div>
      </section>

      {/* Public Preview Section (Elections & Activities) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white font-['Outfit']">
              Elecciones en Calendario
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Conoce los procesos democráticos programados para este periodo escolar.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenLogin}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            Iniciar sesión para votar →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {elections.slice(0, 2).map((elec) => (
            <div
              key={elec.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      elec.status === 'activa'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                        : elec.status === 'pendiente'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {elec.status}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(elec.startDate).toLocaleDateString('es-ES')} - {new Date(elec.endDate).toLocaleDateString('es-ES')}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-['Outfit'] mb-1">
                  {elec.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed mb-4">
                  {elec.description}
                </p>
              </div>

              <button
                type="button"
                onClick={onOpenLogin}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1.5"
              >
                Ingresar para participar
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

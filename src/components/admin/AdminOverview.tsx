import React, { useEffect, useState } from 'react';
import { AdminDashboardStats, AuditLog } from '../../types.ts';
import { api } from '../../services/api.ts';
import { AdminSection } from './AdminSidebar.tsx';
import {
  GraduationCap,
  Vote,
  CheckCircle2,
  Percent,
  CalendarCheck,
  DollarSign,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  PlusCircle,
  RefreshCw,
} from 'lucide-react';

interface AdminOverviewProps {
  onNavigate: (section: AdminSection) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, logsData] = await Promise.all([
        api.getAdminStats(),
        api.getAuditLogs(),
      ]);
      setStats(statsData);
      setRecentLogs(logsData.slice(0, 6));
    } catch (err) {
      console.error('Error fetching admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-['Outfit']">
            Panel de Control Institucional
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Resumen en tiempo real del proceso eleccionario estudiantil y finanzas del curso.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
          <button
            type="button"
            onClick={() => onNavigate('elecciones')}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Nueva Elección
          </button>
        </div>
      </div>

      {/* 6 Metric Cards specified in requirements */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* 1. Estudiantes registrados */}
        <div
          onClick={() => onNavigate('estudiantes')}
          className="cursor-pointer p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Padrón Estudiantil
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white font-['Outfit']">
            {stats?.registeredStudentsCount ?? 0}
          </p>
          <p className="text-xs font-semibold text-slate-500 mt-1 flex items-center justify-between">
            <span>Estudiantes registrados</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500" />
          </p>
        </div>

        {/* 2. Elecciones activas */}
        <div
          onClick={() => onNavigate('elecciones')}
          className="cursor-pointer p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Elecciones en Curso
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Vote className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-['Outfit']">
            {stats?.activeElectionsCount ?? 0}
          </p>
          <p className="text-xs font-semibold text-slate-500 mt-1 flex items-center justify-between">
            <span>Elecciones activas</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-500" />
          </p>
        </div>

        {/* 3. Votos realizados */}
        <div
          onClick={() => onNavigate('resultados')}
          className="cursor-pointer p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md hover:border-violet-300 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Urna Digital
            </span>
            <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white font-['Outfit']">
            {stats?.totalVotesCount ?? 0}
          </p>
          <p className="text-xs font-semibold text-slate-500 mt-1 flex items-center justify-between">
            <span>Votos realizados</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-violet-500" />
          </p>
        </div>

        {/* 4. Participación % */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Convocatoria Cívica
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-blue-600 dark:text-blue-400 font-['Outfit']">
            {stats?.globalParticipationPercentage ?? 0}%
          </p>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Participación electoral promedio
          </p>
        </div>

        {/* 5. Actividades realizadas */}
        <div
          onClick={() => onNavigate('actividades')}
          className="cursor-pointer p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md hover:border-amber-300 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Eventos del Curso
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white font-['Outfit']">
            {stats?.activitiesCount ?? 0}
          </p>
          <p className="text-xs font-semibold text-slate-500 mt-1 flex items-center justify-between">
            <span>Actividades realizadas</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-amber-500" />
          </p>
        </div>

        {/* 6. Ganancias acumuladas */}
        <div
          onClick={() => onNavigate('finanzas')}
          className="cursor-pointer p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md hover:border-teal-300 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Fondos Recaudados
            </span>
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-teal-600 dark:text-teal-400 font-['Outfit']">
            ${(stats?.accumulatedProfit ?? 0).toLocaleString('es-ES')}
          </p>
          <p className="text-xs font-semibold text-slate-500 mt-1 flex items-center justify-between">
            <span>Ganancias acumuladas (Ingresos - Gastos)</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-teal-500" />
          </p>
        </div>
      </div>

      {/* Quick Action Hub & System Activity Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Hub */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit']">
            Accesos Rápidos de Gestión
          </h3>
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => onNavigate('elecciones')}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-750 border border-slate-200/70 dark:border-slate-700 hover:border-indigo-400 flex items-center justify-between transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <Vote className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Gestionar Elecciones</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => onNavigate('candidatos')}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-750 border border-slate-200/70 dark:border-slate-700 hover:border-indigo-400 flex items-center justify-between transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <GraduationCap className="w-4 h-4 text-violet-600" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Administrar Candidatos</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => onNavigate('actividades')}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-750 border border-slate-200/70 dark:border-slate-700 hover:border-emerald-400 flex items-center justify-between transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <CalendarCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Registrar Nueva Actividad</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => onNavigate('finanzas')}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-750 border border-slate-200/70 dark:border-slate-700 hover:border-teal-400 flex items-center justify-between transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="w-4 h-4 text-teal-600" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Consultar Reporte Financiero</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Recent Audit Trail */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              Registro Reciente de Auditoría y Actividad
            </h3>
            <button
              type="button"
              onClick={() => onNavigate('configuracion')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Ver todos
            </button>
          </div>

          <div className="space-y-3">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800 flex items-start justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {log.action}
                    </span>
                    <span className="text-[10px] text-slate-400">({log.user})</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 mt-0.5">
                    {log.details}
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

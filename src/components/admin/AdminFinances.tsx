import React, { useState, useEffect } from 'react';
import { FinancialSummary, CourseGoal } from '../../types.ts';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Scale,
  Target,
  Plus,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  RefreshCw,
  X,
} from 'lucide-react';

export const AdminFinances: React.FC = () => {
  const { showToast } = useToast();
  const [finances, setFinances] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Goal modal
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTargetAmount, setGoalTargetAmount] = useState<number>(500000);
  const [goalDeadline, setGoalDeadline] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [submittingGoal, setSubmittingGoal] = useState(false);

  const loadFinances = async () => {
    setLoading(true);
    try {
      const data = await api.getFinances();
      setFinances(data);
    } catch (err) {
      console.error('Error fetching finances:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinances();
  }, []);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim() || !goalTargetAmount) return;

    setSubmittingGoal(true);
    try {
      await api.createCourseGoal({
        title: goalTitle,
        targetAmount: Number(goalTargetAmount),
        deadline: goalDeadline ? new Date(goalDeadline).toISOString() : new Date().toISOString(),
        description: goalDescription,
      });
      showToast('Meta del curso creada con éxito.', 'success');
      setIsGoalModalOpen(false);
      setGoalTitle('');
      setGoalDescription('');
      loadFinances();
    } catch (err: any) {
      showToast(err.message || 'Error al guardar la meta.', 'error');
    } finally {
      setSubmittingGoal(false);
    }
  };

  // Export financial balance report
  const exportBalanceReport = () => {
    if (!finances) return;
    let text = `REPORTE FINANCIERO OFICIAL - VOTO ESCOLAR\n`;
    text += `Fecha emisión: ${new Date().toLocaleString('es-ES')}\n\n`;
    text += `Total Ingresos: $${finances.totalIncome}\n`;
    text += `Total Gastos: $${finances.totalExpenses}\n`;
    text += `Ganancia Neta Acumulada: $${finances.netProfit}\n\n`;
    text += `DETALLE DE ACTIVIDADES:\n`;
    finances.activitiesBreakdown.forEach((a) => {
      text += `- ${a.name} (${a.category}): Ingresos $${a.income} | Gastos $${a.expenses} | Margen $${a.profit}\n`;
    });
    text += `\nMETAS DEL CURSO:\n`;
    finances.goals.forEach((g) => {
      text += `- ${g.title}: Meta $${g.targetAmount} | Recaudado $${g.currentAmount} (${g.percentageReached}%)\n`;
    });

    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `balance_financiero_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showToast('Reporte descargado correctamente', 'success');
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white font-['Outfit']">
            Módulo de Finanzas & Tesorería
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Control de ingresos, egresos, balance neto acumulado y seguimiento de metas pro-curso.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={exportBalanceReport}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            Descargar Balance
          </button>

          <button
            type="button"
            onClick={() => setIsGoalModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm shadow-indigo-600/20 transition-all active:scale-98"
          >
            <Plus className="w-4 h-4" />
            Nueva Meta
          </button>
        </div>
      </div>

      {/* Main 3 Financial Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Ingresos Totales
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-['Outfit']">
            ${(finances?.totalIncome ?? 0).toLocaleString('es-ES')}
          </p>
          <p className="text-xs text-slate-400 mt-1">Recaudación bruta por actividades</p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Gastos Incurridos
            </span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-rose-600 dark:text-rose-400 font-['Outfit']">
            ${(finances?.totalExpenses ?? 0).toLocaleString('es-ES')}
          </p>
          <p className="text-xs text-slate-400 mt-1">Costos de insumos y logística</p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Ganancia Neta Disponible
            </span>
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-teal-600 dark:text-teal-400 font-['Outfit']">
            ${(finances?.netProfit ?? 0).toLocaleString('es-ES')}
          </p>
          <p className="text-xs text-slate-400 mt-1">Fondo líquido disponible en caja</p>
        </div>
      </div>

      {/* Course Goals Progress Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-600" />
              Metas del Curso (Graduación, Polerones, Viaje)
            </h3>
            <p className="text-xs text-slate-500">
              Progreso financiado automáticamente a partir de la ganancia neta del curso.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsGoalModalOpen(true)}
            className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
          >
            + Añadir Meta
          </button>
        </div>

        {finances?.goals && finances.goals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {finances.goals.map((g) => (
              <div
                key={g.id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-850 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-base font-['Outfit']">
                      {g.title}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-1">{g.description}</p>
                  </div>
                  <span className="text-xs text-slate-400 flex items-center gap-1 shrink-0 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    Plazo: {new Date(g.deadline).toLocaleDateString('es-ES')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-600 dark:text-slate-300">
                    Recaudado: <strong>${g.currentAmount.toLocaleString('es-ES')}</strong>
                  </span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                    Meta: ${g.targetAmount.toLocaleString('es-ES')} ({g.percentageReached}%)
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-3 bg-slate-200/80 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-teal-500 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(g.percentageReached, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-4">No hay metas registradas aún.</p>
        )}
      </div>

      {/* Detail Table of Activities and Margins */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white font-['Outfit']">
          Desglose Financiero por Actividad
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3">Actividad</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3 text-right">Ingresos</th>
                <th className="px-4 py-3 text-right">Gastos</th>
                <th className="px-4 py-3 text-right">Ganancia Neta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {finances?.activitiesBreakdown.map((act) => (
                <tr key={act.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                    {act.name}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{act.category}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(act.date).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-800 dark:text-slate-200">
                    ${act.income.toLocaleString('es-ES')}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-rose-600 dark:text-rose-400">
                    -${act.expenses.toLocaleString('es-ES')}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                    +${act.profit.toLocaleString('es-ES')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Goal Modal */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-5 bg-indigo-600 text-white flex items-center justify-between">
              <h3 className="text-base font-bold font-['Outfit']">Crear Nueva Meta del Curso</h3>
              <button
                type="button"
                onClick={() => setIsGoalModalOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="p-6 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre de la Meta <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Polerones de Graduación 4° Medio"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Monto Objetivo ($) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={goalTargetAmount}
                  onChange={(e) => setGoalTargetAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Fecha Límite
                </label>
                <input
                  type="date"
                  value={goalDeadline}
                  onChange={(e) => setGoalDeadline(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Descripción
                </label>
                <textarea
                  rows={2}
                  placeholder="Detalles sobre el uso del fondo..."
                  value={goalDescription}
                  onChange={(e) => setGoalDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsGoalModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingGoal}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all disabled:opacity-50"
                >
                  {submittingGoal ? 'Guardando...' : 'Crear Meta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

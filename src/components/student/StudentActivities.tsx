import React, { useState, useEffect } from 'react';
import { Activity } from '../../types.ts';
import { api } from '../../services/api.ts';
import { Calendar, DollarSign, TrendingUp, Search, Tag, RefreshCw } from 'lucide-react';

export const StudentActivities: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const loadActivities = async () => {
    setLoading(true);
    try {
      const data = await api.getActivities();
      setActivities(data);
    } catch (err) {
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  const filtered = activities.filter((act) => {
    const matchesSearch =
      `${act.name} ${act.description} ${act.responsible}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || act.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalAccumulatedProfit = activities.reduce((acc, a) => acc + (a.profit || 0), 0);
  const totalIncome = activities.reduce((acc, a) => acc + (a.income || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-700/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-200">
              Fondo Común y Eventos del Curso
            </span>
            <h2 className="text-2xl font-black font-['Outfit'] mt-0.5">
              Actividades con Fines Lucrativos
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-xl">
              Registro transparente de kermeses, rifas y ventas organizadas para financiar las metas colectivas del curso y la graduación.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-4 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20">
              <span className="text-[11px] font-semibold text-emerald-100 block">Ganancia Neta Total</span>
              <span className="text-2xl font-black font-['Outfit']">
                ${totalAccumulatedProfit.toLocaleString('es-ES')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar actividad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Todas las Categorías</option>
            <option value="Kermés">Kermés</option>
            <option value="Rifa">Rifa</option>
            <option value="Venta">Venta</option>
            <option value="Deportes">Deportes</option>
            <option value="Cultural">Cultural</option>
            <option value="Otro">Otro</option>
          </select>

          <button
            type="button"
            onClick={loadActivities}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors"
            title="Recargar actividades"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Activities Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-500">
          <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-2 text-emerald-600" />
          <p className="text-xs">Cargando actividades...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center text-slate-500 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800">
          No hay actividades que coincidan con la búsqueda.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((act) => (
            <div
              key={act.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <Tag className="w-3 h-3" />
                    {act.category}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(act.date).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-['Outfit'] mb-1">
                  {act.name}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                  {act.description}
                </p>

                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  <strong>Responsable:</strong> {act.responsible}
                </p>
              </div>

              {/* Financial Box */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 grid grid-cols-3 gap-2 text-center bg-slate-50/70 dark:bg-slate-900/40 p-3 rounded-2xl">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Ingresos</span>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    ${act.income.toLocaleString('es-ES')}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Gastos</span>
                  <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
                    -${act.expenses.toLocaleString('es-ES')}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                    Ganancia
                  </span>
                  <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 font-['Outfit']">
                    +${act.profit.toLocaleString('es-ES')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Activity } from '../../types.ts';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';
import { ConfirmModal } from '../ui/ConfirmModal.tsx';
import {
  CalendarDays,
  Plus,
  Edit2,
  Trash2,
  DollarSign,
  Download,
  Search,
  Tag,
  Calendar,
  X,
} from 'lucide-react';

export const AdminActivities: React.FC = () => {
  const { showToast } = useToast();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal create/edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    responsible: '',
    income: 0,
    expenses: 0,
    status: 'en curso' as Activity['status'],
    category: 'Venta' as Activity['category'],
  });

  // Delete modal
  const [activityToDelete, setActivityToDelete] = useState<Activity | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

  const openCreateModal = () => {
    setEditingActivity(null);
    setFormData({
      name: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      responsible: '',
      income: 0,
      expenses: 0,
      status: 'en curso',
      category: 'Venta',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (act: Activity) => {
    setEditingActivity(act);
    setFormData({
      name: act.name,
      description: act.description,
      date: act.date ? act.date.slice(0, 10) : '',
      responsible: act.responsible,
      income: act.income,
      expenses: act.expenses,
      status: act.status,
      category: act.category,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.responsible.trim() || !formData.date) {
      showToast('Por favor completa los campos requeridos.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (editingActivity) {
        await api.updateActivity(editingActivity.id, {
          ...formData,
          income: Number(formData.income),
          expenses: Number(formData.expenses),
        });
        showToast('Actividad actualizada correctamente.', 'success');
      } else {
        await api.createActivity({
          ...formData,
          income: Number(formData.income),
          expenses: Number(formData.expenses),
        });
        showToast('Actividad registrada exitosamente.', 'success');
      }
      setIsModalOpen(false);
      loadActivities();
    } catch (err: any) {
      showToast(err.message || 'Error al guardar la actividad.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!activityToDelete) return;
    setSubmitting(true);
    try {
      await api.deleteActivity(activityToDelete.id);
      showToast(`Actividad "${activityToDelete.name}" eliminada.`, 'success');
      setActivityToDelete(null);
      loadActivities();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Export activities to CSV
  const exportActivitiesCSV = () => {
    let csv = 'data:text/csv;charset=utf-8,';
    csv += 'ID,Actividad,Categoria,Fecha,Responsable,Estado,Ingresos,Gastos,Ganancia Neta\n';
    activities.forEach((a) => {
      csv += `"${a.id}","${a.name}","${a.category}","${a.date}","${a.responsible}","${a.status}",${a.income},${a.expenses},${a.profit}\n`;
    });

    const encoded = encodeURI(csv);
    const aTag = document.createElement('a');
    aTag.href = encoded;
    aTag.download = `actividades_curso_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(aTag);
    aTag.click();
    document.body.removeChild(aTag);
    showToast('Resumen de actividades exportado en CSV', 'success');
  };

  const filtered = activities.filter((a) => {
    const matchesCategory = categoryFilter === 'all' || a.category === categoryFilter;
    const matchesSearch =
      `${a.name} ${a.description} ${a.responsible}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const calculatedProfitPreview = (Number(formData.income) || 0) - (Number(formData.expenses) || 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white font-['Outfit']">
            Actividades del Curso (Fines Lucrativos)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Registra rifas, kermeses, ventas benéficas y eventos pro-fondos para el curso o graduación.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={exportActivitiesCSV}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar Resumen
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm shadow-emerald-600/20 transition-all active:scale-98"
          >
            <Plus className="w-4 h-4" />
            Nueva Actividad
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por actividad o responsable..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">Todas las Categorías</option>
          <option value="Rifa">Rifas</option>
          <option value="Kermés">Kermés</option>
          <option value="Venta">Ventas</option>
          <option value="Deportes">Deportes</option>
          <option value="Cultural">Cultural</option>
          <option value="Otro">Otro</option>
        </select>
      </div>

      {/* Activities Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-500">Cargando actividades...</div>
      ) : filtered.length === 0 ? (
        <div className="p-10 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700">
          <CalendarDays className="w-10 h-10 mx-auto text-slate-400 mb-2" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No hay actividades registradas</p>
          <p className="text-xs text-slate-500 mt-1">Registra la primera actividad lucrativa para iniciar el balance.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((act) => (
            <div
              key={act.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <Tag className="w-3 h-3" />
                    {act.category}
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      act.status === 'finalizada'
                        ? 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                        : act.status === 'en curso'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                    }`}
                  >
                    {act.status}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-['Outfit'] mb-1">
                  {act.name}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-3">
                  {act.description}
                </p>

                <div className="space-y-1 text-xs text-slate-500 mb-4">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Fecha: {new Date(act.date).toLocaleDateString('es-ES')}</span>
                  </div>
                  <div>
                    <strong>Responsable:</strong> {act.responsible}
                  </div>
                </div>
              </div>

              {/* Financial calculations */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60">
                <div className="grid grid-cols-3 gap-1 bg-slate-50 dark:bg-slate-750 p-2.5 rounded-2xl text-center mb-3">
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
                    <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-['Outfit']">
                      +${act.profit.toLocaleString('es-ES')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(act)}
                    className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivityToDelete(act)}
                    className="p-2 rounded-xl text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Create / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
            <div className="p-5 bg-emerald-600 text-white flex items-center justify-between">
              <h3 className="text-base font-bold font-['Outfit']">
                {editingActivity ? 'Editar Actividad' : 'Registrar Nueva Actividad'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre de la Actividad <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Kermés Primaveral 2026"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Descripción
                </label>
                <textarea
                  rows={2}
                  placeholder="Objetivo y detalles organizativos..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Fecha Realización <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Responsable / Comisión <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Tesorería 4° Medio"
                    value={formData.responsible}
                    onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Categoría
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Rifa">Rifa</option>
                    <option value="Kermés">Kermés</option>
                    <option value="Venta">Venta de comida</option>
                    <option value="Deportes">Torneo deportivo</option>
                    <option value="Cultural">Festival cultural</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Estado de Actividad
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="planificada">Planificada</option>
                    <option value="en curso">En Curso</option>
                    <option value="finalizada">Finalizada</option>
                  </select>
                </div>
              </div>

              {/* Financial Inputs & Auto-Calculation */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">
                  Balance Económico (Ganancia = Ingresos - Gastos)
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1 text-xs">
                      Ingresos Totales ($)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={formData.income}
                      onChange={(e) => setFormData({ ...formData, income: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1 text-xs">
                      Gastos Incurridos ($)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={formData.expenses}
                      onChange={(e) => setFormData({ ...formData, expenses: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Ganancia Estimada / Neta:</span>
                  <span className={`text-base font-black font-['Outfit'] ${calculatedProfitPreview >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    ${calculatedProfitPreview.toLocaleString('es-ES')}
                  </span>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all disabled:opacity-50"
                >
                  {submitting ? 'Guardando...' : editingActivity ? 'Actualizar' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={Boolean(activityToDelete)}
        title="¿Eliminar Actividad?"
        message={`Esta acción eliminará la actividad "${activityToDelete?.name}" y su registro de ingresos/gastos del balance general. ¿Deseas continuar?`}
        confirmText="Sí, Eliminar"
        cancelText="Cancelar"
        variant="danger"
        loading={submitting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setActivityToDelete(null)}
      />
    </div>
  );
};

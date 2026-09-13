import React, { useState, useEffect } from 'react';
import { Candidate, Election } from '../../types.ts';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';
import { ConfirmModal } from '../ui/ConfirmModal.tsx';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Search,
  Award,
  BookOpen,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  X,
} from 'lucide-react';

const PHOTO_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
];

export const AdminCandidates: React.FC = () => {
  const { showToast } = useToast();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedElectionFilter, setSelectedElectionFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal create/edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [formData, setFormData] = useState({
    electionId: '',
    name: '',
    lastName: '',
    course: '4° Medio A',
    position: '',
    photoUrl: PHOTO_PRESETS[0],
    proposal: '',
    active: true,
  });

  // Delete modal
  const [candidateToDelete, setCandidateToDelete] = useState<Candidate | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [candData, elecData] = await Promise.all([
        api.getCandidates(),
        api.getElections(),
      ]);
      setCandidates(candData);
      setElections(elecData);
      if (elecData.length > 0 && !formData.electionId) {
        setFormData((prev) => ({ ...prev, electionId: elecData[0].id }));
      }
    } catch (err) {
      console.error('Error fetching candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingCandidate(null);
    setFormData({
      electionId: elections[0]?.id || '',
      name: '',
      lastName: '',
      course: '4° Medio A',
      position: '',
      photoUrl: PHOTO_PRESETS[Math.floor(Math.random() * PHOTO_PRESETS.length)],
      proposal: '',
      active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cand: Candidate) => {
    setEditingCandidate(cand);
    setFormData({
      electionId: cand.electionId,
      name: cand.name,
      lastName: cand.lastName,
      course: cand.course,
      position: cand.position,
      photoUrl: cand.photoUrl,
      proposal: cand.proposal,
      active: cand.active,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.lastName.trim() || !formData.position.trim() || !formData.electionId) {
      showToast('Por favor completa todos los campos requeridos.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (editingCandidate) {
        await api.updateCandidate(editingCandidate.id, formData);
        showToast('Candidato actualizado con éxito.', 'success');
      } else {
        await api.createCandidate(formData);
        showToast('Candidato agregado correctamente.', 'success');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Error al guardar el candidato.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!candidateToDelete) return;
    setSubmitting(true);
    try {
      await api.deleteCandidate(candidateToDelete.id);
      showToast(`Candidato "${candidateToDelete.name} ${candidateToDelete.lastName}" eliminado.`, 'success');
      setCandidateToDelete(null);
      loadData();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleCandidateActive = async (cand: Candidate) => {
    try {
      const next = !cand.active;
      await api.updateCandidate(cand.id, { active: next });
      showToast(
        `Candidato ${cand.name} ${cand.lastName} ahora está ${next ? 'ACTIVO' : 'INACTIVO'} para votar.`,
        'info'
      );
      loadData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const filtered = candidates.filter((c) => {
    const matchesElection = selectedElectionFilter === 'all' || c.electionId === selectedElectionFilter;
    const matchesSearch =
      `${c.name} ${c.lastName} ${c.position} ${c.course} ${c.proposal}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    return matchesElection && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white font-['Outfit']">
            Padrón de Candidatos
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Administra los postulantes, sus fotografías, propuestas de campaña y estado de habilitación.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          disabled={elections.length === 0}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm shadow-indigo-600/20 transition-all active:scale-98 self-start sm:self-auto disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          Nuevo Candidato
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, cargo o propuesta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="w-full sm:w-auto flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 shrink-0">Filtrar por Elección:</span>
          <select
            value={selectedElectionFilter}
            onChange={(e) => setSelectedElectionFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Todas las Elecciones ({candidates.length})</option>
            {elections.map((elec) => (
              <option key={elec.id} value={elec.id}>
                {elec.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Candidate Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-500">Cargando candidatos...</div>
      ) : filtered.length === 0 ? (
        <div className="p-10 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700">
          <Users className="w-10 h-10 mx-auto text-slate-400 mb-2" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No se encontraron candidatos</p>
          <p className="text-xs text-slate-500 mt-1">Registra nuevos candidatos asociados a las elecciones creadas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((cand) => {
            const elec = elections.find((e) => e.id === cand.electionId);
            return (
              <div
                key={cand.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-3 mb-3">
                    <img
                      src={cand.photoUrl}
                      alt={`${cand.name} ${cand.lastName}`}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 shadow-xs"
                      onError={(e) => {
                        (e.target as HTMLElement).setAttribute(
                          'src',
                          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80'
                        );
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider truncate">
                          {cand.course}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleCandidateActive(cand)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
                            cand.active
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                          }`}
                          title="Clic para alternar estado activo/inactivo"
                        >
                          {cand.active ? 'Activo' : 'Inactivo'}
                        </button>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                        {cand.name} {cand.lastName}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1 mt-0.5 truncate">
                        <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="truncate">{cand.position}</span>
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-100 dark:border-slate-700/60 mb-3">
                    <span className="text-[10px] font-bold text-slate-400 block mb-1">Elección Vinculada:</span>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {elec ? elec.title : 'Elección desconocida'}
                    </p>
                  </div>

                  <div className="mb-4">
                    <span className="text-[11px] font-bold text-slate-400 block mb-1">Propuesta de Campaña:</span>
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                      {cand.proposal || 'Sin propuesta detallada.'}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(cand)}
                    className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 transition-colors"
                    title="Editar candidato"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCandidateToDelete(cand)}
                    className="p-2 rounded-xl text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 transition-colors"
                    title="Eliminar candidato"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Create / Edit Candidate */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
            <div className="p-5 bg-indigo-600 text-white flex items-center justify-between">
              <h3 className="text-base font-bold font-['Outfit']">
                {editingCandidate ? 'Editar Candidato' : 'Inscribir Nuevo Candidato'}
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
                  Elección a la que se postula <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.electionId}
                  onChange={(e) => setFormData({ ...formData, electionId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {elections.map((elec) => (
                    <option key={elec.id} value={elec.id}>
                      {elec.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nombre <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Sofía"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Apellido <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Silva Díaz"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Curso Representado <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: 4° Medio A"
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Cargo / Lista <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Presidente CCEE - Lista A"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Photo selector */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Fotografía del Candidato (URL o Preset)
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="url"
                    value={formData.photoUrl}
                    onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                    placeholder="https://ejemplo.com/foto.jpg"
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  />
                  <img
                    src={formData.photoUrl}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    className="w-9 h-9 rounded-xl object-cover border border-slate-200"
                    onError={(e) => {
                      (e.target as HTMLElement).setAttribute('src', PHOTO_PRESETS[0]);
                    }}
                  />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <span className="text-[10px] text-slate-400 font-semibold shrink-0">Presets:</span>
                  {PHOTO_PRESETS.map((preset, i) => (
                    <img
                      key={i}
                      src={preset}
                      alt={`Preset ${i}`}
                      referrerPolicy="no-referrer"
                      onClick={() => setFormData({ ...formData, photoUrl: preset })}
                      className={`w-8 h-8 rounded-lg object-cover cursor-pointer border-2 transition-all ${
                        formData.photoUrl === preset ? 'border-indigo-600 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Propuesta o Descripción de Campaña
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe los ejes clave de su candidatura..."
                  value={formData.proposal}
                  onChange={(e) => setFormData({ ...formData, proposal: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs">
                    Candidato activo (Aparecerá en la papeleta de votación)
                  </span>
                </label>
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
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all disabled:opacity-50"
                >
                  {submitting ? 'Guardando...' : editingCandidate ? 'Actualizar' : 'Inscribir'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={Boolean(candidateToDelete)}
        title="¿Eliminar Candidato?"
        message={`¿Estás seguro de eliminar a "${candidateToDelete?.name} ${candidateToDelete?.lastName}" de la elección? Esta acción no se puede deshacer.`}
        confirmText="Sí, Eliminar"
        cancelText="Cancelar"
        variant="danger"
        loading={submitting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setCandidateToDelete(null)}
      />
    </div>
  );
};

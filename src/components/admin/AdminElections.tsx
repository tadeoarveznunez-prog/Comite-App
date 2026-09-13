import React, { useState, useEffect } from 'react';
import { Election, ElectionType, Candidate, ActivityOption } from '../../types.ts';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';
import { ConfirmModal } from '../ui/ConfirmModal.tsx';
import {
  Vote,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Play,
  Square,
  Calendar,
  X,
  Search,
  Users,
  Compass,
  CheckCircle2,
  Layers,
  Clock,
  Sparkles,
  MapPin,
  DollarSign,
  Info,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';

interface CandidateDraft {
  name: string;
  lastName: string;
  course: string;
  position: string;
  photoUrl: string;
  proposal: string;
}

interface ActivityDraft {
  title: string;
  description: string;
  proposedDate: string;
  location: string;
  estimatedCost: number | '';
  imageUrl: string;
  additionalInfo: string;
}

export const AdminElections: React.FC = () => {
  const { showToast } = useToast();
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'comite' | 'actividad'>('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal create/edit state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<'type_selection' | 'details'>('type_selection');
  const [editingElection, setEditingElection] = useState<Election | null>(null);

  // Form State
  const [selectedType, setSelectedType] = useState<ElectionType>('comite');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetCourse, setTargetCourse] = useState('Todos los cursos');
  const [availablePositionsInput, setAvailablePositionsInput] = useState('Presidente, Vicepresidente, Tesorero, Secretario');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<Election['status']>('pendiente');
  const [showResultsToStudents, setShowResultsToStudents] = useState(false);
  const [allowVoteModification, setAllowVoteModification] = useState(false);

  // Dynamic drafts for initial items during creation
  const [candidatesDraft, setCandidatesDraft] = useState<CandidateDraft[]>([]);
  const [activitiesDraft, setActivitiesDraft] = useState<ActivityDraft[]>([]);

  // Current draft being added in modal
  const [newCand, setNewCand] = useState<CandidateDraft>({
    name: '',
    lastName: '',
    course: '',
    position: '',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    proposal: '',
  });

  const [newAct, setNewAct] = useState<ActivityDraft>({
    title: '',
    description: '',
    proposedDate: '',
    location: '',
    estimatedCost: '',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&auto=format&fit=crop&q=80',
    additionalInfo: '',
  });

  // Delete modal confirmation
  const [electionToDelete, setElectionToDelete] = useState<Election | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  const fetchElections = async () => {
    setLoading(true);
    try {
      const data = await api.getElections();
      setElections(data);
    } catch (err) {
      console.error('Error fetching elections:', err);
      showToast('Error al conectar con el servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElections();
  }, []);

  const openCreateModal = () => {
    setEditingElection(null);
    setModalStep('type_selection');
    setSelectedType('comite');
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

    setTitle('');
    setDescription('');
    setTargetCourse('Todos los cursos');
    setAvailablePositionsInput('Presidente, Vicepresidente, Tesorero, Secretario');
    setStartDate(`${today}T08:00`);
    setEndDate(`${nextWeek}T18:00`);
    setStatus('pendiente');
    setShowResultsToStudents(false);
    setAllowVoteModification(false);

    // Initial default mock items for convenience
    setCandidatesDraft([
      {
        name: 'Camila',
        lastName: 'Valenzuela',
        course: '3° Medio A',
        position: 'Presidenta',
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        proposal: 'Más áreas verdes, fomento deportivo y canales digitales de sugerencias estudiantiles.',
      },
      {
        name: 'Benjamín',
        lastName: 'Soto',
        course: '3° Medio B',
        position: 'Presidente',
        photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
        proposal: 'Talleres extracurriculares de música, ciencia y apoyo pedagógico para todos los cursos.',
      },
    ]);

    setActivitiesDraft([
      {
        title: 'Kermés Benéfica de Primavera',
        description: 'Jornada familiar con stands gastronómicos, juegos típicos y competencias por alianza.',
        proposedDate: `${nextWeek}T10:00`,
        location: 'Patio Central del Colegio',
        estimatedCost: 150000,
        imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&auto=format&fit=crop&q=80',
        additionalInfo: 'Recaudación destinada al fondo de gira de estudios y mejoras de salas.',
      },
      {
        title: 'Torneo Interescolar de Baby Fútbol y Vóleibol',
        description: 'Campeonato deportivo con medallas, copas y venta de bebidas y colaciones saludables.',
        proposedDate: `${nextWeek}T14:00`,
        location: 'Gimnasio Techado',
        estimatedCost: 80000,
        imageUrl: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?w=600&auto=format&fit=crop&q=80',
        additionalInfo: 'Inscripción abierta por equipos de curso con árbitros invitados.',
      },
    ]);

    setIsModalOpen(true);
  };

  const openEditModal = (elec: Election) => {
    setEditingElection(elec);
    setModalStep('details');
    setSelectedType(elec.type || 'comite');
    setTitle(elec.title);
    setDescription(elec.description);
    setTargetCourse(elec.targetCourse || 'Todos los cursos');
    setAvailablePositionsInput(
      Array.isArray(elec.availablePositions)
        ? elec.availablePositions.join(', ')
        : elec.availablePositions || ''
    );
    setStartDate(elec.startDate ? elec.startDate.slice(0, 16) : '');
    setEndDate(elec.endDate ? elec.endDate.slice(0, 16) : '');
    setStatus(elec.status);
    setShowResultsToStudents(Boolean(elec.showResultsToStudents));
    setAllowVoteModification(Boolean(elec.allowVoteModification));
    setIsModalOpen(true);
  };

  const handleAddCandidateDraft = () => {
    if (!newCand.name.trim() || !newCand.lastName.trim()) {
      showToast('Ingresa al menos nombre y apellido del candidato.', 'error');
      return;
    }
    setCandidatesDraft([...candidatesDraft, { ...newCand, course: newCand.course || targetCourse }]);
    setNewCand({
      name: '',
      lastName: '',
      course: targetCourse,
      position: '',
      photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
      proposal: '',
    });
    showToast('Candidato agregado al borrador.', 'success');
  };

  const handleAddActivityDraft = () => {
    if (!newAct.title.trim()) {
      showToast('El título de la actividad es obligatorio.', 'error');
      return;
    }
    setActivitiesDraft([...activitiesDraft, { ...newAct }]);
    setNewAct({
      title: '',
      description: '',
      proposedDate: '',
      location: '',
      estimatedCost: '',
      imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&auto=format&fit=crop&q=80',
      additionalInfo: '',
    });
    showToast('Opción de actividad agregada al borrador.', 'success');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startDate || !endDate) {
      showToast('Por favor completa todos los campos requeridos (título y fechas).', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const positionsArray = availablePositionsInput
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);

      if (editingElection) {
        await api.updateElection(editingElection.id, {
          title,
          description,
          targetCourse,
          availablePositions: positionsArray,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
          status,
          showResultsToStudents,
          allowVoteModification,
        });
        showToast('Elección actualizada correctamente.', 'success');
      } else {
        await api.createElection({
          title,
          description,
          type: selectedType,
          targetCourse,
          availablePositions: positionsArray,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
          status,
          showResultsToStudents,
          allowVoteModification,
          initialCandidates: selectedType === 'comite' ? candidatesDraft : [],
          initialActivityOptions:
            selectedType === 'actividad'
              ? activitiesDraft.map((a) => ({
                  ...a,
                  estimatedCost: Number(a.estimatedCost) || 0,
                }))
              : [],
        });
        showToast(
          selectedType === 'comite'
            ? '¡Elección de Comité creada exitosamente en la base de datos!'
            : '¡Elección de Actividad creada exitosamente en la base de datos!',
          'success'
        );
      }
      setIsModalOpen(false);
      fetchElections();
    } catch (err: any) {
      showToast(err.message || 'Error al guardar la elección.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDuplicate = async (elec: Election) => {
    setDuplicatingId(elec.id);
    try {
      const duplicated = await api.duplicateElection(elec.id);
      showToast(`Elección duplicada exitosamente: "${duplicated.title}"`, 'success');
      fetchElections();
    } catch (err: any) {
      showToast(err.message || 'Error al duplicar la elección.', 'error');
    } finally {
      setDuplicatingId(null);
    }
  };

  const toggleStatus = async (elec: Election, newStatus: Election['status']) => {
    try {
      await api.updateElection(elec.id, { status: newStatus });
      showToast(`Estado de "${elec.title}" actualizado a "${newStatus}".`, 'success');
      fetchElections();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const toggleResultsVisibility = async (elec: Election) => {
    try {
      const nextVal = !elec.showResultsToStudents;
      await api.updateElection(elec.id, { showResultsToStudents: nextVal });
      showToast(
        nextVal ? 'Resultados ahora son VISIBLES para estudiantes.' : 'Resultados OCULTOS para estudiantes.',
        'info'
      );
      fetchElections();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!electionToDelete) return;
    setSubmitting(true);
    try {
      await api.deleteElection(electionToDelete.id);
      showToast(`Elección "${electionToDelete.title}" eliminada de la base de datos.`, 'success');
      setElectionToDelete(null);
      fetchElections();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Distinct courses for filter
  const uniqueCourses = Array.from(
    new Set(elections.map((e) => e.targetCourse).filter(Boolean))
  ) as string[];

  const filtered = elections.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.targetCourse || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' || e.type === typeFilter;
    const matchesCourse = courseFilter === 'all' || e.targetCourse === courseFilter;
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;

    return matchesSearch && matchesType && matchesCourse && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-indigo-600" />
            Gestión y Creación de Elecciones
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Crea elecciones dinámicas de Comité Estudiantil o Votación de Actividades, programa fechas, duplica plantillas y abre urnas.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm shadow-indigo-600/20 transition-all active:scale-98 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Crear Elección
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, descripción o curso..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500">Tipo:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
          >
            <option value="all">Todos los tipos</option>
            <option value="comite">👥 Elección de Comité</option>
            <option value="actividad">🎯 Elección de Actividad</option>
          </select>
        </div>

        {/* Course Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500">Curso:</span>
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
          >
            <option value="all">Todos los cursos</option>
            {uniqueCourses.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500">Estado:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
          >
            <option value="all">Todos los estados</option>
            <option value="activa">🟢 Activa (Abierta)</option>
            <option value="pendiente">🟡 Programada (Pendiente)</option>
            <option value="finalizada">⚪ Finalizada (Cerrada)</option>
          </select>
        </div>
      </div>

      {/* Elections Cards List */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
          <p className="text-xs font-semibold">Cargando elecciones desde la base de datos...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-10 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700">
          <Vote className="w-12 h-12 mx-auto text-slate-400 mb-2" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No se encontraron elecciones</p>
          <p className="text-xs text-slate-500 mt-1">
            Haz clic en "Crear Elección" para configurar una nueva elección de Comité o de Actividad.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((elec) => {
            const isActivity = elec.type === 'actividad';
            return (
              <div
                key={elec.id}
                className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-sm transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                <div className="flex-1 min-w-0">
                  {/* Badges Row */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {/* Type Badge */}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 ${
                        isActivity
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                          : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                      }`}
                    >
                      {isActivity ? <Compass className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                      {isActivity ? 'Elección de Actividad' : 'Elección de Comité'}
                    </span>

                    {/* Status Badge */}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        elec.status === 'activa'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                          : elec.status === 'pendiente'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {elec.status === 'activa' ? '🟢 Activa' : elec.status === 'pendiente' ? '🟡 Programada' : '⚪ Finalizada'}
                    </span>

                    {/* Target Course Badge */}
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      Curso: {elec.targetCourse || 'Todos los cursos'}
                    </span>

                    {/* Results Visibility Badge */}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                        elec.showResultsToStudents
                          ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {elec.showResultsToStudents ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {elec.showResultsToStudents ? 'Resultados visibles' : 'Resultados ocultos'}
                    </span>

                    {/* Modification badge if enabled */}
                    {elec.allowVoteModification && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        Permite cambio de voto
                      </span>
                    )}

                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(elec.startDate).toLocaleDateString('es-ES')} al{' '}
                      {new Date(elec.endDate).toLocaleDateString('es-ES')}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white font-['Outfit']">
                    {elec.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-2xl line-clamp-2">
                    {elec.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2.5">
                    {isActivity ? (
                      <span>
                        Opciones de actividad registradas:{' '}
                        <strong className="text-slate-700 dark:text-slate-200">
                          {elec.activityOptionsCount || 0}
                        </strong>
                      </span>
                    ) : (
                      <>
                        <span>
                          Candidatos inscritos:{' '}
                          <strong className="text-slate-700 dark:text-slate-200">
                            {elec.candidatesCount || 0}
                          </strong>
                        </span>
                        {elec.availablePositions && (
                          <span>
                            Cargos:{' '}
                            <strong className="text-slate-700 dark:text-slate-200">
                              {Array.isArray(elec.availablePositions)
                                ? elec.availablePositions.join(', ')
                                : elec.availablePositions}
                            </strong>
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Action Controls */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {/* Abrir / Cerrar elección antes de tiempo */}
                  {elec.status !== 'activa' ? (
                    <button
                      type="button"
                      onClick={() => toggleStatus(elec, 'activa')}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 transition-colors"
                      title="Abrir elección a votación estudiantil"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Abrir Elección
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggleStatus(elec, 'finalizada')}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center gap-1.5 transition-colors"
                      title="Cerrar o finalizar elección antes de tiempo"
                    >
                      <Square className="w-3.5 h-3.5" />
                      Finalizar Urna
                    </button>
                  )}

                  {/* Duplicate election */}
                  <button
                    type="button"
                    disabled={duplicatingId === elec.id}
                    onClick={() => handleDuplicate(elec)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    title="Duplicar esta elección como plantilla para reutilizarla"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {duplicatingId === elec.id ? 'Duplicando...' : 'Duplicar'}
                  </button>

                  {/* Toggle Results Visibility */}
                  <button
                    type="button"
                    onClick={() => toggleResultsVisibility(elec)}
                    className="p-2 rounded-xl text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    title={elec.showResultsToStudents ? 'Ocultar resultados a los alumnos' : 'Mostrar resultados a los alumnos'}
                  >
                    {elec.showResultsToStudents ? <EyeOff className="w-4 h-4 text-indigo-600" /> : <Eye className="w-4 h-4" />}
                  </button>

                  {/* Edit */}
                  <button
                    type="button"
                    onClick={() => openEditModal(elec)}
                    className="p-2 rounded-xl text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    title="Editar detalles y parámetros de la elección"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => setElectionToDelete(elec)}
                    className="p-2 rounded-xl text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 transition-colors"
                    title="Eliminar elección"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-indigo-700 to-violet-700 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center border border-white/20">
                  <Vote className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-['Outfit']">
                    {editingElection ? 'Editar Elección' : 'Crear Nueva Elección'}
                  </h3>
                  <p className="text-[11px] text-indigo-100">
                    {modalStep === 'type_selection' && !editingElection
                      ? 'Paso 1: Elige el tipo de proceso democrático'
                      : selectedType === 'comite'
                      ? 'Configuración de Elección de Comité Estudiantil'
                      : 'Configuración de Elección de Actividad'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* STEP 1: Type Selection (Only for new elections) */}
            {modalStep === 'type_selection' && !editingElection ? (
              <div className="p-6 sm:p-8 space-y-6">
                <div className="text-center max-w-md mx-auto">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white font-['Outfit']">
                    ¿Qué tipo de elección deseas crear?
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Selecciona una modalidad para cargar candidatos a cargos o propuestas de actividades comunitarias.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Option 1: Elección de Comité */}
                  <div
                    onClick={() => {
                      setSelectedType('comite');
                      setModalStep('details');
                    }}
                    className="cursor-pointer p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-600 dark:hover:border-indigo-500 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition-all flex flex-col justify-between group shadow-2xs"
                  >
                    <div>
                      <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                        <Users className="w-6 h-6" />
                      </div>
                      <h5 className="text-base font-extrabold text-slate-900 dark:text-white font-['Outfit'] mb-1">
                        1. Elección de Comité
                      </h5>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Para elegir representantes o miembros de un comité estudiantil (Presidente, Vicepresidente, Delegados, etc.).
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      <span>Configurar Comité</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Option 2: Elección de Actividad */}
                  <div
                    onClick={() => {
                      setSelectedType('actividad');
                      setModalStep('details');
                    }}
                    className="cursor-pointer p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-purple-600 dark:hover:border-purple-500 hover:bg-purple-50/40 dark:hover:bg-purple-950/20 transition-all flex flex-col justify-between group shadow-2xs"
                  >
                    <div>
                      <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                        <Compass className="w-6 h-6" />
                      </div>
                      <h5 className="text-base font-extrabold text-slate-900 dark:text-white font-['Outfit'] mb-1">
                        2. Elección de Actividad
                      </h5>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Para que los estudiantes voten entre diferentes alternativas de actividades o proyectos que el curso quiera realizar.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-purple-600 dark:text-purple-400">
                      <span>Configurar Actividades</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              /* STEP 2: Details & Candidate/Activity Loading */
              <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto flex-1 text-xs sm:text-sm">
                {!editingElection && (
                  <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500">Tipo de Elección:</span>
                      <span className="font-extrabold text-indigo-600 dark:text-indigo-400 uppercase text-xs">
                        {selectedType === 'comite' ? '👥 Elección de Comité' : '🎯 Elección de Actividad'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setModalStep('type_selection')}
                      className="text-xs text-slate-500 hover:text-indigo-600 underline"
                    >
                      Cambiar tipo
                    </button>
                  </div>
                )}

                {/* General Fields */}
                <div className="space-y-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Nombre de la Elección <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={
                        selectedType === 'comite'
                          ? 'Ej: Elección Centro de Alumnos 2026'
                          : 'Ej: Votación Actividad de Fin de Año 2026'
                      }
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Descripción
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Explica el objetivo de la votación..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Curso / Grado Dirigido
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: Todos los cursos, 3° Medio A, etc."
                        value={targetCourse}
                        onChange={(e) => setTargetCourse(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    {selectedType === 'comite' && (
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Cargos Disponibles (separados por coma)
                        </label>
                        <input
                          type="text"
                          placeholder="Presidente, Vicepresidente, Tesorero"
                          value={availablePositionsInput}
                          onChange={(e) => setAvailablePositionsInput(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Fecha y Hora de Inicio <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Fecha y Hora de Finalización <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Candidate or Activity Loading Section (Only for creation) */}
                {!editingElection && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                    {selectedType === 'comite' ? (
                      /* Candidates Builder */
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs sm:text-sm">
                            <Users className="w-4 h-4 text-indigo-600" />
                            Candidatos a la Elección ({candidatesDraft.length})
                          </label>
                        </div>

                        {/* List of draft candidates */}
                        <div className="space-y-2">
                          {candidatesDraft.map((c, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="flex items-center gap-3">
                                <img
                                  src={c.photoUrl}
                                  alt={c.name}
                                  referrerPolicy="no-referrer"
                                  className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                                />
                                <div>
                                  <p className="font-bold text-slate-800 dark:text-white">
                                    {c.name} {c.lastName}{' '}
                                    <span className="font-normal text-slate-500">
                                      ({c.position || 'Candidato'} - {c.course})
                                    </span>
                                  </p>
                                  <p className="text-[11px] text-slate-400 line-clamp-1">{c.proposal}</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setCandidatesDraft(candidatesDraft.filter((_, i) => i !== idx))}
                                className="text-rose-500 hover:text-rose-700 p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Add Candidate Subform */}
                        <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/60 space-y-2 text-xs">
                          <span className="font-bold text-indigo-900 dark:text-indigo-300 block">
                            + Cargar Nuevo Candidato
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="Nombre"
                              value={newCand.name}
                              onChange={(e) => setNewCand({ ...newCand, name: e.target.value })}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                            />
                            <input
                              type="text"
                              placeholder="Apellido"
                              value={newCand.lastName}
                              onChange={(e) => setNewCand({ ...newCand, lastName: e.target.value })}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="Cargo (Ej: Presidenta)"
                              value={newCand.position}
                              onChange={(e) => setNewCand({ ...newCand, position: e.target.value })}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                            />
                            <input
                              type="text"
                              placeholder="Curso del candidato"
                              value={newCand.course}
                              onChange={(e) => setNewCand({ ...newCand, course: e.target.value })}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                            />
                          </div>

                          <input
                            type="text"
                            placeholder="URL de Foto (o dejar por defecto)"
                            value={newCand.photoUrl}
                            onChange={(e) => setNewCand({ ...newCand, photoUrl: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                          />

                          <textarea
                            rows={2}
                            placeholder="Propuestas o descripción del candidato..."
                            value={newCand.proposal}
                            onChange={(e) => setNewCand({ ...newCand, proposal: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                          />

                          <button
                            type="button"
                            onClick={handleAddCandidateDraft}
                            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                          >
                            Agregar Candidato a la Lista
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Activity Options Builder */
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs sm:text-sm">
                            <Compass className="w-4 h-4 text-purple-600" />
                            Actividades / Opciones a Votación ({activitiesDraft.length})
                          </label>
                        </div>

                        {/* List of draft activities */}
                        <div className="space-y-2">
                          {activitiesDraft.map((act, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="flex items-center gap-3">
                                {act.imageUrl && (
                                  <img
                                    src={act.imageUrl}
                                    alt={act.title}
                                    referrerPolicy="no-referrer"
                                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                                  />
                                )}
                                <div>
                                  <p className="font-bold text-slate-800 dark:text-white">{act.title}</p>
                                  <p className="text-[11px] text-slate-400">
                                    {act.location ? `📍 ${act.location}` : ''}{' '}
                                    {act.estimatedCost ? `• Costo: $${Number(act.estimatedCost).toLocaleString()}` : ''}
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setActivitiesDraft(activitiesDraft.filter((_, i) => i !== idx))}
                                className="text-rose-500 hover:text-rose-700 p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Add Activity Subform */}
                        <div className="p-3.5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/60 space-y-2 text-xs">
                          <span className="font-bold text-purple-900 dark:text-purple-300 block">
                            + Cargar Opción de Actividad
                          </span>
                          <input
                            type="text"
                            placeholder="Nombre de la actividad (Ej: Kermés de Primavera)"
                            value={newAct.title}
                            onChange={(e) => setNewAct({ ...newAct, title: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                          />

                          <textarea
                            rows={2}
                            placeholder="Descripción de la actividad..."
                            value={newAct.description}
                            onChange={(e) => setNewAct({ ...newAct, description: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                          />

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <input
                              type="text"
                              placeholder="Lugar propuesto"
                              value={newAct.location}
                              onChange={(e) => setNewAct({ ...newAct, location: e.target.value })}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                            />
                            <input
                              type="number"
                              placeholder="Costo estimado ($)"
                              value={newAct.estimatedCost}
                              onChange={(e) =>
                                setNewAct({
                                  ...newAct,
                                  estimatedCost: e.target.value ? Number(e.target.value) : '',
                                })
                              }
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                            />
                            <input
                              type="datetime-local"
                              placeholder="Fecha propuesta"
                              value={newAct.proposedDate}
                              onChange={(e) => setNewAct({ ...newAct, proposedDate: e.target.value })}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                            />
                          </div>

                          <input
                            type="text"
                            placeholder="URL de Imagen (opcional)"
                            value={newAct.imageUrl}
                            onChange={(e) => setNewAct({ ...newAct, imageUrl: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                          />

                          <input
                            type="text"
                            placeholder="Información adicional (requisitos, responsables, etc.)"
                            value={newAct.additionalInfo}
                            onChange={(e) => setNewAct({ ...newAct, additionalInfo: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                          />

                          <button
                            type="button"
                            onClick={handleAddActivityDraft}
                            className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
                          >
                            Agregar Opción de Actividad a la Lista
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Settings Controls: Status, Results Visibility & Vote Modification */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs uppercase tracking-wider">
                    Configuraciones y Reglas de la Elección
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Estado Inicial
                      </label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="pendiente">🟡 Pendiente (Programada / Sin abrir)</option>
                        <option value="activa">🟢 Activa (Urnas abiertas para votar)</option>
                        <option value="finalizada">⚪ Finalizada (Votación cerrada)</option>
                      </select>
                    </div>

                    <div className="space-y-2 pt-1">
                      {/* Show results immediately or only at finish */}
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showResultsToStudents}
                          onChange={(e) => setShowResultsToStudents(e.target.checked)}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs">
                          Mostrar resultados inmediatamente a los estudiantes
                        </span>
                      </label>

                      {/* Allow vote modification before closure */}
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={allowVoteModification}
                          onChange={(e) => setAllowVoteModification(e.target.checked)}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs">
                          Permitir que los estudiantes cambien su voto antes del cierre
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Submit & Cancel */}
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
                    className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all disabled:opacity-50 shadow-sm shadow-indigo-600/20"
                  >
                    {submitting ? 'Guardando...' : editingElection ? 'Actualizar Elección' : 'Crear Elección en Base de Datos'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={Boolean(electionToDelete)}
        title="¿Eliminar Elección Definitivamente?"
        message={`Esta acción eliminará la elección "${electionToDelete?.title}", sus candidatos u opciones de actividad y todos los votos anonimizados registrados de forma permanente. Esta acción no se puede deshacer.`}
        confirmText="Sí, Eliminar de la Base de Datos"
        cancelText="Cancelar"
        variant="danger"
        loading={submitting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setElectionToDelete(null)}
      />
    </div>
  );
};

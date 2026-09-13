import React, { useState, useEffect, useRef } from 'react';
import { User } from '../../types.ts';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';
import { ConfirmModal } from '../ui/ConfirmModal.tsx';
import {
  GraduationCap,
  Search,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Mail,
  BookOpen,
  RefreshCw,
  Plus,
  Upload,
  Download,
  Trash2,
  Edit2,
  X,
  FileText,
  UserCheck,
  UserX,
  Lock,
  KeyRound,
  AlertTriangle,
} from 'lucide-react';

interface StudentParticipationItem {
  student: User;
  votedElectionsCount: number;
  participations: {
    electionId: string;
    electionTitle: string;
    votedAt: string;
    receiptHash: string;
  }[];
}

export const AdminStudents: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'directory' | 'participation'>('directory');

  // Students list
  const [students, setStudents] = useState<User[]>([]);
  const [participationData, setParticipationData] = useState<StudentParticipationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');

  // Modal: Create or Edit Student
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<User | null>(null);
  const [studentForm, setStudentForm] = useState({
    name: '',
    lastName: '',
    email: '',
    course: '1° Medio A',
    studentIdNumber: '',
    password: '',
    status: 'activo' as 'activo' | 'inactivo',
  });

  // Modal: CSV Import
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [parsedRows, setParsedRows] = useState<
    Array<{
      name: string;
      lastName: string;
      email: string;
      course: string;
      studentIdNumber: string;
      password?: string;
      isValid: boolean;
      error?: string;
    }>
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete modal
  const [studentToDelete, setStudentToDelete] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [list, parts] = await Promise.all([
        api.getStudentsList(
          searchTerm,
          courseFilter !== 'todos' ? courseFilter : undefined,
          statusFilter !== 'todos' ? statusFilter : undefined
        ),
        api.getAdminStudents(),
      ]);
      setStudents(list);
      setParticipationData(parts);
    } catch (err) {
      console.error('Error fetching students:', err);
      showToast('Error al conectar con el servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [searchTerm, courseFilter, statusFilter]);

  const openCreateModal = () => {
    setEditingStudent(null);
    setStudentForm({
      name: '',
      lastName: '',
      email: '',
      course: '1° Medio A',
      studentIdNumber: '',
      password: '',
      status: 'activo',
    });
    setIsStudentModalOpen(true);
  };

  const openEditModal = (student: User) => {
    setEditingStudent(student);
    setStudentForm({
      name: student.name,
      lastName: student.lastName,
      email: student.email,
      course: student.course || '1° Medio A',
      studentIdNumber: student.studentIdNumber || '',
      password: '',
      status: student.status || 'activo',
    });
    setIsStudentModalOpen(true);
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForm.name.trim() || !studentForm.lastName.trim() || !studentForm.email.trim()) {
      showToast('Nombre, apellido y correo institucional son obligatorios.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (editingStudent) {
        await api.updateStudent(editingStudent.id, {
          name: studentForm.name,
          lastName: studentForm.lastName,
          email: studentForm.email,
          course: studentForm.course,
          studentIdNumber: studentForm.studentIdNumber,
          status: studentForm.status,
          ...(studentForm.password ? { password: studentForm.password } : {}),
        });
        showToast('Estudiante actualizado exitosamente.', 'success');
      } else {
        await api.createStudent({
          ...studentForm,
          password: studentForm.password || 'estudiante123',
        });
        showToast('Estudiante registrado exitosamente en el sistema.', 'success');
      }
      setIsStudentModalOpen(false);
      loadAll();
    } catch (err: any) {
      showToast(err.message || 'Error al guardar estudiante.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;
    setSubmitting(true);
    try {
      await api.deleteStudent(studentToDelete.id);
      showToast(`Estudiante "${studentToDelete.name} ${studentToDelete.lastName}" eliminado.`, 'success');
      setStudentToDelete(null);
      loadAll();
    } catch (err: any) {
      showToast(err.message || 'Error al eliminar estudiante.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStudentStatus = async (student: User) => {
    const newStatus = student.status === 'activo' ? 'inactivo' : 'activo';
    try {
      await api.updateStudent(student.id, { status: newStatus });
      showToast(
        newStatus === 'activo'
          ? `Estudiante ${student.name} habilitado para votar.`
          : `Estudiante ${student.name} deshabilitado (inactivo).`,
        'info'
      );
      loadAll();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // CSV Parsing
  const parseCsvContent = (content: string) => {
    setCsvText(content);
    const lines = content.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) {
      setParsedRows([]);
      return;
    }

    // Check if first line is header
    const firstLine = lines[0].toLowerCase();
    const hasHeader = firstLine.includes('nombre') || firstLine.includes('email') || firstLine.includes('correo');
    const dataLines = hasHeader ? lines.slice(1) : lines;

    const parsed = dataLines.map((line) => {
      // Split by comma or semicolon
      const cols = line.includes(';') ? line.split(';') : line.split(',');
      const cleanCols = cols.map((c) => c.replace(/^["']|["']$/g, '').trim());

      const name = cleanCols[0] || '';
      const lastName = cleanCols[1] || '';
      const email = cleanCols[2] || '';
      const course = cleanCols[3] || '1° Medio A';
      const studentIdNumber = cleanCols[4] || '';
      const password = cleanCols[5] || 'estudiante123';

      const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      const isValid = Boolean(name && lastName && isValidEmail);
      const error = !isValidEmail
        ? 'Correo inválido'
        : !name || !lastName
        ? 'Nombre/apellido faltante'
        : undefined;

      return {
        name,
        lastName,
        email,
        course,
        studentIdNumber,
        password,
        isValid,
        error,
      };
    });

    setParsedRows(parsed);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseCsvContent(text || '');
    };
    reader.readAsText(file);
  };

  const downloadCsvTemplate = () => {
    const template = 'nombre,apellido,correo,curso,matricula,password\nJuan,Pérez,juan.perez@colegio.cl,3° Medio A,RUT-12345678-9,clave123\nValentina,López,valentina.lopez@colegio.cl,4° Medio B,RUT-98765432-1,clave123';
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'plantilla_estudiantes.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Plantilla CSV descargada.', 'info');
  };

  const handleImportSubmit = async () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      showToast('No hay filas válidas para importar.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const result = await api.importStudents(validRows);
      showToast(
        `Importación completada: ${result.importedCount} estudiantes registrados con éxito. ${
          result.skippedCount > 0 ? `(${result.skippedCount} omitidos por correo duplicado)` : ''
        }`,
        'success'
      );
      setIsImportModalOpen(false);
      setParsedRows([]);
      setCsvText('');
      loadAll();
    } catch (err: any) {
      showToast(err.message || 'Error en la importación masiva.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const uniqueCourses = Array.from(
    new Set(students.map((s) => s.course).filter(Boolean))
  ) as string[];

  const totalRegistered = students.length;
  const activeCount = students.filter((s) => s.status !== 'inactivo').length;
  const votedCount = participationData.filter((d) => d.votedElectionsCount > 0).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-indigo-600" />
            Gestión de Estudiantes & Padrón Electoral
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Administra el padrón escolar con operaciones completas (crear, editar, eliminar, activar/desactivar e importar desde CSV).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all"
          >
            <Upload className="w-4 h-4" />
            Importar CSV
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm shadow-indigo-600/20 transition-all active:scale-98"
          >
            <Plus className="w-4 h-4" />
            Nuevo Estudiante
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Padrón Total Registrado</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white font-['Outfit']">
              {totalRegistered}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Habilitados para Votar</span>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-['Outfit']">
              {activeCount}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Han Participado</span>
            <p className="text-2xl font-black text-violet-600 dark:text-violet-400 font-['Outfit']">
              {votedCount}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('directory')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'directory'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Directorio & Acciones Estudiantiles
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('participation')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'participation'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Registro de Asistencia & Votos
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, apellido, correo o matrícula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500">Curso:</span>
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
          >
            <option value="todos">Todos los Cursos</option>
            {uniqueCourses.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500">Estado:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
          >
            <option value="todos">Todos los Estados</option>
            <option value="activo">🟢 Activos (Habilitados)</option>
            <option value="inactivo">🔴 Inactivos (Bloqueados)</option>
          </select>
        </div>

        <button
          type="button"
          onClick={loadAll}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-colors"
          title="Recargar lista"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* VIEW 1: Directory & CRUD */}
      {activeTab === 'directory' ? (
        <div className="overflow-hidden rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-700/60">
                <tr>
                  <th className="px-6 py-4">Estudiante</th>
                  <th className="px-6 py-4">Curso / Grado</th>
                  <th className="px-6 py-4">Matrícula / RUT</th>
                  <th className="px-6 py-4">Correo Institucional</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-750">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      Cargando estudiantes...
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      No se encontraron estudiantes registrados con los filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  students.map((student) => {
                    const isActive = student.status !== 'inactivo';
                    return (
                      <tr
                        key={student.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-750/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {student.name} {student.lastName}
                          </div>
                          <span className="text-[11px] text-slate-400">
                            ID: {student.id.slice(0, 10)}...
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                            {student.course || 'Sin curso'}
                          </span>
                        </td>

                        <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-300">
                          {student.studentIdNumber || '—'}
                        </td>

                        <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-300 text-xs">
                          {student.email}
                        </td>

                        <td className="px-6 py-4">
                          <button
                            type="button"
                            onClick={() => toggleStudentStatus(student)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                              isActive
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 hover:bg-emerald-200'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 hover:bg-rose-200'
                            }`}
                            title="Haz clic para cambiar estado"
                          >
                            {isActive ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                            {isActive ? 'Activo' : 'Inactivo'}
                          </button>
                        </td>

                        <td className="px-6 py-4 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => openEditModal(student)}
                            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            title="Editar estudiante"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setStudentToDelete(student)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                            title="Eliminar estudiante"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* VIEW 2: Participation Audit Log */
        <div className="overflow-hidden rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-700/60">
                <tr>
                  <th className="px-6 py-4">Estudiante</th>
                  <th className="px-6 py-4">Curso / Matrícula</th>
                  <th className="px-6 py-4">Elecciones Votadas</th>
                  <th className="px-6 py-4">Comprobantes Registrados</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-750">
                {participationData.map(({ student, votedElectionsCount, participations }) => (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-750/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {student.name} {student.lastName}
                      </div>
                      <span className="text-[11px] text-slate-400">{student.email}</span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {student.course || 'Sin curso'}
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {student.studentIdNumber || 'N/A'}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {votedElectionsCount > 0 ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {votedElectionsCount} {votedElectionsCount === 1 ? 'elección' : 'elecciones'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                          Sin votos aún
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {participations.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {participations.map((p, idx) => (
                            <div key={idx} className="text-[11px] font-mono text-slate-500">
                              <span className="font-semibold text-slate-700 dark:text-slate-300">
                                {p.electionTitle}:
                              </span>{' '}
                              <span className="text-indigo-600 dark:text-indigo-400">{p.receiptHash}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: Create or Edit Student */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto flex flex-col">
            <div className="p-5 bg-indigo-600 text-white flex items-center justify-between">
              <h3 className="text-base font-bold font-['Outfit'] flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                {editingStudent ? 'Editar Estudiante' : 'Nuevo Estudiante en el Padrón'}
              </h3>
              <button
                type="button"
                onClick={() => setIsStudentModalOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="p-6 space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nombre <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Sofía"
                    value={studentForm.name}
                    onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
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
                    placeholder="Ej: Silva"
                    value={studentForm.lastName}
                    onChange={(e) => setStudentForm({ ...studentForm, lastName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Correo Institucional <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="ejemplo@colegio.cl"
                  value={studentForm.email}
                  onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Curso / Grado
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: 3° Medio A"
                    value={studentForm.course}
                    onChange={(e) => setStudentForm({ ...studentForm, course: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Matrícula / RUT
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: 2026-A104"
                    value={studentForm.studentIdNumber}
                    onChange={(e) => setStudentForm({ ...studentForm, studentIdNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
                    {editingStudent ? 'Cambiar Contraseña (opcional)' : 'Contraseña Inicial'}
                  </label>
                  <input
                    type="password"
                    placeholder={editingStudent ? 'Dejar en blanco para conservar' : 'Contraseña de acceso'}
                    value={studentForm.password}
                    onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Estado en el Padrón
                  </label>
                  <select
                    value={studentForm.status}
                    onChange={(e) => setStudentForm({ ...studentForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  >
                    <option value="activo">🟢 Activo (Habilitado para votar)</option>
                    <option value="inactivo">🔴 Inactivo (Sin derecho a voto)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsStudentModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all disabled:opacity-50"
                >
                  {submitting ? 'Guardando...' : editingStudent ? 'Guardar Cambios' : 'Registrar Estudiante'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CSV Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[90vh] flex flex-col">
            <div className="p-5 bg-gradient-to-r from-indigo-700 to-violet-700 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center border border-white/20">
                  <Upload className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-['Outfit']">
                    Importación Masiva de Estudiantes (CSV)
                  </h3>
                  <p className="text-[11px] text-indigo-100">
                    Carga múltiples alumnos al padrón electoral institucional rápidamente.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="text-white/80 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs sm:text-sm">
              {/* Instructions & Template download */}
              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-indigo-950 dark:text-indigo-200">
                    Formato de Columnas requerido:
                  </p>
                  <p className="text-xs text-indigo-800 dark:text-indigo-300 font-mono mt-0.5">
                    nombre, apellido, correo, curso, matricula, password
                  </p>
                </div>
                <button
                  type="button"
                  onClick={downloadCsvTemplate}
                  className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700 font-bold text-xs flex items-center gap-1.5 shadow-2xs self-start sm:self-auto hover:bg-indigo-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  Descargar Plantilla CSV
                </button>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-50/50 dark:bg-slate-850 transition-colors"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv,text/csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <FileText className="w-10 h-10 mx-auto text-indigo-500 mb-2" />
                <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  Haz clic aquí para seleccionar un archivo .CSV
                </p>
                <p className="text-xs text-slate-500 mt-1">O arrastra el archivo directamente a esta área</p>
              </div>

              {/* Or manual text paste */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  O pega aquí el contenido CSV directamente:
                </label>
                <textarea
                  rows={4}
                  placeholder={`nombre,apellido,correo,curso,matricula,password\nCamila,Valenzuela,camila.v@colegio.cl,3° Medio A,2026-001,clave123\nBenjamín,Soto,benjamin.s@colegio.cl,3° Medio B,2026-002,clave123`}
                  value={csvText}
                  onChange={(e) => parseCsvContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Preview table */}
              {parsedRows.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white text-xs">
                      Vista previa de importación: ({parsedRows.filter((r) => r.isValid).length} válidos de {parsedRows.length})
                    </span>
                  </div>

                  <div className="max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 sticky top-0 font-bold">
                        <tr>
                          <th className="px-3 py-2">Nombre</th>
                          <th className="px-3 py-2">Correo</th>
                          <th className="px-3 py-2">Curso</th>
                          <th className="px-3 py-2">Matrícula</th>
                          <th className="px-3 py-2">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {parsedRows.map((r, i) => (
                          <tr key={i} className={r.isValid ? '' : 'bg-rose-50/50 dark:bg-rose-950/20'}>
                            <td className="px-3 py-1.5 font-medium">
                              {r.name} {r.lastName}
                            </td>
                            <td className="px-3 py-1.5 font-mono">{r.email}</td>
                            <td className="px-3 py-1.5">{r.course}</td>
                            <td className="px-3 py-1.5 font-mono">{r.studentIdNumber || '—'}</td>
                            <td className="px-3 py-1.5">
                              {r.isValid ? (
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓ Válido</span>
                              ) : (
                                <span className="text-rose-600 dark:text-rose-400 font-bold">✕ {r.error}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={submitting || parsedRows.filter((r) => r.isValid).length === 0}
                onClick={handleImportSubmit}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all disabled:opacity-50 shadow-sm shadow-indigo-600/20"
              >
                {submitting
                  ? 'Importando...'
                  : `Confirmar e Importar (${parsedRows.filter((r) => r.isValid).length})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={Boolean(studentToDelete)}
        title="¿Eliminar Estudiante del Padrón?"
        message={`Esta acción dará de baja a "${studentToDelete?.name} ${studentToDelete?.lastName}" (${studentToDelete?.email}). Ya no podrá iniciar sesión ni participar en las elecciones.`}
        confirmText="Sí, Eliminar Estudiante"
        cancelText="Cancelar"
        variant="danger"
        loading={submitting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setStudentToDelete(null)}
      />
    </div>
  );
};

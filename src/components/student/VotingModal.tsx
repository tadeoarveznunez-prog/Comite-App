import React, { useState } from 'react';
import { Candidate, ActivityOption, Election } from '../../types.ts';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';
import { ConfirmModal } from '../ui/ConfirmModal.tsx';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Search,
  CheckCircle2,
  ShieldCheck,
  Award,
  Vote,
  AlertCircle,
  Copy,
  Check,
  Calendar,
  MapPin,
  DollarSign,
  Info,
  Compass,
  Users,
} from 'lucide-react';

interface VotingModalProps {
  election: Election & {
    candidates?: Candidate[];
    activityOptions?: ActivityOption[];
  };
  isOpen: boolean;
  onClose: () => void;
  onVoteSuccess: () => void;
}

export const VotingModal: React.FC<VotingModalProps> = ({
  election,
  isOpen,
  onClose,
  onVoteSuccess,
}) => {
  const { showToast } = useToast();
  const isActivityElection = election.type === 'actividad';

  const candidates = election.candidates || [];
  const activityOptions = election.activityOptions || [];

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');

  // Confirmation modal state
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Success state
  const [voteReceipt, setVoteReceipt] = useState<{
    receipt: string;
    votedAt: string;
  } | null>(null);
  const [copiedReceipt, setCopiedReceipt] = useState(false);

  if (!isOpen) return null;

  const activeCandidates = candidates.filter((c) => c.active);
  const activeActivities = activityOptions;

  const filteredCandidates = activeCandidates.filter((c) => {
    const matchesSearch = `${c.name} ${c.lastName} ${c.position} ${c.proposal}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCourse = filterCourse === 'all' || c.course === filterCourse;
    return matchesSearch && matchesCourse;
  });

  const filteredActivities = activeActivities.filter((a) => {
    const matchesSearch = `${a.title} ${a.description} ${a.location || ''} ${a.additionalInfo || ''}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const selectedCandidate = !isActivityElection
    ? activeCandidates.find((c) => c.id === selectedId)
    : null;

  const selectedActivity = isActivityElection
    ? activeActivities.find((a) => a.id === selectedId)
    : null;

  const handleVoteSubmit = async () => {
    if (!selectedId) return;

    setSubmitting(true);
    try {
      const res = await api.castVote(election.id, selectedId);
      setShowConfirm(false);
      setVoteReceipt({
        receipt: res.receipt,
        votedAt: res.votedAt,
      });

      // Festive celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      showToast(res.message, 'success');
      onVoteSuccess();
    } catch (err: any) {
      setShowConfirm(false);
      showToast(err.message || 'No fue posible registrar tu voto.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const copyReceipt = () => {
    if (voteReceipt) {
      navigator.clipboard.writeText(voteReceipt.receipt);
      setCopiedReceipt(true);
      setTimeout(() => setCopiedReceipt(false), 2000);
      showToast('Código de comprobante copiado al portapapeles', 'info');
    }
  };

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[90vh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-md border border-white/20">
                  {isActivityElection ? (
                    <Compass className="w-5 h-5 text-white" />
                  ) : (
                    <Vote className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-bold text-indigo-200 flex items-center gap-1.5">
                    {isActivityElection ? 'Votación de Actividad Escolar' : 'Cabina Digital de Votación'}
                  </span>
                  <h2 className="text-lg sm:text-xl font-extrabold text-white leading-tight font-['Outfit']">
                    {election.title}
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* If vote was just registered: Success Screen */}
            {voteReceipt ? (
              <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center my-auto">
                <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center mb-5 shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 font-['Outfit']">
                  Tu voto fue registrado correctamente
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mb-6 leading-relaxed">
                  Has ejercido tu derecho de votación en esta elección escolar. Para garantizar tu privacidad y el secreto del sufragio, tu voto se encuentra disociado de tu identidad en la urna digital.
                </p>

                {/* Cryptographic receipt box */}
                <div className="w-full max-w-md p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 mb-6 text-left">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      Comprobante Anónimo de Participación
                    </span>
                    <button
                      type="button"
                      onClick={copyReceipt}
                      className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      {copiedReceipt ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedReceipt ? 'Copiado' : 'Copiar'}
                    </button>
                  </div>
                  <div className="font-mono text-sm font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 break-all">
                    {voteReceipt.receipt}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Fecha y hora: {new Date(voteReceipt.votedAt).toLocaleString('es-ES')}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-8 py-3 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20"
                >
                  Volver al Panel de Estudiante
                </button>
              </div>
            ) : (
              <>
                {/* Search & Filter Bar */}
                <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-col sm:flex-row items-center gap-3 shrink-0">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder={
                        isActivityElection
                          ? 'Buscar actividades por título, lugar o detalle...'
                          : 'Buscar candidatos por nombre, cargo o propuesta...'
                      }
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {!isActivityElection && (
                    <div className="w-full sm:w-auto">
                      <select
                        value={filterCourse}
                        onChange={(e) => setFilterCourse(e.target.value)}
                        className="w-full sm:w-auto px-3 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                      >
                        <option value="all">Todos los Cursos</option>
                        {Array.from(new Set(activeCandidates.map((c) => c.course))).map((course) => (
                          <option key={course} value={course}>
                            {course}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Selection Grid: Candidates OR Activities */}
                <div className="p-4 sm:p-6 overflow-y-auto flex-1">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-4">
                    {isActivityElection
                      ? 'Selecciona la propuesta de actividad que deseas apoyar para el curso:'
                      : 'Selecciona una tarjeta para elegir tu candidato y luego confirma tu voto:'}
                  </p>

                  {isActivityElection ? (
                    /* Activities Selection Grid */
                    filteredActivities.length === 0 ? (
                      <div className="text-center py-12 text-slate-500">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                        <p className="text-sm">No se encontraron opciones de actividad registradas.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredActivities.map((act) => {
                          const isSelected = selectedId === act.id;
                          return (
                            <div
                              key={act.id}
                              onClick={() => setSelectedId(act.id)}
                              className={`relative cursor-pointer rounded-2xl p-5 transition-all border-2 text-left flex flex-col justify-between ${
                                isSelected
                                  ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/40 shadow-md ring-2 ring-purple-500/20'
                                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/80 shadow-2xs'
                              }`}
                            >
                              <div>
                                {act.imageUrl && (
                                  <div className="relative mb-3 h-36 w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-750">
                                    <img
                                      src={act.imageUrl}
                                      alt={act.title}
                                      referrerPolicy="no-referrer"
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLElement).style.display = 'none';
                                      }}
                                    />
                                    {isSelected && (
                                      <div className="absolute top-2 right-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-600 text-white shadow-md">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        Seleccionada
                                      </div>
                                    )}
                                  </div>
                                )}

                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <h4 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit']">
                                    {act.title}
                                  </h4>
                                  {!act.imageUrl && isSelected && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-600 text-white shadow-xs shrink-0">
                                      <CheckCircle2 className="w-3 h-3" />
                                      Seleccionada
                                    </span>
                                  )}
                                </div>

                                <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
                                  {act.description}
                                </p>

                                <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                                  {act.proposedDate && (
                                    <div className="flex items-center gap-1.5">
                                      <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                      <span>
                                        Fecha propuesta:{' '}
                                        <strong className="text-slate-700 dark:text-slate-200">
                                          {new Date(act.proposedDate).toLocaleString('es-ES')}
                                        </strong>
                                      </span>
                                    </div>
                                  )}

                                  {act.location && (
                                    <div className="flex items-center gap-1.5">
                                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                      <span>
                                        Lugar:{' '}
                                        <strong className="text-slate-700 dark:text-slate-200">
                                          {act.location}
                                        </strong>
                                      </span>
                                    </div>
                                  )}

                                  {act.estimatedCost !== undefined && act.estimatedCost !== null && (
                                    <div className="flex items-center gap-1.5">
                                      <DollarSign className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                      <span>
                                        Costo estimado:{' '}
                                        <strong className="text-emerald-600 dark:text-emerald-400">
                                          ${Number(act.estimatedCost).toLocaleString('es-CL')}
                                        </strong>
                                      </span>
                                    </div>
                                  )}

                                  {act.additionalInfo && (
                                    <div className="flex items-start gap-1.5 pt-1 text-[11px] text-slate-400">
                                      <Info className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                                      <span>{act.additionalInfo}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )
                  ) : (
                    /* Candidates Selection Grid */
                    filteredCandidates.length === 0 ? (
                      <div className="text-center py-12 text-slate-500">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                        <p className="text-sm">No se encontraron candidatos con los criterios de búsqueda.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredCandidates.map((cand) => {
                          const isSelected = selectedId === cand.id;
                          return (
                            <div
                              key={cand.id}
                              onClick={() => setSelectedId(cand.id)}
                              className={`relative cursor-pointer rounded-2xl p-4 transition-all border-2 text-left flex flex-col justify-between ${
                                isSelected
                                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-md ring-2 ring-indigo-500/20'
                                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/80 shadow-2xs'
                              }`}
                            >
                              <div className="flex items-start gap-4 mb-3">
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
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 truncate">
                                      {cand.course}
                                    </span>
                                    {isSelected && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white shadow-xs">
                                        <CheckCircle2 className="w-3 h-3" />
                                        Seleccionado
                                      </span>
                                    )}
                                  </div>
                                  <h4 className="text-base font-bold text-slate-900 dark:text-white truncate">
                                    {cand.name} {cand.lastName}
                                  </h4>
                                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1 mt-0.5">
                                    <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                    <span className="truncate">{cand.position}</span>
                                  </p>
                                </div>
                              </div>

                              <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                                <span className="text-[11px] font-bold text-slate-400 block mb-1">
                                  Propuesta principal:
                                </span>
                                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                                  {cand.proposal || 'Sin propuesta detallada registrada.'}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )
                  )}
                </div>

                {/* Footer Controls */}
                <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-4 shrink-0">
                  <div className="text-xs text-slate-500">
                    {isActivityElection ? (
                      selectedActivity ? (
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          Actividad seleccionada:{' '}
                          <strong className="text-purple-600 dark:text-purple-400">
                            {selectedActivity.title}
                          </strong>
                        </span>
                      ) : (
                        'Debes seleccionar una opción de actividad para votar.'
                      )
                    ) : selectedCandidate ? (
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        Candidato seleccionado:{' '}
                        <strong className="text-indigo-600 dark:text-indigo-400">
                          {selectedCandidate.name} {selectedCandidate.lastName}
                        </strong>
                      </span>
                    ) : (
                      'Debes elegir un candidato para poder emitir tu voto.'
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      disabled={!selectedId || submitting}
                      onClick={() => setShowConfirm(true)}
                      className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white transition-all shadow-md active:scale-98 disabled:opacity-50 disabled:pointer-events-none ${
                        isActivityElection
                          ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/20'
                          : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
                      }`}
                    >
                      Continuar a Confirmar Voto
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </AnimatePresence>

      {/* Confirmation Modal: "¿Estás seguro de que deseas emitir este voto?" */}
      <ConfirmModal
        isOpen={showConfirm}
        title="¿Estás seguro de que deseas emitir este voto?"
        message={
          isActivityElection && selectedActivity ? (
            <div className="space-y-3 text-left">
              <p>Estás a punto de confirmar tu voto por la siguiente actividad escolar:</p>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <h4 className="font-bold text-slate-900 dark:text-white text-base">
                  {selectedActivity.title}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  {selectedActivity.location ? `📍 ${selectedActivity.location} • ` : ''}
                  {selectedActivity.estimatedCost ? `Costo: $${Number(selectedActivity.estimatedCost).toLocaleString('es-CL')}` : ''}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-amber-800 dark:text-amber-300 text-xs">
                {election.allowVoteModification ? (
                  <span>
                    ℹ️ <strong>Permiso de cambio:</strong> Esta elección permite que cambies o modifiques tu voto antes de la fecha de cierre.
                  </span>
                ) : (
                  <span>
                    ⚠️ <strong>Aviso importante:</strong> Cada estudiante puede votar <strong>una sola vez</strong>. Una vez emitido, tu voto es <strong>definitivo, secreto e irreversible</strong>.
                  </span>
                )}
              </div>
            </div>
          ) : selectedCandidate ? (
            <div className="space-y-3 text-left">
              <p>Estás a punto de confirmar tu voto oficial en la elección:</p>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                <img
                  src={selectedCandidate.photoUrl}
                  alt={selectedCandidate.name}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    {selectedCandidate.name} {selectedCandidate.lastName}
                  </h4>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                    {selectedCandidate.position} ({selectedCandidate.course})
                  </p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-amber-800 dark:text-amber-300 text-xs">
                {election.allowVoteModification ? (
                  <span>
                    ℹ️ <strong>Permiso de cambio:</strong> Esta elección permite que cambies o modifiques tu voto antes del cierre.
                  </span>
                ) : (
                  <span>
                    ⚠️ <strong>Aviso importante:</strong> Cada estudiante puede votar <strong>una sola vez</strong> por elección. Una vez emitido, tu voto es <strong>definitivo, secreto e irreversible</strong>.
                  </span>
                )}
              </div>
            </div>
          ) : (
            '¿Deseas confirmar la emisión de tu voto?'
          )
        }
        confirmText="Sí, Emitir Mi Voto Oficial"
        cancelText="Revisar Opciones"
        variant="primary"
        loading={submitting}
        onConfirm={handleVoteSubmit}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
};

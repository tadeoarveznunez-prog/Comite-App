import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { Election, Candidate } from '../../types.ts';
import { api } from '../../services/api.ts';
import { VotingModal } from './VotingModal.tsx';
import { StudentResults } from './StudentResults.tsx';
import { StudentActivities } from './StudentActivities.tsx';
import {
  Vote,
  Calendar,
  CheckCircle2,
  Lock,
  Clock,
  BarChart2,
  DollarSign,
  ShieldCheck,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'elections' | 'activities'>('elections');
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);

  // Voting flow state
  const [selectedElectionForVoting, setSelectedElectionForVoting] = useState<
    (Election & { candidates?: Candidate[] }) | null
  >(null);
  const [viewingResultsElectionId, setViewingResultsElectionId] = useState<string | null>(null);

  const fetchElections = async () => {
    setLoading(true);
    try {
      const data = await api.getElections();
      setElections(data);
    } catch (err) {
      console.error('Error fetching elections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElections();
  }, []);

  const handleOpenVote = async (electionId: string) => {
    try {
      const fullElection = await api.getElectionById(electionId);
      setSelectedElectionForVoting(fullElection);
    } catch (err) {
      console.error('Error opening voting booth:', err);
    }
  };

  const getStatusBadge = (status: Election['status']) => {
    switch (status) {
      case 'activa':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Votación Activa
          </span>
        );
      case 'pendiente':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <Clock className="w-3 h-3" />
            Próximamente
          </span>
        );
      case 'finalizada':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            <Lock className="w-3 h-3" />
            Elección Finalizada
          </span>
        );
    }
  };

  if (viewingResultsElectionId) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <StudentResults
          electionId={viewingResultsElectionId}
          onBack={() => setViewingResultsElectionId(null)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Student Welcome Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 text-white p-6 sm:p-8 shadow-xl shadow-indigo-900/10">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-indigo-100 border border-white/20 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Padrón Electoral Oficial Institucional
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-['Outfit']">
              Hola, {user?.name} {user?.lastName}
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100 mt-1">
              Curso: <strong>{user?.course || 'Estudiante'}</strong> • Matrícula: {user?.studentIdNumber || 'Activo'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchElections}
              className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-colors flex items-center gap-1.5 border border-white/20"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 mt-6 pt-6 border-t border-white/15">
          <button
            type="button"
            onClick={() => setActiveTab('elections')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'elections'
                ? 'bg-white text-indigo-900 shadow-md'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <Vote className="w-4 h-4" />
            Elecciones Disponibles
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('activities')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'activities'
                ? 'bg-white text-indigo-900 shadow-md'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Actividades del Curso
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'activities' ? (
        <StudentActivities />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white font-['Outfit']">
                Procesos Eleccionarios
              </h2>
              <p className="text-xs text-slate-500">
                Selecciona una elección activa para emitir tu voto democrático o consultar resultados.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {elections.length} {elections.length === 1 ? 'elección' : 'elecciones'}
            </span>
          </div>

          {loading ? (
            <div className="py-20 text-center text-slate-500">
              <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-3 text-indigo-600" />
              <p className="text-xs font-semibold">Cargando elecciones estudiantiles...</p>
            </div>
          ) : elections.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700">
              <Vote className="w-12 h-12 mx-auto text-slate-400 mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
                No hay elecciones programadas
              </h3>
              <p className="text-xs text-slate-500">
                El cuerpo directivo publicará aquí las próximas votaciones del colegio.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {elections.map((elec) => {
                const canVote = elec.status === 'activa' && !elec.hasVoted;
                const showResultsBtn = elec.showResultsToStudents || elec.status === 'finalizada';

                return (
                  <div
                    key={elec.id}
                    className="p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          {getStatusBadge(elec.status)}
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                              elec.type === 'actividad'
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300'
                                : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300'
                            }`}
                          >
                            {elec.type === 'actividad' ? '🎯 Actividad' : '👥 Comité'}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(elec.startDate).toLocaleDateString('es-ES')} - {new Date(elec.endDate).toLocaleDateString('es-ES')}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-slate-900 dark:text-white font-['Outfit'] mb-2">
                        {elec.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed line-clamp-3">
                        {elec.description}
                      </p>

                      <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-5">
                        {elec.type === 'actividad' ? (
                          <span>
                            Opciones de actividad:{' '}
                            <strong className="text-slate-800 dark:text-slate-200">
                              {elec.activityOptionsCount || 0}
                            </strong>
                          </span>
                        ) : (
                          <span>
                            Candidatos inscritos:{' '}
                            <strong className="text-slate-800 dark:text-slate-200">
                              {elec.candidatesCount || 0}
                            </strong>
                          </span>
                        )}
                        {elec.targetCourse && (
                          <span>
                            Curso: <strong className="text-slate-800 dark:text-slate-200">{elec.targetCourse}</strong>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action & Status Bar */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      {elec.hasVoted ? (
                        <div className="flex-1 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <div>
                              <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                                Ya has participado en esta elección.
                              </p>
                              <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono">
                                Comp: {elec.myReceipt || 'Registrado'}
                              </p>
                            </div>
                          </div>
                          {elec.allowVoteModification && elec.status === 'activa' && (
                            <button
                              type="button"
                              onClick={() => handleOpenVote(elec.id)}
                              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-slate-700 transition-colors shadow-2xs self-start sm:self-auto"
                            >
                              Modificar mi voto
                            </button>
                          )}
                        </div>
                      ) : elec.status === 'activa' ? (
                        <button
                          type="button"
                          onClick={() => handleOpenVote(elec.id)}
                          className="flex-1 py-3 px-5 rounded-2xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2"
                        >
                          <Vote className="w-4 h-4" />
                          Votar Ahora
                        </button>
                      ) : (
                        <div className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-700/50 text-xs font-semibold text-slate-500 text-center">
                          {elec.status === 'pendiente' ? 'Votación no iniciada' : 'Elección cerrada'}
                        </div>
                      )}

                      {showResultsBtn && (
                        <button
                          type="button"
                          onClick={() => setViewingResultsElectionId(elec.id)}
                          className="py-2.5 px-4 rounded-xl text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors flex items-center justify-center gap-1.5 border border-indigo-200/80 dark:border-indigo-800"
                        >
                          <BarChart2 className="w-3.5 h-3.5" />
                          Resultados
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Voting Booth Modal */}
      {selectedElectionForVoting && (
        <VotingModal
          election={selectedElectionForVoting}
          isOpen={Boolean(selectedElectionForVoting)}
          onClose={() => setSelectedElectionForVoting(null)}
          onVoteSuccess={() => {
            fetchElections();
          }}
        />
      )}
    </div>
  );
};

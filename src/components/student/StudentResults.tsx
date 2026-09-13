import React, { useEffect, useState } from 'react';
import { ElectionResults } from '../../types.ts';
import { api } from '../../services/api.ts';
import {
  BarChart3,
  Users,
  CheckCircle,
  Clock,
  Lock,
  RefreshCw,
  Trophy,
  Calendar,
  MapPin,
  DollarSign,
  Compass,
} from 'lucide-react';

interface StudentResultsProps {
  electionId: string;
  onBack: () => void;
}

export const StudentResults: React.FC<StudentResultsProps> = ({ electionId, onBack }) => {
  const [results, setResults] = useState<ElectionResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getElectionResults(electionId);
      setResults(data);
    } catch (err: any) {
      setError(err.message || 'No fue posible cargar los resultados de la elección.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [electionId]);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <RefreshCw className="w-8 h-8 mx-auto animate-spin text-indigo-600 mb-3" />
        <p className="text-sm font-medium text-slate-500">Cargando escrutinio oficial...</p>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="max-w-xl mx-auto py-12 px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 font-['Outfit']">
          Resultados en Reserva
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
          {error || 'El administrador del colegio aún no ha habilitado la visualización pública de los resultados para esta elección.'}
        </p>
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors"
        >
          Volver a Elecciones
        </button>
      </div>
    );
  }

  const isActivity = results.electionType === 'actividad';
  const activityList = results.activityResults || [];
  const candidateList = results.candidateResults || [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline mb-1 flex items-center gap-1"
          >
            ← Volver a Elecciones
          </button>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white font-['Outfit']">
              {results.electionTitle}
            </h2>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                isActivity
                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300'
                  : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300'
              }`}
            >
              {isActivity ? 'Elección de Actividad' : 'Elección de Comité'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Escrutinio oficial actualizado a las {new Date(results.lastUpdated).toLocaleTimeString('es-ES')}
          </p>
        </div>

        <button
          type="button"
          onClick={fetchResults}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Actualizar Conteo
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1 text-xs font-semibold">
            <BarChart3 className="w-4 h-4 text-indigo-500" />
            Total Votos
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white font-['Outfit']">
            {results.totalVotes}
          </p>
          <p className="text-[11px] text-slate-400">Votos emitidos y validados</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1 text-xs font-semibold">
            <Users className="w-4 h-4 text-violet-500" />
            Padrón Estudiantil
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white font-['Outfit']">
            {results.totalEligibleStudents}
          </p>
          <p className="text-[11px] text-slate-400">Alumnos habilitados</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1 text-xs font-semibold">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            Ya Votaron
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-['Outfit']">
            {results.votedCount}
          </p>
          <p className="text-[11px] text-slate-400">Participación: {results.participationPercentage}%</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1 text-xs font-semibold">
            <Clock className="w-4 h-4 text-amber-500" />
            Aún No Votan
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 font-['Outfit']">
            {results.notVotedCount}
          </p>
          <p className="text-[11px] text-slate-400">Estudiantes pendientes</p>
        </div>
      </div>

      {/* Results Breakdown & Progress Bars */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-2">
          {isActivity ? (
            <>
              <Compass className="w-5 h-5 text-purple-600" />
              Resultados de la Votación de Actividades
            </>
          ) : (
            <>
              <Users className="w-5 h-5 text-indigo-600" />
              Resultados Oficiales por Candidato
            </>
          )}
        </h3>

        {isActivity ? (
          /* Activity results breakdown */
          activityList.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-6">No hay opciones de actividad registradas.</p>
          ) : (
            <div className="space-y-4">
              {activityList.map((ar, idx) => {
                const isWinner = idx === 0 && ar.votes > 0;
                return (
                  <div
                    key={ar.option.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isWinner
                        ? 'border-purple-300 dark:border-purple-800 bg-purple-50/40 dark:bg-purple-950/20 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3">
                        {ar.option.imageUrl && (
                          <img
                            src={ar.option.imageUrl}
                            alt={ar.option.title}
                            referrerPolicy="no-referrer"
                            className="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 dark:text-white text-base">
                              {ar.option.title}
                            </h4>
                            {isWinner && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300/60 flex items-center gap-1">
                                <Trophy className="w-3 h-3 text-amber-600" />
                                Opción Ganadora
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {ar.option.location ? `📍 ${ar.option.location} • ` : ''}
                            {ar.option.estimatedCost ? `Costo: $${Number(ar.option.estimatedCost).toLocaleString('es-CL')}` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-2xl font-black text-purple-600 dark:text-purple-400 font-['Outfit']">
                          {ar.percentage}%
                        </span>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          {ar.votes} {ar.votes === 1 ? 'voto' : 'votos'}
                        </p>
                      </div>
                    </div>

                    {/* Visual Bar */}
                    <div className="w-full h-3 bg-slate-100 dark:bg-slate-700/60 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          isWinner
                            ? 'bg-gradient-to-r from-purple-500 to-indigo-600'
                            : 'bg-purple-400 dark:bg-purple-500'
                        }`}
                        style={{ width: `${Math.max(ar.percentage, 2)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* Committee Candidate results breakdown */
          candidateList.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-6">No hay candidatos registrados en esta elección.</p>
          ) : (
            <div className="space-y-4">
              {candidateList.map((cr, idx) => {
                const isWinner = idx === 0 && cr.votes > 0;
                return (
                  <div
                    key={cr.candidate.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isWinner
                        ? 'border-indigo-300 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={cr.candidate.photoUrl}
                          alt={cr.candidate.name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 dark:text-white text-base">
                              {cr.candidate.name} {cr.candidate.lastName}
                            </h4>
                            {isWinner && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300/60">
                                ★ Mayoría Actual
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {cr.candidate.position} • {cr.candidate.course}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-['Outfit']">
                          {cr.percentage}%
                        </span>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          {cr.votes} {cr.votes === 1 ? 'voto' : 'votos'}
                        </p>
                      </div>
                    </div>

                    {/* Visual Bar */}
                    <div className="w-full h-3 bg-slate-100 dark:bg-slate-700/60 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          isWinner
                            ? 'bg-gradient-to-r from-indigo-500 to-violet-600'
                            : 'bg-indigo-400 dark:bg-indigo-500'
                        }`}
                        style={{ width: `${Math.max(cr.percentage, 2)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
};

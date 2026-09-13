import React, { useState, useEffect } from 'react';
import { Election, ElectionResults, VoterParticipationRecord } from '../../types.ts';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';
import {
  BarChart3,
  Users,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  EyeOff,
  RefreshCw,
  Award,
  ShieldCheck,
} from 'lucide-react';

export const AdminResults: React.FC = () => {
  const { showToast } = useToast();
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElectionId, setSelectedElectionId] = useState<string>('');
  const [results, setResults] = useState<ElectionResults | null>(null);
  const [voters, setVoters] = useState<VoterParticipationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadElections = async () => {
    setLoading(true);
    try {
      const elecs = await api.getElections();
      setElections(elecs);
      if (elecs.length > 0) {
        setSelectedElectionId(elecs[0].id);
      }
    } catch (err) {
      console.error('Error fetching elections:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadResults = async (electionId: string) => {
    if (!electionId) return;
    try {
      const [res, vts] = await Promise.all([
        api.getElectionResults(electionId),
        api.getElectionVoters(electionId),
      ]);
      setResults(res);
      setVoters(vts);
    } catch (err: any) {
      showToast(err.message || 'Error al cargar resultados', 'error');
    }
  };

  useEffect(() => {
    loadElections();
  }, []);

  useEffect(() => {
    if (selectedElectionId) {
      loadResults(selectedElectionId);
    }
  }, [selectedElectionId]);

  const toggleVisibility = async () => {
    if (!results) return;
    try {
      const next = !results.showResultsToStudents;
      await api.updateElection(results.electionId, { showResultsToStudents: next });
      setResults({ ...results, showResultsToStudents: next });
      showToast(
        next ? 'Resultados ahora son VISIBLES para los estudiantes.' : 'Resultados OCULTOS para los estudiantes.',
        'info'
      );
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Export Results to CSV
  const exportToCSV = () => {
    if (!results) return;

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += `Eleccion,"${results.electionTitle}"\n`;
    csvContent += `Tipo,"${results.electionType === 'actividad' ? 'Elección de Actividad' : 'Elección de Comité'}"\n`;
    csvContent += `Total Votos,${results.totalVotes}\n`;
    csvContent += `Participacion %,${results.participationPercentage}%\n\n`;

    if (results.electionType === 'actividad' && results.activityResults) {
      csvContent += 'Actividad,Lugar,Costo Estimado,Votos,Porcentaje %\n';
      results.activityResults.forEach((ar) => {
        csvContent += `"${ar.option.title}","${ar.option.location || 'N/A'}",${ar.option.estimatedCost || 0},${ar.votes},${ar.percentage}%\n`;
      });
    } else {
      csvContent += 'Candidato,Curso,Cargo,Votos,Porcentaje %\n';
      results.candidateResults.forEach((cr) => {
        csvContent += `"${cr.candidate.name} ${cr.candidate.lastName}","${cr.candidate.course}","${cr.candidate.position}",${cr.votes},${cr.percentage}%\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `escrutinio_${results.electionId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Resultados exportados en formato CSV', 'success');
  };

  // Export Results to JSON
  const exportToJSON = () => {
    if (!results) return;

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(results, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `escrutinio_${results.electionId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Resultados exportados en formato JSON', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white font-['Outfit']">
            Escrutinio & Estadísticas Oficiales
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Monitorea el recuento de votos en tiempo real, activa la publicación para estudiantes y exporta actas.
          </p>
        </div>

        {/* Election Selector */}
        <div className="flex items-center gap-3">
          <select
            value={selectedElectionId}
            onChange={(e) => setSelectedElectionId(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
          >
            {elections.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => loadResults(selectedElectionId)}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors"
            title="Recargar escrutinio"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {results && (
        <>
          {/* Action Bar (Publish toggle and export) */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Visibilidad para estudiantes:
              </span>
              <button
                type="button"
                onClick={toggleVisibility}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  results.showResultsToStudents
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                }`}
              >
                {results.showResultsToStudents ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                {results.showResultsToStudents ? 'Resultados Visibles (Clic para Ocultar)' : 'Ocultos (Clic para Mostrar)'}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={exportToCSV}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Exportar CSV
              </button>

              <button
                type="button"
                onClick={exportToJSON}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Exportar JSON
              </button>
            </div>
          </div>

          {/* 5 Core Statistical Summary Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center gap-2 text-slate-400 mb-1 text-xs font-bold uppercase">
                <BarChart3 className="w-4 h-4 text-indigo-500" />
                Total Votos
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white font-['Outfit']">
                {results.totalVotes}
              </p>
              <p className="text-[11px] text-slate-400">En urna digital</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center gap-2 text-slate-400 mb-1 text-xs font-bold uppercase">
                <Users className="w-4 h-4 text-violet-500" />
                Total Padrón
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white font-['Outfit']">
                {results.totalEligibleStudents}
              </p>
              <p className="text-[11px] text-slate-400">Estudiantes habilitados</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center gap-2 text-slate-400 mb-1 text-xs font-bold uppercase">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Ya Votaron
              </div>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-['Outfit']">
                {results.votedCount}
              </p>
              <p className="text-[11px] text-slate-400">Participantes</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center gap-2 text-slate-400 mb-1 text-xs font-bold uppercase">
                <Clock className="w-4 h-4 text-amber-500" />
                Pendientes
              </div>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400 font-['Outfit']">
                {results.notVotedCount}
              </p>
              <p className="text-[11px] text-slate-400">Aún no sufragan</p>
            </div>

            <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center gap-2 text-slate-400 mb-1 text-xs font-bold uppercase">
                % Participación
              </div>
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-['Outfit']">
                {results.participationPercentage}%
              </p>
              <p className="text-[11px] text-slate-400">Tasa de convocatoria</p>
            </div>
          </div>

          {/* Results Breakdown (Candidates or Activities) */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-['Outfit']">
              {results.electionType === 'actividad'
                ? 'Votos y Porcentajes Obtenidos por Opción de Actividad'
                : 'Votos y Porcentajes Obtenidos por Candidato'}
            </h3>

            {results.electionType === 'actividad' ? (
              (!results.activityResults || results.activityResults.length === 0) ? (
                <p className="text-xs text-slate-400 text-center py-6">No hay opciones de actividad para esta elección.</p>
              ) : (
                <div className="space-y-4">
                  {results.activityResults.map((ar, idx) => {
                    const isLeader = idx === 0 && ar.votes > 0;
                    return (
                      <div
                        key={ar.option.id}
                        className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-850"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                          <div className="flex items-center gap-3">
                            {ar.option.imageUrl && (
                              <img
                                src={ar.option.imageUrl}
                                alt={ar.option.title}
                                referrerPolicy="no-referrer"
                                className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                              />
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-slate-900 dark:text-white text-base">
                                  {ar.option.title}
                                </h4>
                                {isLeader && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300/60">
                                    ★ Mayoría
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {ar.option.location ? `📍 ${ar.option.location} • ` : ''}
                                {ar.option.estimatedCost ? `Costo: $${Number(ar.option.estimatedCost).toLocaleString('es-CL')}` : ''}
                              </p>
                            </div>
                          </div>

                          <div className="text-left sm:text-right">
                            <span className="text-2xl font-black text-purple-600 dark:text-purple-400 font-['Outfit']">
                              {ar.percentage}%
                            </span>
                            <span className="text-xs font-semibold text-slate-500 ml-2 sm:ml-0 sm:block">
                              {ar.votes} {ar.votes === 1 ? 'voto' : 'votos'}
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-3 bg-slate-200/70 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-600 rounded-full transition-all duration-700"
                            style={{ width: `${Math.max(ar.percentage, 1)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              results.candidateResults.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No hay candidatos para esta elección.</p>
              ) : (
                <div className="space-y-4">
                  {results.candidateResults.map((cr, idx) => {
                    const isLeader = idx === 0 && cr.votes > 0;
                    return (
                      <div
                        key={cr.candidate.id}
                        className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-850"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                          <div className="flex items-center gap-3">
                            <img
                              src={cr.candidate.photoUrl}
                              alt={cr.candidate.name}
                              referrerPolicy="no-referrer"
                              className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-slate-900 dark:text-white text-base">
                                  {cr.candidate.name} {cr.candidate.lastName}
                                </h4>
                                {isLeader && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300/60">
                                    ★ Mayoría
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {cr.candidate.position} • {cr.candidate.course}
                              </p>
                            </div>
                          </div>

                          <div className="text-left sm:text-right">
                            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-['Outfit']">
                              {cr.percentage}%
                            </span>
                            <span className="text-xs font-semibold text-slate-500 ml-2 sm:ml-0 sm:block">
                              {cr.votes} {cr.votes === 1 ? 'voto' : 'votos'}
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-3 bg-slate-200/70 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 rounded-full transition-all duration-700"
                            style={{ width: `${Math.max(cr.percentage, 1)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </div>

          {/* Voter Participation Log (Secured Audit) */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Registro de Sufragio de Alumnos (Auditoría de Asistencia)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Lista de estudiantes que ya sufragaron en esta elección con su código de comprobante.
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                {voters.length} {voters.length === 1 ? 'registro' : 'registros'}
              </span>
            </div>

            {voters.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                Aún no se han emitido votos en esta elección.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Estudiante</th>
                      <th className="px-4 py-3">Curso</th>
                      <th className="px-4 py-3">Hora de Sufragio</th>
                      <th className="px-4 py-3">Comprobante de Voto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {voters.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                          {v.studentName}
                        </td>
                        <td className="px-4 py-3 text-slate-500">{v.studentCourse}</td>
                        <td className="px-4 py-3 text-slate-500">
                          {new Date(v.votedAt).toLocaleString('es-ES')}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {v.receiptHash}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

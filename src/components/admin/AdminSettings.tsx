import React, { useState, useEffect } from 'react';
import { AuditLog } from '../../types.ts';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';
import { useTheme } from '../../context/ThemeContext.tsx';
import {
  Settings,
  ShieldCheck,
  RotateCcw,
  Moon,
  Sun,
  Server,
  Lock,
  Download,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { showToast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await api.getAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleResetData = async () => {
    if (
      !window.confirm(
        '¿Deseas restaurar la base de datos a los valores iniciales de prueba? Esto reestablecerá las elecciones, candidatos y actividades de demostración.'
      )
    ) {
      return;
    }

    setSeeding(true);
    try {
      await api.seedData();
      showToast('Base de datos restablecida con datos demo exitosamente.', 'success');
      loadLogs();
    } catch (err: any) {
      showToast(err.message || 'Error al restablecer los datos.', 'error');
    } finally {
      setSeeding(false);
    }
  };

  const exportAuditLogs = () => {
    let content = 'ID,FECHA_HORA,USUARIO,ACCION,DETALLES\n';
    logs.forEach((l) => {
      content += `"${l.id}","${l.timestamp}","${l.user}","${l.action}","${l.details}"\n`;
    });

    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + content);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `auditoria_voto_escolar_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Bitácora de auditoría descargada en CSV', 'success');
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white font-['Outfit']">
          Configuración del Sistema & Seguridad
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Control de apariencia, parámetros institucionales, registro inmutable de auditoría y respaldo.
        </p>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Security & Integrity Box */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base font-['Outfit']">
                Seguridad Electoral Activa
              </h3>
              <p className="text-xs text-slate-500">Garantías técnicas de la plataforma</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <span>
                <strong>Inmunidad contra doble voto:</strong> Verificación estricta en el servidor para impedir votaciones duplicadas.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <span>
                <strong>Urna de Sufragio Secreto:</strong> Disociación criptográfica entre el registro de asistencia del alumno y su voto.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <span>
                <strong>Hash de comprobante único:</strong> Cada sufragio genera un recibo comprobatorio auditado.
              </span>
            </div>
          </div>
        </div>

        {/* Preferences & Reset */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base font-['Outfit']">
                  Preferencias & Mantenimiento
                </h3>
                <p className="text-xs text-slate-500">Ajustes visuales y utilidades para pruebas</p>
              </div>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700/60">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Modo Visual (Tema):
              </span>
              <button
                type="button"
                onClick={toggleTheme}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                {theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
                {theme === 'dark' ? 'Modo Oscuro' : 'Modo Claro'}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleResetData}
              disabled={seeding}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
              {seeding ? 'Restaurando datos...' : 'Restablecer Datos Demo del Colegio'}
            </button>
          </div>
        </div>
      </div>

      {/* Full Audit Logs View */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-['Outfit']">
              Bitácora Completa de Auditoría (Audit Logs)
            </h3>
            <p className="text-xs text-slate-500">
              Trazabilidad inmutable de inicios de sesión, cambios de urnas y sufragios registrados.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={exportAuditLogs}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-100 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Exportar Bitácora
            </button>
            <button
              type="button"
              onClick={loadLogs}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Fecha y Hora</th>
                <th className="px-4 py-3">Usuario / Actor</th>
                <th className="px-4 py-3">Acción Registrada</th>
                <th className="px-4 py-3">Detalles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-400 font-sans">
                    Cargando bitácora de auditoría...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-400 font-sans">
                    No hay registros de auditoría aún.
                  </td>
                </tr>
              ) : (
                logs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {new Date(l.timestamp).toLocaleString('es-ES')}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      {l.user}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {l.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-sans">
                      {l.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

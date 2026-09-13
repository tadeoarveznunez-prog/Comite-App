import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { motion, AnimatePresence } from 'motion/react';
import { Vote, X, Lock, Mail, User, BookOpen, Shield, GraduationCap, CheckCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register';
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
}) => {
  const { login, register, quickLoginAs } = useAuth();
  const { showToast } = useToast();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [course, setCourse] = useState('4° Medio A');
  const [studentIdNumber, setStudentIdNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        if (!email.trim() || !password) {
          throw new Error('Por favor ingresa tu correo y contraseña.');
        }
        await login(email, password);
        showToast('¡Bienvenido al portal de Voto Escolar!', 'success');
        onClose();
      } else {
        if (!name.trim() || !lastName.trim() || !email.trim() || !password) {
          throw new Error('Por favor completa todos los campos requeridos.');
        }
        if (password.length < 6) {
          throw new Error('La contraseña debe contener al menos 6 caracteres.');
        }
        await register({
          name: name.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          password,
          course,
          studentIdNumber: studentIdNumber.trim() || undefined,
        });
        showToast('¡Cuenta de estudiante creada con éxito! Ya puedes participar.', 'success');
        onClose();
      }
    } catch (err: any) {
      setFormError(err.message || 'Error al procesar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoEmail: string, demoPass: string, label: string) => {
    setLoading(true);
    setFormError('');
    try {
      await quickLoginAs(demoEmail, demoPass);
      showToast(`Iniciaste sesión como ${label}`, 'success');
      onClose();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8"
        >
          {/* Header */}
          <div className="relative px-6 pt-6 pb-4 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 text-white">
            <button
              type="button"
              onClick={onClose}
              className="absolute top-5 right-5 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-md shadow-inner border border-white/20">
                <Vote className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold tracking-tight font-['Outfit']">
                  Voto Escolar
                </h3>
                <p className="text-xs text-indigo-100 font-medium">
                  {mode === 'login' ? 'Acceso al Sistema Institucional' : 'Registro de Nuevo Estudiante'}
                </p>
              </div>
            </div>

            {/* Mode Switch Tabs */}
            <div className="flex mt-5 bg-indigo-950/40 p-1 rounded-xl border border-white/10 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setFormError('');
                }}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  mode === 'login'
                    ? 'bg-white text-indigo-900 shadow-sm'
                    : 'text-indigo-100 hover:text-white'
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setFormError('');
                }}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  mode === 'register'
                    ? 'bg-white text-indigo-900 shadow-sm'
                    : 'text-indigo-100 hover:text-white'
                }`}
              >
                Registrar Estudiante
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Quick Demo Access Bar */}
            <div className="mb-5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                Acceso Rápido con Cuentas de Demostración:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('admin@votoescolar.edu', 'Admin123!', 'Administrador')}
                  disabled={loading}
                  className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all text-left group shadow-2xs"
                >
                  <Shield className="w-4 h-4 text-violet-600 shrink-0 group-hover:scale-110 transition-transform" />
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">Administrador</p>
                    <p className="text-[10px] text-slate-500 truncate">Control total & finanzas</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo('estudiante1@colegio.edu', 'Estudiante123!', 'Carlos Mendoza (Estudiante)')}
                  disabled={loading}
                  className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all text-left group shadow-2xs"
                >
                  <GraduationCap className="w-4 h-4 text-indigo-600 shrink-0 group-hover:scale-110 transition-transform" />
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">Estudiante (Carlos)</p>
                    <p className="text-[10px] text-slate-500 truncate">Listo para votar</p>
                  </div>
                </button>
              </div>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/50 dark:border-rose-800 dark:text-rose-300 text-xs font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Nombre <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Ej: Sofía"
                          className="w-full pl-9 pr-3 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Apellido <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Ej: Silva Díaz"
                        className="w-full px-3 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Curso <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <BookOpen className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <select
                          value={course}
                          onChange={(e) => setCourse(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="1° Medio A">1° Medio A</option>
                          <option value="1° Medio B">1° Medio B</option>
                          <option value="2° Medio A">2° Medio A</option>
                          <option value="2° Medio B">2° Medio B</option>
                          <option value="3° Medio A">3° Medio A</option>
                          <option value="3° Medio B">3° Medio B</option>
                          <option value="4° Medio A">4° Medio A</option>
                          <option value="4° Medio B">4° Medio B</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        N° Matrícula (Opcional)
                      </label>
                      <input
                        type="text"
                        value={studentIdNumber}
                        onChange={(e) => setStudentIdNumber(e.target.value)}
                        placeholder="Ej: EST-2026-210"
                        className="w-full px-3 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Correo Institucional <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@colegio.edu"
                    className="w-full pl-9 pr-3 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Contraseña <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'register' ? 'Mínimo 6 caracteres' : '••••••••'}
                    className="w-full pl-9 pr-3 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50"
              >
                {loading
                  ? 'Verificando...'
                  : mode === 'login'
                  ? 'Acceder a Voto Escolar'
                  : 'Crear Mi Cuenta de Estudiante'}
              </button>
            </form>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {mode === 'login' ? '¿Aún no tienes cuenta escolar?' : '¿Ya tienes una cuenta registrada?'}
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === 'login' ? 'register' : 'login');
                    setFormError('');
                  }}
                  className="ml-1 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-bold"
                >
                  {mode === 'login' ? 'Regístrate aquí' : 'Inicia sesión'}
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

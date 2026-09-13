import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  User,
  Election,
  ElectionType,
  Candidate,
  ActivityOption,
  ActivityOptionResult,
  VoterParticipationRecord,
  AnonymousBallot,
  Activity,
  AuditLog,
  ElectionResults,
  AdminDashboardStats,
} from '../src/types.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'voto_escolar_db.json');

interface DatabaseSchema {
  users: (User & { passwordHash: string })[];
  elections: Election[];
  candidates: Candidate[];
  activityOptions?: ActivityOption[];
  voterParticipation: VoterParticipationRecord[];
  anonymousBallots: AnonymousBallot[];
  activities: Activity[];
  courseGoals?: import('../src/types.ts').CourseGoal[];
  auditLogs: AuditLog[];
}

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Initial realistic fictitious seed data
const defaultUsers: (User & { passwordHash: string })[] = [
  {
    id: 'user-admin-1',
    name: 'Prof. Roberto',
    lastName: 'Vásquez',
    email: 'admin@votoescolar.edu',
    role: 'admin',
    status: 'activo',
    createdAt: '2026-03-01T08:00:00Z',
    passwordHash: hashPassword('Admin123!'),
  },
  {
    id: 'user-stud-1',
    name: 'Carlos',
    lastName: 'Mendoza Ruiz',
    email: 'estudiante1@colegio.edu',
    role: 'student',
    course: '4° Medio A',
    studentIdNumber: 'EST-2026-014',
    status: 'activo',
    createdAt: '2026-03-02T09:15:00Z',
    passwordHash: hashPassword('Estudiante123!'),
  },
  {
    id: 'user-stud-2',
    name: 'Valeria',
    lastName: 'Morales Silva',
    email: 'estudiante2@colegio.edu',
    role: 'student',
    course: '3° Medio B',
    studentIdNumber: 'EST-2026-089',
    status: 'activo',
    createdAt: '2026-03-02T10:00:00Z',
    passwordHash: hashPassword('Estudiante123!'),
  },
  {
    id: 'user-stud-3',
    name: 'Diego',
    lastName: 'Fernández Castro',
    email: 'estudiante3@colegio.edu',
    role: 'student',
    course: '4° Medio B',
    studentIdNumber: 'EST-2026-102',
    status: 'activo',
    createdAt: '2026-03-03T11:20:00Z',
    passwordHash: hashPassword('Estudiante123!'),
  },
  {
    id: 'user-stud-4',
    name: 'Sofía',
    lastName: 'Araya Campos',
    email: 'estudiante4@colegio.edu',
    role: 'student',
    course: '2° Medio A',
    studentIdNumber: 'EST-2026-045',
    status: 'activo',
    createdAt: '2026-03-03T11:30:00Z',
    passwordHash: hashPassword('Estudiante123!'),
  },
  {
    id: 'user-stud-5',
    name: 'Matías',
    lastName: 'Pizarro Bravo',
    email: 'estudiante5@colegio.edu',
    role: 'student',
    course: '3° Medio A',
    studentIdNumber: 'EST-2026-077',
    status: 'activo',
    createdAt: '2026-03-04T12:00:00Z',
    passwordHash: hashPassword('Estudiante123!'),
  },
];

const defaultElections: Election[] = [
  {
    id: 'elec-ccee-2026',
    title: 'Elección Centro de Estudiantes 2026',
    description: 'Elección democrática para elegir la nueva directiva del Centro de Alumnos que representará a toda la comunidad estudiantil.',
    type: 'comite',
    targetCourse: 'Colegio Completo',
    startDate: '2026-09-01T08:00:00Z',
    endDate: '2026-09-30T18:00:00Z',
    status: 'activa',
    showResultsToStudents: true,
    createdAt: '2026-08-25T10:00:00Z',
  },
  {
    id: 'elec-comite-4a',
    title: 'Elección Directiva de Curso 4° Medio A',
    description: 'Votación para elegir a los delegados y representantes del curso para el comité de graduación y actividades anuales.',
    type: 'comite',
    targetCourse: '4° Medio A',
    availablePositions: ['Delegado General', 'Tesorero', 'Secretario'],
    startDate: '2026-09-10T08:00:00Z',
    endDate: '2026-09-25T20:00:00Z',
    status: 'activa',
    showResultsToStudents: false,
    createdAt: '2026-09-05T09:30:00Z',
  },
  {
    id: 'elec-actividad-2026',
    title: 'Elección de Actividad de Fin de Año',
    description: 'Votación estudiantil para decidir democráticamente la actividad recreativa o viaje de fin de ciclo escolar.',
    type: 'actividad',
    targetCourse: 'Colegio Completo',
    startDate: '2026-09-01T08:00:00Z',
    endDate: '2026-09-30T20:00:00Z',
    status: 'activa',
    showResultsToStudents: true,
    createdAt: '2026-08-28T10:00:00Z',
  },
  {
    id: 'elec-mascota-2026',
    title: 'Votación Mascota Institucional del Colegio',
    description: 'Elección de la figura representativa para las jornadas deportivas y aniversarios escolares.',
    type: 'comite',
    targetCourse: 'Colegio Completo',
    startDate: '2026-08-01T08:00:00Z',
    endDate: '2026-08-15T18:00:00Z',
    status: 'finalizada',
    showResultsToStudents: true,
    createdAt: '2026-07-28T14:00:00Z',
  },
];

const defaultCandidates: Candidate[] = [
  // Candidates for Centro de Estudiantes
  {
    id: 'cand-1',
    electionId: 'elec-ccee-2026',
    name: 'Camila',
    lastName: 'Navarro Soto',
    course: '4° Medio A',
    position: 'Presidenta CCEE - Lista "Fuerza y Unión"',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    proposal: 'Creación de salas de estudio silenciosas, torneos deportivos intercursos los viernes por la tarde, y convenios de fotocopias a bajo costo.',
    active: true,
    colorTag: '#3b82f6',
    createdAt: '2026-08-26T10:00:00Z',
  },
  {
    id: 'cand-2',
    electionId: 'elec-ccee-2026',
    name: 'Benjamín',
    lastName: 'Guzmán Lara',
    course: '4° Medio B',
    position: 'Presidente CCEE - Lista "Voz Juvenil"',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    proposal: 'Modernización del patio techado con puntos de carga solar, festivales de música y debate mensual con la dirección del colegio.',
    active: true,
    colorTag: '#10b981',
    createdAt: '2026-08-26T10:30:00Z',
  },
  {
    id: 'cand-3',
    electionId: 'elec-ccee-2026',
    name: 'Ignacia',
    lastName: 'Salazar Peña',
    course: '3° Medio A',
    position: 'Presidenta CCEE - Lista "Eco-Estudiantil"',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    proposal: 'Puntos verdes de reciclaje en cada pabellón, huerto escolar comunitario y menú vegetariano opcional en el casino institucional.',
    active: true,
    colorTag: '#f59e0b',
    createdAt: '2026-08-26T11:00:00Z',
  },

  // Candidates for 4 Medio A
  {
    id: 'cand-4',
    electionId: 'elec-comite-4a',
    name: 'Lucas',
    lastName: 'Vidal Riquelme',
    course: '4° Medio A',
    position: 'Delegado General de Curso',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    proposal: 'Transparencia contable en tiempo real de todos los fondos del curso y gestión de polerones de graduación con diseño exclusivo.',
    active: true,
    colorTag: '#8b5cf6',
    createdAt: '2026-09-06T12:00:00Z',
  },
  {
    id: 'cand-5',
    electionId: 'elec-comite-4a',
    name: 'Catalina',
    lastName: 'Fuentealba Cid',
    course: '4° Medio A',
    position: 'Delegada General de Curso',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    proposal: 'Plan intensivo de rifas y venta de alimentos para financiar el 80% del viaje de fin de año de todos los compañeros.',
    active: true,
    colorTag: '#ec4899',
    createdAt: '2026-09-06T12:30:00Z',
  },

  // Candidates for Mascota
  {
    id: 'cand-6',
    electionId: 'elec-mascota-2026',
    name: 'Cóndor Andino',
    lastName: '"Altiplano"',
    course: 'Simbolismo Institucional',
    position: 'Mascota Oficial',
    photoUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&auto=format&fit=crop&q=80',
    proposal: 'Representa la altura de miras, fuerza y perseverancia en las cumbres académicas y deportivas.',
    active: true,
    colorTag: '#3b82f6',
    createdAt: '2026-07-29T10:00:00Z',
  },
  {
    id: 'cand-7',
    electionId: 'elec-mascota-2026',
    name: 'Puma Chileno',
    lastName: '"Garra"',
    course: 'Simbolismo Institucional',
    position: 'Mascota Oficial',
    photoUrl: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=400&auto=format&fit=crop&q=80',
    proposal: 'Representa la agilidad, disciplina y trabajo en equipo para todas las ligas atléticas del colegio.',
    active: true,
    colorTag: '#ef4444',
    createdAt: '2026-07-29T10:30:00Z',
  },
];

const defaultActivityOptions: ActivityOption[] = [
  {
    id: 'opt-act-1',
    electionId: 'elec-actividad-2026',
    title: 'Viaje y Campamento a la Playa',
    description: '3 días en complejo de cabañas en el litoral, con fogata de integración, dinámicas grupales y cena de bienvenida.',
    proposedDate: '2026-11-20',
    location: 'Litoral Central - Cabañas del Mar',
    estimatedCost: 45000,
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=80',
    additionalInfo: 'Incluye traslado en bus privado, hospedaje y alimentación completa.',
    active: true,
    createdAt: '2026-08-28T10:00:00Z',
  },
  {
    id: 'opt-act-2',
    electionId: 'elec-actividad-2026',
    title: 'Gala & Fiesta de Graduación de Ensueño',
    description: 'Cena formal en salón de eventos con servicio gastronómico, DJ profesional, pista iluminada y cabina fotográfica 360°.',
    proposedDate: '2026-12-12',
    location: 'Salón de Eventos Bellavista',
    estimatedCost: 38000,
    imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&auto=format&fit=crop&q=80',
    additionalInfo: 'Incluye cotillón temático, cena de 3 tiempos y recuerdos de graduación.',
    active: true,
    createdAt: '2026-08-28T10:30:00Z',
  },
  {
    id: 'opt-act-3',
    electionId: 'elec-actividad-2026',
    title: 'Jornada Deportiva & Parque de Aventura',
    description: 'Día completo de arborismo, canopy, muro de escalada deportiva, almuerzo campestre al aire libre y torneos intercursos.',
    proposedDate: '2026-11-06',
    location: 'Parque Aventura Cordillera',
    estimatedCost: 26000,
    imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=500&auto=format&fit=crop&q=80',
    additionalInfo: 'Incluye equipo de seguridad certificado, monitores e hidratación.',
    active: true,
    createdAt: '2026-08-28T11:00:00Z',
  },
  {
    id: 'opt-act-4',
    electionId: 'elec-actividad-2026',
    title: 'Feria Cultural & Festival de Bandas',
    description: 'Festival en el recinto institucional con stands gastronómicos, bandas escolares invitadas, expo de arte y torneo gamer.',
    proposedDate: '2026-10-24',
    location: 'Cancha Central & Gimnasio del Colegio',
    estimatedCost: 14000,
    imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&auto=format&fit=crop&q=80',
    additionalInfo: 'Acceso para toda la comunidad y familias. Fondos recaudados van al fondo común.',
    active: true,
    createdAt: '2026-08-28T11:30:00Z',
  },
];

const defaultActivities: Activity[] = [
  {
    id: 'act-1',
    name: 'Gran Kermés de Primavera 2026',
    description: 'Feria gastronómica y juegos recreativos con stands atendidos por los estudiantes para recaudar fondos de graduación.',
    date: '2026-09-05',
    responsible: 'Prof. Roberto Vásquez & Directiva 4to',
    category: 'Kermés',
    income: 850000,
    expenses: 320000,
    profit: 530000,
    createdAt: '2026-08-20T10:00:00Z',
  },
  {
    id: 'act-2',
    name: 'Rifa Solidaria Pro-Fondo Deportivo',
    description: 'Sorteo de canastas familiares y artículos electrónicos donados por apoderados.',
    date: '2026-08-18',
    responsible: 'Comité de Deportes y Recreación',
    category: 'Rifa',
    income: 420000,
    expenses: 75000,
    profit: 345000,
    createdAt: '2026-08-01T14:00:00Z',
  },
  {
    id: 'act-3',
    name: 'Venta de Empanadas y Bebidas Fiestas Patrias',
    description: 'Venta de almuerzos típicos durante el recreo extendido de vísperas de festividades.',
    date: '2026-09-12',
    responsible: 'Delegación de Tesorería Escolar',
    category: 'Venta',
    income: 260000,
    expenses: 110000,
    profit: 150000,
    createdAt: '2026-09-02T09:00:00Z',
  },
  {
    id: 'act-4',
    name: 'Torneo de Baby Fútbol Relámpago',
    description: 'Inscripción por equipos de alumnos y profesores con trofeos y medallas.',
    date: '2026-08-28',
    responsible: 'Lucas Vidal & Sofía Araya',
    category: 'Deportes',
    income: 180000,
    expenses: 45000,
    profit: 135000,
    createdAt: '2026-08-15T16:00:00Z',
  },
];

// Seed some existing anonymous ballots for completed election (mascota) and CCEE
const defaultVoterParticipation: VoterParticipationRecord[] = [
  {
    id: 'vp-1',
    electionId: 'elec-mascota-2026',
    studentId: 'user-stud-1',
    studentName: 'Carlos Mendoza Ruiz',
    studentCourse: '4° Medio A',
    votedAt: '2026-08-05T10:14:22Z',
    receiptHash: 'REC-MASCOTA-7F921B',
  },
  {
    id: 'vp-2',
    electionId: 'elec-mascota-2026',
    studentId: 'user-stud-2',
    studentName: 'Valeria Morales Silva',
    studentCourse: '3° Medio B',
    votedAt: '2026-08-05T11:45:10Z',
    receiptHash: 'REC-MASCOTA-83A49C',
  },
  {
    id: 'vp-3',
    electionId: 'elec-mascota-2026',
    studentId: 'user-stud-3',
    studentName: 'Diego Fernández Castro',
    studentCourse: '4° Medio B',
    votedAt: '2026-08-06T09:30:15Z',
    receiptHash: 'REC-MASCOTA-19D82F',
  },
  {
    id: 'vp-4',
    electionId: 'elec-ccee-2026',
    studentId: 'user-stud-2',
    studentName: 'Valeria Morales Silva',
    studentCourse: '3° Medio B',
    votedAt: '2026-09-02T14:10:00Z',
    receiptHash: 'REC-CCEE-44A992',
  },
];

const defaultAnonymousBallots: AnonymousBallot[] = [
  {
    id: 'bal-1',
    electionId: 'elec-mascota-2026',
    candidateId: 'cand-7', // Puma Garra
    timestamp: '2026-08-05T10:14:22Z',
    receiptHash: 'REC-MASCOTA-7F921B',
  },
  {
    id: 'bal-2',
    electionId: 'elec-mascota-2026',
    candidateId: 'cand-6', // Condor
    timestamp: '2026-08-05T11:45:10Z',
    receiptHash: 'REC-MASCOTA-83A49C',
  },
  {
    id: 'bal-3',
    electionId: 'elec-mascota-2026',
    candidateId: 'cand-7', // Puma Garra
    timestamp: '2026-08-06T09:30:15Z',
    receiptHash: 'REC-MASCOTA-19D82F',
  },
  {
    id: 'bal-4',
    electionId: 'elec-ccee-2026',
    candidateId: 'cand-1', // Camila Navarro
    timestamp: '2026-09-02T14:10:00Z',
    receiptHash: 'REC-CCEE-44A992',
  },
];

const defaultAuditLogs: AuditLog[] = [
  {
    id: 'log-1',
    action: 'INICIALIZACIÓN_SISTEMA',
    details: 'Base de datos de Voto Escolar configurada y asegurada.',
    user: 'Sistema',
    timestamp: '2026-08-25T10:00:00Z',
    type: 'system',
  },
  {
    id: 'log-2',
    action: 'APERTURA_ELECCIÓN',
    details: 'Se abrió oficialmente la votación "Elección Centro de Estudiantes 2026".',
    user: 'Prof. Roberto Vásquez (admin@votoescolar.edu)',
    timestamp: '2026-09-01T08:00:00Z',
    type: 'election',
  },
  {
    id: 'log-3',
    action: 'VOTO_EMITIDO',
    details: 'Un estudiante emitió su voto bajo comprobante anónimo REC-CCEE-44A992.',
    user: 'Estudiante (Anonimizado)',
    timestamp: '2026-09-02T14:10:00Z',
    type: 'vote',
  },
  {
    id: 'log-4',
    action: 'REGISTRO_ACTIVIDAD',
    details: 'Se registraron ingresos y balance para "Gran Kermés de Primavera 2026".',
    user: 'Prof. Roberto Vásquez',
    timestamp: '2026-09-05T20:30:00Z',
    type: 'activity',
  },
];

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = {
      users: [...defaultUsers],
      elections: [...defaultElections],
      candidates: [...defaultCandidates],
      activityOptions: [...defaultActivityOptions],
      voterParticipation: [...defaultVoterParticipation],
      anonymousBallots: [...defaultAnonymousBallots],
      activities: [...defaultActivities],
      auditLogs: [...defaultAuditLogs],
    };
    this.load();
  }

  private load() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);

        // Migrate users with status if missing
        const loadedUsers = (parsed.users || defaultUsers).map((u: any) => ({
          ...u,
          status: u.status || 'activo',
        }));

        // Migrate elections with type if missing
        const loadedElections: Election[] = (parsed.elections || defaultElections).map((e: any) => ({
          ...e,
          type: e.type || (e.id.includes('actividad') ? 'actividad' : 'comite'),
        }));

        // Ensure default activity election exists if none present
        if (!loadedElections.some((e) => e.type === 'actividad')) {
          const sampleAct = defaultElections.find((e) => e.type === 'actividad');
          if (sampleAct) loadedElections.push(sampleAct);
        }

        const loadedActivityOptions = parsed.activityOptions && parsed.activityOptions.length > 0
          ? parsed.activityOptions
          : [...defaultActivityOptions];

        this.data = {
          users: loadedUsers,
          elections: loadedElections,
          candidates: parsed.candidates || defaultCandidates,
          activityOptions: loadedActivityOptions,
          voterParticipation: parsed.voterParticipation || defaultVoterParticipation,
          anonymousBallots: parsed.anonymousBallots || defaultAnonymousBallots,
          activities: parsed.activities || defaultActivities,
          courseGoals: parsed.courseGoals,
          auditLogs: parsed.auditLogs || defaultAuditLogs,
        };
      } else {
        this.save();
      }
    } catch (err) {
      console.warn('Could not read persistent DB file, using memory/defaults:', err);
    }
  }

  private save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving DB file:', err);
    }
  }

  public resetToDefaults() {
    this.data = {
      users: [...defaultUsers],
      elections: [...defaultElections],
      candidates: [...defaultCandidates],
      activityOptions: [...defaultActivityOptions],
      voterParticipation: [...defaultVoterParticipation],
      anonymousBallots: [...defaultAnonymousBallots],
      activities: [...defaultActivities],
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          action: 'REINICIO_DEMO',
          details: 'Datos de prueba restablecidos con éxito.',
          user: 'Administrador',
          timestamp: new Date().toISOString(),
          type: 'system',
        },
      ],
    };
    this.save();
  }

  // --- USERS & AUTH ---
  public findUserByEmail(email: string) {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  }

  public findUserById(id: string) {
    const user = this.data.users.find((u) => u.id === id);
    if (!user) return null;
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  public getAllUsers() {
    return this.data.users.map(({ passwordHash, ...safe }) => safe);
  }

  public createUser(userData: {
    name: string;
    lastName: string;
    email: string;
    password: string;
    role?: 'student' | 'admin';
    course?: string;
    studentIdNumber?: string;
  }): User {
    const existing = this.findUserByEmail(userData.email);
    if (existing) {
      throw new Error('El correo electrónico ya se encuentra registrado en el sistema.');
    }

    const newUser: User & { passwordHash: string } = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: userData.name.trim(),
      lastName: userData.lastName.trim(),
      email: userData.email.toLowerCase().trim(),
      role: userData.role || 'student',
      course: userData.course?.trim() || (userData.role === 'admin' ? undefined : '1° Medio A'),
      studentIdNumber:
        userData.studentIdNumber?.trim() ||
        (userData.role === 'admin' ? undefined : `EST-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`),
      createdAt: new Date().toISOString(),
      passwordHash: hashPassword(userData.password),
    };

    this.data.users.push(newUser);
    this.addAuditLog('REGISTRO_USUARIO', `Nuevo usuario registrado: ${newUser.name} ${newUser.lastName} (${newUser.role})`, newUser.email, 'user');
    this.save();

    const { passwordHash, ...safe } = newUser;
    return safe;
  }

  public verifyCredentials(email: string, password: string):User | null {
    const user = this.findUserByEmail(email);
    if (!user) return null;
    const hash = hashPassword(password);
    if (user.passwordHash !== hash) return null;
    const { passwordHash, ...safe } = user;
    return safe;
  }

  // --- ELECTIONS ---
  public getElections(studentId?: string): Election[] {
    return this.data.elections.map((elec) => {
      const candidatesCount = this.data.candidates.filter((c) => c.electionId === elec.id && c.active).length;
      const activityOptionsCount = (this.data.activityOptions || []).filter((o) => o.electionId === elec.id && o.active).length;
      let hasVoted = false;
      let myReceipt: string | undefined = undefined;

      if (studentId) {
        const participation = this.data.voterParticipation.find(
          (vp) => vp.electionId === elec.id && vp.studentId === studentId
        );
        if (participation) {
          hasVoted = true;
          myReceipt = participation.receiptHash;
        }
      }

      return {
        ...elec,
        type: elec.type || 'comite',
        candidatesCount,
        activityOptionsCount,
        hasVoted,
        myReceipt,
      };
    });
  }

  public getElectionById(
    id: string,
    studentId?: string
  ): (Election & { candidates: Candidate[]; activityOptions: ActivityOption[] }) | null {
    const elec = this.data.elections.find((e) => e.id === id);
    if (!elec) return null;

    const candidates = this.data.candidates.filter((c) => c.electionId === id);
    const activityOptions = (this.data.activityOptions || []).filter((o) => o.electionId === id);
    const candidatesCount = candidates.filter((c) => c.active).length;
    const activityOptionsCount = activityOptions.filter((o) => o.active).length;
    let hasVoted = false;
    let myReceipt: string | undefined = undefined;

    if (studentId) {
      const participation = this.data.voterParticipation.find(
        (vp) => vp.electionId === id && vp.studentId === studentId
      );
      if (participation) {
        hasVoted = true;
        myReceipt = participation.receiptHash;
      }
    }

    return {
      ...elec,
      type: elec.type || 'comite',
      candidatesCount,
      activityOptionsCount,
      hasVoted,
      myReceipt,
      candidates,
      activityOptions,
    };
  }

  public createElection(
    electionData: Omit<Election, 'id' | 'createdAt'> & {
      initialCandidates?: Array<Omit<Candidate, 'id' | 'electionId' | 'createdAt'>>;
      initialActivityOptions?: Array<Omit<ActivityOption, 'id' | 'electionId' | 'createdAt'>>;
    },
    userEmail: string
  ): Election {
    const { initialCandidates, initialActivityOptions, ...elecProps } = electionData;
    const newElec: Election = {
      ...elecProps,
      id: `elec-${Date.now()}`,
      type: elecProps.type || 'comite',
      status: elecProps.status || 'pendiente',
      showResultsToStudents: Boolean(elecProps.showResultsToStudents),
      createdAt: new Date().toISOString(),
    };
    this.data.elections.unshift(newElec);

    // If initial candidates were submitted, create them
    if (newElec.type === 'comite' && initialCandidates && Array.isArray(initialCandidates)) {
      initialCandidates.forEach((cand) => {
        if (cand.name && cand.lastName) {
          this.data.candidates.push({
            id: `cand-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            electionId: newElec.id,
            name: cand.name.trim(),
            lastName: cand.lastName.trim(),
            course: cand.course || newElec.targetCourse || 'General',
            position: cand.position || 'Candidato',
            photoUrl: cand.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
            proposal: cand.proposal || '',
            active: cand.active !== false,
            createdAt: new Date().toISOString(),
          });
        }
      });
    }

    // If initial activity options were submitted, create them
    if (newElec.type === 'actividad' && initialActivityOptions && Array.isArray(initialActivityOptions)) {
      if (!this.data.activityOptions) this.data.activityOptions = [];
      initialActivityOptions.forEach((opt) => {
        if (opt.title) {
          this.data.activityOptions!.push({
            id: `opt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            electionId: newElec.id,
            title: opt.title.trim(),
            description: opt.description || '',
            proposedDate: opt.proposedDate,
            location: opt.location,
            estimatedCost: Number(opt.estimatedCost) || 0,
            imageUrl: opt.imageUrl || 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=500&auto=format&fit=crop&q=80',
            additionalInfo: opt.additionalInfo || '',
            active: opt.active !== false,
            createdAt: new Date().toISOString(),
          });
        }
      });
    }

    this.addAuditLog('CREACIÓN_ELECCIÓN', `Se creó la elección (${newElec.type}): "${newElec.title}"`, userEmail, 'election');
    this.save();
    return newElec;
  }

  public duplicateElection(id: string, userEmail: string): Election {
    const original = this.data.elections.find((e) => e.id === id);
    if (!original) throw new Error('Elección original no encontrada.');

    const newId = `elec-${Date.now()}`;
    const duplicatedElec: Election = {
      ...original,
      id: newId,
      title: `Copia de ${original.title}`,
      status: 'pendiente',
      showResultsToStudents: false,
      createdAt: new Date().toISOString(),
    };
    this.data.elections.unshift(duplicatedElec);

    // Duplicate candidates if comite
    if (original.type === 'comite' || !original.type) {
      const originalCandidates = this.data.candidates.filter((c) => c.electionId === id);
      originalCandidates.forEach((c) => {
        this.data.candidates.push({
          ...c,
          id: `cand-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          electionId: newId,
          createdAt: new Date().toISOString(),
        });
      });
    }

    // Duplicate activity options if actividad
    if (original.type === 'actividad') {
      const originalOptions = (this.data.activityOptions || []).filter((o) => o.electionId === id);
      if (!this.data.activityOptions) this.data.activityOptions = [];
      originalOptions.forEach((o) => {
        this.data.activityOptions!.push({
          ...o,
          id: `opt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          electionId: newId,
          createdAt: new Date().toISOString(),
        });
      });
    }

    this.addAuditLog('DUPLICACIÓN_ELECCIÓN', `Se duplicó la elección "${original.title}" -> "${duplicatedElec.title}"`, userEmail, 'election');
    this.save();
    return duplicatedElec;
  }

  public updateElection(id: string, updates: Partial<Election>, userEmail: string): Election {
    const idx = this.data.elections.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error('Elección no encontrada.');

    this.data.elections[idx] = {
      ...this.data.elections[idx],
      ...updates,
    };
    this.addAuditLog('EDICIÓN_ELECCIÓN', `Actualización en elección: "${this.data.elections[idx].title}"`, userEmail, 'election');
    this.save();
    return this.data.elections[idx];
  }

  public deleteElection(id: string, userEmail: string): boolean {
    const idx = this.data.elections.findIndex((e) => e.id === id);
    if (idx === -1) return false;

    const title = this.data.elections[idx].title;
    this.data.elections.splice(idx, 1);
    // Also cleanup candidates, activity options, ballots, participation for this election
    this.data.candidates = this.data.candidates.filter((c) => c.electionId !== id);
    if (this.data.activityOptions) {
      this.data.activityOptions = this.data.activityOptions.filter((o) => o.electionId !== id);
    }
    this.data.anonymousBallots = this.data.anonymousBallots.filter((b) => b.electionId !== id);
    this.data.voterParticipation = this.data.voterParticipation.filter((v) => v.electionId !== id);

    this.addAuditLog('ELIMINACIÓN_ELECCIÓN', `Se eliminó la elección: "${title}" y sus registros`, userEmail, 'election');
    this.save();
    return true;
  }

  // --- CANDIDATES ---
  public getCandidates(electionId?: string): Candidate[] {
    if (electionId) {
      return this.data.candidates.filter((c) => c.electionId === electionId);
    }
    return this.data.candidates;
  }

  public createCandidate(candidateData: Omit<Candidate, 'id' | 'createdAt'>, userEmail: string): Candidate {
    const elec = this.data.elections.find((e) => e.id === candidateData.electionId);
    if (!elec) throw new Error('La elección especificada no existe.');

    // Avoid duplicate candidates with same name and election
    const exists = this.data.candidates.some(
      (c) =>
        c.electionId === candidateData.electionId &&
        c.name.toLowerCase() === candidateData.name.toLowerCase().trim() &&
        c.lastName.toLowerCase() === candidateData.lastName.toLowerCase().trim()
    );
    if (exists) {
      throw new Error('Ya existe un candidato registrado con ese nombre y apellido en esta elección.');
    }

    const newCandidate: Candidate = {
      ...candidateData,
      id: `cand-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    this.data.candidates.push(newCandidate);
    this.addAuditLog(
      'CREACIÓN_CANDIDATO',
      `Candidato agregado: ${newCandidate.name} ${newCandidate.lastName} (${newCandidate.position}) a la elección "${elec.title}"`,
      userEmail,
      'election'
    );
    this.save();
    return newCandidate;
  }

  public updateCandidate(id: string, updates: Partial<Candidate>, userEmail: string): Candidate {
    const idx = this.data.candidates.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Candidato no encontrado.');

    this.data.candidates[idx] = {
      ...this.data.candidates[idx],
      ...updates,
    };
    this.addAuditLog('EDICIÓN_CANDIDATO', `Candidato actualizado: ${this.data.candidates[idx].name} ${this.data.candidates[idx].lastName}`, userEmail, 'election');
    this.save();
    return this.data.candidates[idx];
  }

  public deleteCandidate(id: string, userEmail: string): boolean {
    const idx = this.data.candidates.findIndex((c) => c.id === id);
    if (idx === -1) return false;

    const cand = this.data.candidates[idx];
    this.data.candidates.splice(idx, 1);
    this.addAuditLog('ELIMINACIÓN_CANDIDATO', `Candidato eliminado: ${cand.name} ${cand.lastName}`, userEmail, 'election');
    this.save();
    return true;
  }

  // --- ACTIVITY OPTIONS (Elección de Actividad) ---
  public getActivityOptions(electionId?: string): ActivityOption[] {
    const list = this.data.activityOptions || [];
    if (electionId) {
      return list.filter((o) => o.electionId === electionId);
    }
    return list;
  }

  public createActivityOption(data: Omit<ActivityOption, 'id' | 'createdAt'>, userEmail: string): ActivityOption {
    if (!this.data.activityOptions) this.data.activityOptions = [];
    const elec = this.data.elections.find((e) => e.id === data.electionId);
    if (!elec) throw new Error('La elección especificada no existe.');

    const newOption: ActivityOption = {
      ...data,
      id: `opt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      active: data.active !== false,
      createdAt: new Date().toISOString(),
    };
    this.data.activityOptions.push(newOption);
    this.addAuditLog('CREACIÓN_OPCIÓN_ACTIVIDAD', `Opción creada: "${newOption.title}" en la elección "${elec.title}"`, userEmail, 'election');
    this.save();
    return newOption;
  }

  public updateActivityOption(id: string, updates: Partial<ActivityOption>, userEmail: string): ActivityOption {
    if (!this.data.activityOptions) this.data.activityOptions = [];
    const idx = this.data.activityOptions.findIndex((o) => o.id === id);
    if (idx === -1) throw new Error('Opción de actividad no encontrada.');

    this.data.activityOptions[idx] = {
      ...this.data.activityOptions[idx],
      ...updates,
    };
    this.addAuditLog('EDICIÓN_OPCIÓN_ACTIVIDAD', `Opción modificada: "${this.data.activityOptions[idx].title}"`, userEmail, 'election');
    this.save();
    return this.data.activityOptions[idx];
  }

  public deleteActivityOption(id: string, userEmail: string): boolean {
    if (!this.data.activityOptions) return false;
    const idx = this.data.activityOptions.findIndex((o) => o.id === id);
    if (idx === -1) return false;

    const opt = this.data.activityOptions[idx];
    this.data.activityOptions.splice(idx, 1);
    this.addAuditLog('ELIMINACIÓN_OPCIÓN_ACTIVIDAD', `Opción eliminada: "${opt.title}"`, userEmail, 'election');
    this.save();
    return true;
  }

  // --- VOTING SYSTEM WITH SECRET BALLOT & DOUBLE-VOTE IMMUNITY ---
  /**
   * CRITICAL SECURITY METHOD:
   * 1. Validates election is 'activa' and current date is within startDate and endDate
   * 2. Checks active status of student user (must be 'activo')
   * 3. Validates option exists, is active, and belongs to this election (candidate or activity option)
   * 4. Atomically checks if the studentId already exists in voterParticipation
   * 5. If already voted, throws strict 409 error (unless allowVoteModification is explicitly set)
   * 6. Enters student in voterParticipation (names student, timestamp, unique anonymous receipt)
   * 7. Enters anonymous ballot in anonymousBallots (ONLY candidateId / activityOptionId + electionId + receipt; ZERO student ID)
   * This guarantees true secret ballot while preventing double voting!
   */
  public castVote(
    electionId: string,
    selectedOptionId: string,
    studentUser: User
  ): { receipt: string; votedAt: string } {
    const election = this.data.elections.find((e) => e.id === electionId);
    if (!election) {
      throw new Error('La elección especificada no existe.');
    }

    if (election.status !== 'activa') {
      throw new Error(`La elección no se encuentra activa. Estado actual: ${election.status}.`);
    }

    const now = new Date();
    const start = new Date(election.startDate);
    const end = new Date(election.endDate);

    if (now < start) {
      throw new Error(`La elección aún no ha comenzado. Fecha de inicio: ${start.toLocaleString('es-ES')}.`);
    }
    if (now > end) {
      throw new Error(`La elección ha finalizado. Fecha de cierre: ${end.toLocaleString('es-ES')}.`);
    }

    // STRICT CHECK: Student status in DB
    const studentInDb = this.data.users.find((u) => u.id === studentUser.id);
    if (studentInDb && studentInDb.status === 'inactivo') {
      throw new Error('Tu cuenta de estudiante está desactivada. Por favor, contacta a la administración escolar.');
    }

    // STRICT CHECK: Has this student already participated?
    const alreadyVoted = this.data.voterParticipation.some(
      (vp) => vp.electionId === electionId && vp.studentId === studentUser.id
    );
    if (alreadyVoted && !election.allowVoteModification) {
      throw new Error('¡Ya has participado en esta elección! El sistema no permite emitir dos votos.');
    }

    const isActivityElection = election.type === 'actividad';
    let candidateId: string | undefined = undefined;
    let activityOptionId: string | undefined = undefined;

    if (isActivityElection) {
      const option = (this.data.activityOptions || []).find(
        (o) => o.id === selectedOptionId && o.electionId === electionId
      );
      if (!option || !option.active) {
        throw new Error('La opción de actividad seleccionada no es válida o no está disponible.');
      }
      activityOptionId = option.id;
    } else {
      const candidate = this.data.candidates.find(
        (c) => c.id === selectedOptionId && c.electionId === electionId
      );
      if (!candidate || !candidate.active) {
        throw new Error('El candidato seleccionado no es válido o no está activo.');
      }
      candidateId = candidate.id;
    }

    // Generate cryptographic anonymous receipt token
    const tokenRandom = crypto.randomBytes(6).toString('hex').toUpperCase();
    const receipt = `VOT-${electionId.slice(-4).toUpperCase()}-${tokenRandom.slice(0, 4)}-${tokenRandom.slice(4)}`;
    const votedAt = new Date().toISOString();

    // 1. Record voter participation (Identity linked to receipt, but NOT to candidate or option)
    if (alreadyVoted && election.allowVoteModification) {
      const vpIdx = this.data.voterParticipation.findIndex(
        (vp) => vp.electionId === electionId && vp.studentId === studentUser.id
      );
      const oldReceipt = this.data.voterParticipation[vpIdx].receiptHash;
      this.data.voterParticipation[vpIdx].receiptHash = receipt;
      this.data.voterParticipation[vpIdx].votedAt = votedAt;

      // Update anonymous ballot with matching old receipt
      const bIdx = this.data.anonymousBallots.findIndex((b) => b.receiptHash === oldReceipt);
      if (bIdx !== -1) {
        this.data.anonymousBallots[bIdx] = {
          ...this.data.anonymousBallots[bIdx],
          candidateId,
          activityOptionId,
          receiptHash: receipt,
          timestamp: votedAt,
        };
      }
    } else {
      const participationRecord: VoterParticipationRecord = {
        id: `vp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        electionId,
        studentId: studentUser.id,
        studentName: `${studentUser.name} ${studentUser.lastName}`,
        studentCourse: studentUser.course || 'Estudiante',
        votedAt,
        receiptHash: receipt,
      };
      this.data.voterParticipation.push(participationRecord);

      // 2. Record anonymous ballot into digital ballot box (Choice linked to receipt, NOT to student)
      const ballot: AnonymousBallot = {
        id: `bal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        electionId,
        candidateId,
        activityOptionId,
        timestamp: votedAt,
        receiptHash: receipt,
      };
      this.data.anonymousBallots.push(ballot);
    }

    // Audit log without revealing the vote choice
    this.addAuditLog(
      'VOTO_REGISTRADO',
      `Estudiante ${studentUser.name} ${studentUser.lastName} (${studentUser.course}) emitió su voto bajo comprobante secreto ${receipt}.`,
      studentUser.email,
      'vote'
    );

    this.save();
    return { receipt, votedAt };
  }

  // --- ELECTION RESULTS ---
  public getElectionResults(electionId: string, requestingUser?: User): ElectionResults {
    const election = this.data.elections.find((e) => e.id === electionId);
    if (!election) throw new Error('Elección no encontrada.');

    const isStudent = requestingUser?.role === 'student';
    if (isStudent && !election.showResultsToStudents && election.status !== 'finalizada') {
      throw new Error('Los resultados de esta elección aún no han sido publicados por el administrador.');
    }

    const ballots = this.data.anonymousBallots.filter((b) => b.electionId === electionId);
    const registeredStudents = this.data.users.filter((u) => u.role === 'student' && u.status !== 'inactivo');

    const totalVotes = ballots.length;
    const totalEligibleStudents = Math.max(registeredStudents.length, totalVotes);
    const votedCount = this.data.voterParticipation.filter((vp) => vp.electionId === electionId).length;
    const notVotedCount = Math.max(0, totalEligibleStudents - votedCount);
    const participationPercentage = totalEligibleStudents > 0 ? Math.round((votedCount / totalEligibleStudents) * 100) : 0;

    const electionType = election.type || 'comite';

    let candidateResults: ElectionResults['candidateResults'] = [];
    let activityResults: ActivityOptionResult[] | undefined = undefined;
    let winningActivity: ActivityOptionResult | null = null;

    if (electionType === 'actividad') {
      const options = (this.data.activityOptions || []).filter((o) => o.electionId === electionId);
      activityResults = options.map((opt) => {
        const votes = ballots.filter((b) => b.activityOptionId === opt.id).length;
        const percentage = totalVotes > 0 ? Number(((votes / totalVotes) * 100).toFixed(1)) : 0;
        return {
          option: opt,
          votes,
          percentage,
        };
      });
      activityResults.sort((a, b) => b.votes - a.votes);
      if (activityResults.length > 0 && activityResults[0].votes > 0) {
        winningActivity = activityResults[0];
      }
    } else {
      const candidates = this.data.candidates.filter((c) => c.electionId === electionId);
      candidateResults = candidates.map((cand) => {
        const votes = ballots.filter((b) => b.candidateId === cand.id).length;
        const percentage = totalVotes > 0 ? Number(((votes / totalVotes) * 100).toFixed(1)) : 0;
        return {
          candidate: cand,
          votes,
          percentage,
        };
      });
      // Sort candidates by highest votes
      candidateResults.sort((a, b) => b.votes - a.votes);
    }

    return {
      electionId,
      electionTitle: election.title,
      electionType,
      status: election.status,
      showResultsToStudents: election.showResultsToStudents,
      totalVotes,
      totalEligibleStudents,
      participationPercentage,
      votedCount,
      notVotedCount,
      candidateResults,
      activityResults,
      winningActivity,
      lastUpdated: new Date().toISOString(),
    };
  }

  public getVotersForElection(electionId: string): VoterParticipationRecord[] {
    return this.data.voterParticipation.filter((v) => v.electionId === electionId);
  }

  // --- ACTIVITIES & FINANCES ---
  public getActivities(): Activity[] {
    return this.data.activities.map((act) => ({
      ...act,
      profit: act.income - act.expenses, // Always enforce GANANCIA = INGRESOS - GASTOS
    }));
  }

  public createActivity(activityData: Omit<Activity, 'id' | 'profit' | 'createdAt'>, userEmail: string): Activity {
    const income = Number(activityData.income) || 0;
    const expenses = Number(activityData.expenses) || 0;
    const newAct: Activity = {
      ...activityData,
      id: `act-${Date.now()}`,
      income,
      expenses,
      profit: income - expenses,
      createdAt: new Date().toISOString(),
    };
    this.data.activities.unshift(newAct);
    this.addAuditLog('CREACIÓN_ACTIVIDAD', `Actividad creada: "${newAct.name}" (Ganancia est.: $${newAct.profit.toLocaleString('es-ES')})`, userEmail, 'activity');
    this.save();
    return newAct;
  }

  public updateActivity(id: string, updates: Partial<Activity>, userEmail: string): Activity {
    const idx = this.data.activities.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error('Actividad no encontrada.');

    const current = this.data.activities[idx];
    const income = updates.income !== undefined ? Number(updates.income) : current.income;
    const expenses = updates.expenses !== undefined ? Number(updates.expenses) : current.expenses;

    this.data.activities[idx] = {
      ...current,
      ...updates,
      income,
      expenses,
      profit: income - expenses,
    };

    this.addAuditLog('EDICIÓN_ACTIVIDAD', `Actividad modificada: "${this.data.activities[idx].name}"`, userEmail, 'activity');
    this.save();
    return this.data.activities[idx];
  }

  public deleteActivity(id: string, userEmail: string): boolean {
    const idx = this.data.activities.findIndex((a) => a.id === id);
    if (idx === -1) return false;

    const name = this.data.activities[idx].name;
    this.data.activities.splice(idx, 1);
    this.addAuditLog('ELIMINACIÓN_ACTIVIDAD', `Actividad eliminada: "${name}"`, userEmail, 'activity');
    this.save();
    return true;
  }

  public getFinancesSummary(): import('../src/types.ts').FinancialSummary {
    const activities = this.getActivities();
    const totalIncome = activities.reduce((acc, a) => acc + (a.income || 0), 0);
    const totalExpenses = activities.reduce((acc, a) => acc + (a.expenses || 0), 0);
    const netProfit = totalIncome - totalExpenses;

    if (!this.data.courseGoals || this.data.courseGoals.length === 0) {
      this.data.courseGoals = [
        {
          id: 'goal-1',
          title: 'Polerones de Generación 4° Medio',
          targetAmount: 850000,
          currentAmount: Math.min(850000, Math.max(0, netProfit)),
          percentageReached: Math.min(100, Math.round((Math.max(0, netProfit) / 850000) * 100)),
          deadline: '2026-10-30T00:00:00.000Z',
          description: 'Financiamiento del 100% del diseño y confección de los polerones de graduación del curso.',
          createdAt: '2026-03-01T10:00:00.000Z',
        },
        {
          id: 'goal-2',
          title: 'Cena y Fiesta de Graduación',
          targetAmount: 1500000,
          currentAmount: Math.min(1500000, Math.max(0, Math.floor(netProfit * 0.7))),
          percentageReached: Math.min(100, Math.round((Math.max(0, Math.floor(netProfit * 0.7)) / 1500000) * 100)),
          deadline: '2026-12-15T00:00:00.000Z',
          description: 'Reserva de local, banquetería, DJ e iluminación para la despedida formal del curso.',
          createdAt: '2026-03-05T12:00:00.000Z',
        },
      ];
      this.save();
    } else {
      // Dynamically update current amounts based on net profit
      this.data.courseGoals = this.data.courseGoals.map((g, idx) => {
        const factor = idx === 0 ? 1 : 0.6;
        const currentAmount = Math.min(g.targetAmount, Math.max(0, Math.floor(netProfit * factor)));
        return {
          ...g,
          currentAmount,
          percentageReached: Math.min(100, Math.round((currentAmount / Math.max(1, g.targetAmount)) * 100)),
        };
      });
    }

    return {
      totalIncome,
      totalExpenses,
      netProfit,
      activitiesBreakdown: activities,
      goals: this.data.courseGoals,
    };
  }

  public createCourseGoal(
    data: { title: string; targetAmount: number; deadline: string; description?: string },
    userEmail: string
  ): import('../src/types.ts').CourseGoal {
    if (!this.data.courseGoals) {
      this.data.courseGoals = [];
    }

    const netProfit = this.data.activities.reduce((acc, a) => acc + (a.income - a.expenses), 0);
    const newGoal: import('../src/types.ts').CourseGoal = {
      id: `goal-${Date.now()}`,
      title: data.title,
      targetAmount: Number(data.targetAmount) || 100000,
      currentAmount: Math.min(Number(data.targetAmount) || 100000, Math.max(0, netProfit)),
      percentageReached: Math.min(
        100,
        Math.round((Math.max(0, netProfit) / Math.max(1, Number(data.targetAmount) || 100000)) * 100)
      ),
      deadline: data.deadline,
      description: data.description || '',
      createdAt: new Date().toISOString(),
    };

    this.data.courseGoals.push(newGoal);
    this.addAuditLog('CREACIÓN_META_FINANCIERA', `Nueva meta del curso creada: "${newGoal.title}" ($${newGoal.targetAmount})`, userEmail, 'activity');
    this.save();
    return newGoal;
  }

  // --- ADMIN DASHBOARD & AUDIT LOGS ---
  public getAdminStats(): AdminDashboardStats {
    const registeredStudents = this.data.users.filter((u) => u.role === 'student');
    const activeElections = this.data.elections.filter((e) => e.status === 'activa');
    const totalVotes = this.data.anonymousBallots.length;

    // Global participation rate across all elections
    const totalPossibleVotes = this.data.elections.length * Math.max(1, registeredStudents.length);
    const globalTurnout = totalPossibleVotes > 0 ? Math.round((this.data.voterParticipation.length / totalPossibleVotes) * 100) : 0;

    const totalIncome = this.data.activities.reduce((acc, a) => acc + (a.income || 0), 0);
    const totalExpenses = this.data.activities.reduce((acc, a) => acc + (a.expenses || 0), 0);
    const accumulatedProfit = totalIncome - totalExpenses;

    return {
      registeredStudentsCount: registeredStudents.length,
      activeElectionsCount: activeElections.length,
      totalVotesCount: totalVotes,
      globalParticipationPercentage: Math.min(100, globalTurnout),
      activitiesCount: this.data.activities.length,
      totalIncome,
      totalExpenses,
      accumulatedProfit,
    };
  }

  public getAuditLogs(limit: number = 50): AuditLog[] {
    return [...this.data.auditLogs].reverse().slice(0, limit);
  }

  public addAuditLog(action: string, details: string, user: string, type: AuditLog['type']) {
    this.data.auditLogs.push({
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      action,
      details,
      user,
      timestamp: new Date().toISOString(),
      type,
    });
  }

  public getStudentParticipationStatus() {
    const students = this.data.users.filter((u) => u.role === 'student');
    const elections = this.data.elections;

    return students.map((s) => {
      const studentParticipations = this.data.voterParticipation.filter((vp) => vp.studentId === s.id);
      return {
        student: s,
        votedElectionsCount: studentParticipations.length,
        participations: studentParticipations.map((p) => {
          const elec = elections.find((e) => e.id === p.electionId);
          return {
            electionId: p.electionId,
            electionTitle: elec ? elec.title : p.electionId,
            votedAt: p.votedAt,
            receiptHash: p.receiptHash,
          };
        }),
      };
    });
  }

  // --- STUDENT MANAGEMENT (CRUD & CSV IMPORT) ---
  public getStudents(search?: string, course?: string, status?: string): User[] {
    let list = this.data.users
      .filter((u) => u.role === 'student')
      .map(({ passwordHash, ...safe }) => safe);

    if (search && search.trim()) {
      const term = search.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(term) ||
          s.lastName.toLowerCase().includes(term) ||
          s.email.toLowerCase().includes(term) ||
          (s.studentIdNumber && s.studentIdNumber.toLowerCase().includes(term))
      );
    }

    if (course && course !== 'todos') {
      list = list.filter((s) => s.course === course);
    }

    if (status && status !== 'todos') {
      list = list.filter((s) => s.status === status);
    }

    return list;
  }

  public createStudent(
    studentData: {
      name: string;
      lastName: string;
      email: string;
      course?: string;
      studentIdNumber?: string;
      password?: string;
      status?: 'activo' | 'inactivo';
    },
    userEmail: string
  ): User {
    const cleanEmail = studentData.email.toLowerCase().trim();
    if (!cleanEmail) throw new Error('El correo electrónico es obligatorio.');
    if (!studentData.name.trim() || !studentData.lastName.trim()) {
      throw new Error('El nombre y apellido son obligatorios.');
    }

    const existing = this.findUserByEmail(cleanEmail);
    if (existing) {
      throw new Error(`El correo ${cleanEmail} ya está registrado en el sistema.`);
    }

    const rawPassword = studentData.password && studentData.password.trim() ? studentData.password.trim() : 'estudiante123';
    const passwordHash = hashPassword(rawPassword);

    const newStudent: User & { passwordHash: string } = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: studentData.name.trim(),
      lastName: studentData.lastName.trim(),
      email: cleanEmail,
      role: 'student',
      course: studentData.course?.trim() || '1° Medio A',
      studentIdNumber:
        studentData.studentIdNumber?.trim() ||
        `EST-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      status: studentData.status || 'activo',
      createdAt: new Date().toISOString(),
      passwordHash,
    };

    this.data.users.push(newStudent);
    this.addAuditLog(
      'CREACIÓN_ESTUDIANTE',
      `Estudiante creado: ${newStudent.name} ${newStudent.lastName} (${newStudent.course} - ${newStudent.email})`,
      userEmail,
      'user'
    );
    this.save();

    const { passwordHash: _, ...safe } = newStudent;
    return safe;
  }

  public updateStudent(
    id: string,
    updates: Partial<User> & { password?: string },
    userEmail: string
  ): User {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error('Estudiante no encontrado.');

    const current = this.data.users[idx];

    // Check email collision if email is being updated
    if (updates.email && updates.email.toLowerCase().trim() !== current.email.toLowerCase().trim()) {
      const emailCollision = this.findUserByEmail(updates.email);
      if (emailCollision && emailCollision.id !== id) {
        throw new Error(`El correo ${updates.email} ya pertenece a otro usuario.`);
      }
    }

    const newPasswordHash = updates.password && updates.password.trim()
      ? hashPassword(updates.password.trim())
      : current.passwordHash;

    const updatedUser = {
      ...current,
      ...updates,
      email: updates.email ? updates.email.toLowerCase().trim() : current.email,
      name: updates.name ? updates.name.trim() : current.name,
      lastName: updates.lastName ? updates.lastName.trim() : current.lastName,
      passwordHash: newPasswordHash,
    };

    this.data.users[idx] = updatedUser;
    this.addAuditLog(
      'EDICIÓN_ESTUDIANTE',
      `Estudiante actualizado: ${updatedUser.name} ${updatedUser.lastName} (Estado: ${updatedUser.status || 'activo'})`,
      userEmail,
      'user'
    );
    this.save();

    const { passwordHash: _, ...safe } = updatedUser;
    return safe;
  }

  public deleteStudent(id: string, userEmail: string): boolean {
    const idx = this.data.users.findIndex((u) => u.id === id && u.role === 'student');
    if (idx === -1) return false;

    const student = this.data.users[idx];
    this.data.users.splice(idx, 1);

    this.addAuditLog(
      'ELIMINACIÓN_ESTUDIANTE',
      `Estudiante eliminado: ${student.name} ${student.lastName} (${student.email})`,
      userEmail,
      'user'
    );
    this.save();
    return true;
  }

  public bulkImportStudents(
    rows: Array<{
      name: string;
      lastName: string;
      email: string;
      course?: string;
      studentIdNumber?: string;
      password?: string;
    }>,
    userEmail: string
  ): { importedCount: number; skippedCount: number; errors: string[]; createdStudents: User[] } {
    let importedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];
    const createdStudents: User[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const cleanEmail = (row.email || '').toLowerCase().trim();
      const cleanName = (row.name || '').trim();
      const cleanLastName = (row.lastName || '').trim();

      if (!cleanEmail || !cleanName || !cleanLastName) {
        skippedCount++;
        errors.push(`Fila ${i + 1}: Faltan campos requeridos (nombre, apellido o correo).`);
        continue;
      }

      if (this.findUserByEmail(cleanEmail)) {
        skippedCount++;
        errors.push(`Fila ${i + 1}: El correo ${cleanEmail} ya está registrado.`);
        continue;
      }

      try {
        const rawPassword = row.password && row.password.trim() ? row.password.trim() : 'estudiante123';
        const newStudent: User & { passwordHash: string } = {
          id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}-${i}`,
          name: cleanName,
          lastName: cleanLastName,
          email: cleanEmail,
          role: 'student',
          course: row.course?.trim() || '1° Medio A',
          studentIdNumber:
            row.studentIdNumber?.trim() ||
            `EST-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
          status: 'activo',
          createdAt: new Date().toISOString(),
          passwordHash: hashPassword(rawPassword),
        };

        this.data.users.push(newStudent);
        importedCount++;
        const { passwordHash: _, ...safe } = newStudent;
        createdStudents.push(safe);
      } catch (err: any) {
        skippedCount++;
        errors.push(`Fila ${i + 1} (${cleanEmail}): ${err.message || 'Error al procesar'}`);
      }
    }

    if (importedCount > 0) {
      this.addAuditLog(
        'IMPORTACIÓN_CSV_ESTUDIANTES',
        `Importación masiva completada: ${importedCount} estudiantes registrados, ${skippedCount} omitidos.`,
        userEmail,
        'user'
      );
      this.save();
    }

    return { importedCount, skippedCount, errors, createdStudents };
  }
}

export const db = new Database();

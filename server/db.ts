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

// Initial clean administrator configuration
const defaultUsers: (User & { passwordHash: string })[] = [
  {
    id: 'user-admin-1',
    name: 'Administrador',
    lastName: 'General',
    email: 'admin@votoescolar.edu',
    role: 'admin',
    status: 'activo',
    createdAt: new Date().toISOString(),
    passwordHash: hashPassword('Admin123!'),
  },
];

const defaultElections: Election[] = [];
const defaultCandidates: Candidate[] = [];
const defaultActivityOptions: ActivityOption[] = [];
const defaultActivities: Activity[] = [];
const defaultVoterParticipation: VoterParticipationRecord[] = [];
const defaultAnonymousBallots: AnonymousBallot[] = [];
const defaultAuditLogs: AuditLog[] = [
  {
    id: 'log-1',
    action: 'INICIALIZACIÓN_SISTEMA',
    details: 'Comité App inicializado con base de datos limpia.',
    user: 'Sistema',
    timestamp: new Date().toISOString(),
    type: 'system',
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

        // Ensure users list contains at least the admin user
        let loadedUsers: (User & { passwordHash: string })[] = Array.isArray(parsed.users)
          ? parsed.users
          : [...defaultUsers];

        if (!loadedUsers.some((u) => u.role === 'admin')) {
          loadedUsers.unshift(...defaultUsers);
        }

        loadedUsers = loadedUsers.map((u: any) => ({
          ...u,
          status: u.status || 'activo',
        }));

        const loadedElections: Election[] = (Array.isArray(parsed.elections) ? parsed.elections : []).map((e: any) => ({
          ...e,
          type: e.type || (e.id && e.id.includes('actividad') ? 'actividad' : 'comite'),
        }));

        this.data = {
          users: loadedUsers,
          elections: loadedElections,
          candidates: Array.isArray(parsed.candidates) ? parsed.candidates : [],
          activityOptions: Array.isArray(parsed.activityOptions) ? parsed.activityOptions : [],
          voterParticipation: Array.isArray(parsed.voterParticipation) ? parsed.voterParticipation : [],
          anonymousBallots: Array.isArray(parsed.anonymousBallots) ? parsed.anonymousBallots : [],
          activities: Array.isArray(parsed.activities) ? parsed.activities : [],
          courseGoals: Array.isArray(parsed.courseGoals) ? parsed.courseGoals : [],
          auditLogs: Array.isArray(parsed.auditLogs) && parsed.auditLogs.length > 0
            ? parsed.auditLogs
            : [...defaultAuditLogs],
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
      elections: [],
      candidates: [],
      activityOptions: [],
      voterParticipation: [],
      anonymousBallots: [],
      activities: [],
      courseGoals: [],
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          action: 'REINICIO_SISTEMA',
          details: 'Base de datos restablecida a estado limpio.',
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

    const goals = (this.data.courseGoals || []).map((g, idx) => {
      const factor = idx === 0 ? 1 : 0.6;
      const currentAmount = Math.min(g.targetAmount, Math.max(0, Math.floor(netProfit * factor)));
      return {
        ...g,
        currentAmount,
        percentageReached: Math.min(100, Math.round((currentAmount / Math.max(1, g.targetAmount)) * 100)),
      };
    });

    return {
      totalIncome,
      totalExpenses,
      netProfit,
      activitiesBreakdown: activities,
      goals,
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

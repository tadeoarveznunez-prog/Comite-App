import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { db } from './server/db.ts';
import { User } from './src/types.ts';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Token-to-user simulation cache for lightweight, reliable session management
const sessions = new Map<string, { user: User; expires: number }>();

function extractUserFromReq(req: Request): User | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  const session = sessions.get(token);
  if (!session) return null;
  if (Date.now() > session.expires) {
    sessions.delete(token);
    return null;
  }
  return session.user;
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = extractUserFromReq(req);
  if (!user) {
    res.status(401).json({ error: 'No autorizado. Por favor inicia sesión.' });
    return;
  }
  (req as any).user = user;
  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = extractUserFromReq(req);
  if (!user) {
    res.status(401).json({ error: 'No autorizado. Debes iniciar sesión como administrador.' });
    return;
  }
  if (user.role !== 'admin') {
    res.status(403).json({ error: 'Acceso denegado. Se requieren privilegios de administrador.' });
    return;
  }
  (req as any).user = user;
  next();
}

// -------------------------------------------------------------
// AUTHENTICATION ROUTES
// -------------------------------------------------------------
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Correo y contraseña son requeridos.' });
    return;
  }

  const user = db.verifyCredentials(email, password);
  if (!user) {
    res.status(401).json({ error: 'Credenciales inválidas. Verifica tu correo y contraseña.' });
    return;
  }

  const token = `tok_${user.id}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  // 7 days expiration
  sessions.set(token, { user, expires: Date.now() + 7 * 24 * 60 * 60 * 1000 });

  db.addAuditLog('INICIO_SESIÓN', `Usuario ${user.name} ${user.lastName} (${user.role}) inició sesión.`, user.email, 'security');

  res.json({ token, user });
});

app.post('/api/auth/register', (req, res) => {
  const { name, lastName, email, password, course, studentIdNumber } = req.body;

  if (!name || !lastName || !email || !password) {
    res.status(400).json({ error: 'Todos los campos obligatorios deben ser completados.' });
    return;
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ error: 'El formato del correo electrónico no es válido.' });
    return;
  }

  // Password strength check
  if (password.length < 6) {
    res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
    return;
  }

  try {
    const newUser = db.createUser({
      name,
      lastName,
      email,
      password,
      role: 'student',
      course: course || '1° Medio A',
      studentIdNumber,
    });

    const token = `tok_${newUser.id}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    sessions.set(token, { user: newUser, expires: Date.now() + 7 * 24 * 60 * 60 * 1000 });

    res.status(201).json({ token, user: newUser });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Error al registrar el estudiante.' });
  }
});

app.get('/api/auth/me', (req, res) => {
  const user = extractUserFromReq(req);
  if (!user) {
    res.status(401).json({ error: 'Sesión no válida o expirada.' });
    return;
  }
  // Refresh user data from DB
  const freshUser = db.findUserById(user.id);
  if (!freshUser) {
    res.status(404).json({ error: 'Usuario no encontrado.' });
    return;
  }
  res.json({ user: freshUser });
});

app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    sessions.delete(token);
  }
  res.json({ message: 'Sesión cerrada correctamente.' });
});

// -------------------------------------------------------------
// ELECTIONS ROUTES
// -------------------------------------------------------------
app.get('/api/elections', (req, res) => {
  const user = extractUserFromReq(req);
  const elections = db.getElections(user?.role === 'student' ? user.id : undefined);
  res.json(elections);
});

app.get('/api/elections/:id', (req, res) => {
  const user = extractUserFromReq(req);
  const election = db.getElectionById(req.params.id, user?.role === 'student' ? user.id : undefined);
  if (!election) {
    res.status(404).json({ error: 'Elección no encontrada.' });
    return;
  }
  res.json(election);
});

app.post('/api/elections', requireAdmin, (req, res) => {
  const {
    title,
    description,
    startDate,
    endDate,
    status,
    showResultsToStudents,
    type,
    targetCourse,
    availablePositions,
    allowVoteModification,
    initialCandidates,
    initialActivityOptions,
  } = req.body;
  const user = (req as any).user;

  if (!title || !description || !startDate || !endDate) {
    res.status(400).json({ error: 'Título, descripción y fechas son obligatorios.' });
    return;
  }

  try {
    const newElec = db.createElection(
      {
        title,
        description,
        startDate,
        endDate,
        status: status || 'pendiente',
        showResultsToStudents: Boolean(showResultsToStudents),
        type: type || 'comite',
        targetCourse: targetCourse || 'Todos los cursos',
        availablePositions: availablePositions || (type === 'actividad' ? 'Opción Ganadora' : 'Directiva Completa'),
        allowVoteModification: Boolean(allowVoteModification),
        initialCandidates,
        initialActivityOptions,
      },
      user.email
    );
    res.status(201).json(newElec);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/admin/elections/:id/duplicate', requireAdmin, (req, res) => {
  const user = (req as any).user;
  try {
    const duplicated = db.duplicateElection(req.params.id, user.email);
    res.status(201).json(duplicated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/elections/:id', requireAdmin, (req, res) => {
  const user = (req as any).user;
  try {
    const updated = db.updateElection(req.params.id, req.body, user.email);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/elections/:id', requireAdmin, (req, res) => {
  const user = (req as any).user;
  const success = db.deleteElection(req.params.id, user.email);
  if (!success) {
    res.status(404).json({ error: 'Elección no encontrada.' });
    return;
  }
  res.json({ message: 'Elección y registros relacionados eliminados exitosamente.' });
});

// -------------------------------------------------------------
// ACTIVITY OPTIONS (For Elección de Actividad)
// -------------------------------------------------------------
app.get('/api/elections/:id/options', (req, res) => {
  const options = db.getActivityOptions(req.params.id);
  res.json(options);
});

app.post('/api/admin/elections/:id/options', requireAdmin, (req, res) => {
  const electionId = req.params.id;
  const { title, description, proposedDate, location, estimatedCost, imageUrl, additionalInfo, active } = req.body;
  const user = (req as any).user;

  if (!title) {
    res.status(400).json({ error: 'El título de la actividad es obligatorio.' });
    return;
  }

  try {
    const option = db.createActivityOption(
      {
        electionId,
        title,
        description: description || '',
        proposedDate,
        location,
        estimatedCost: Number(estimatedCost) || 0,
        imageUrl,
        additionalInfo,
        active: active !== undefined ? Boolean(active) : true,
      },
      user.email
    );
    res.status(201).json(option);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/admin/options/:id', requireAdmin, (req, res) => {
  const user = (req as any).user;
  try {
    const updated = db.updateActivityOption(req.params.id, req.body, user.email);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/admin/options/:id', requireAdmin, (req, res) => {
  const user = (req as any).user;
  const success = db.deleteActivityOption(req.params.id, user.email);
  if (!success) {
    res.status(404).json({ error: 'Opción no encontrada.' });
    return;
  }
  res.json({ message: 'Opción de actividad eliminada exitosamente.' });
});

// -------------------------------------------------------------
// CANDIDATES ROUTES
// -------------------------------------------------------------
app.get('/api/candidates', (req, res) => {
  const electionId = req.query.electionId as string | undefined;
  const candidates = db.getCandidates(electionId);
  res.json(candidates);
});

app.post('/api/candidates', requireAdmin, (req, res) => {
  const { electionId, name, lastName, course, position, photoUrl, proposal, active, colorTag } = req.body;
  const user = (req as any).user;

  if (!electionId || !name || !lastName || !position) {
    res.status(400).json({ error: 'Elección, nombre, apellido y cargo son obligatorios.' });
    return;
  }

  try {
    const candidate = db.createCandidate(
      {
        electionId,
        name,
        lastName,
        course: course || 'Educación Media',
        position,
        photoUrl: photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
        proposal: proposal || '',
        active: active !== undefined ? Boolean(active) : true,
        colorTag: colorTag || '#3b82f6',
      },
      user.email
    );
    res.status(201).json(candidate);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/candidates/:id', requireAdmin, (req, res) => {
  const user = (req as any).user;
  try {
    const updated = db.updateCandidate(req.params.id, req.body, user.email);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/candidates/:id', requireAdmin, (req, res) => {
  const user = (req as any).user;
  const success = db.deleteCandidate(req.params.id, user.email);
  if (!success) {
    res.status(404).json({ error: 'Candidato no encontrado.' });
    return;
  }
  res.json({ message: 'Candidato eliminado exitosamente.' });
});

// -------------------------------------------------------------
// VOTING SYSTEM (Double-vote immune & secret ballot)
// -------------------------------------------------------------
app.post('/api/elections/:id/vote', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const { candidateId, activityOptionId, selectedOptionId } = req.body;
  const electionId = req.params.id;

  const targetId = selectedOptionId || candidateId || activityOptionId;

  if (!targetId) {
    res.status(400).json({ error: 'Debes seleccionar un candidato u opción para emitir tu voto.' });
    return;
  }

  try {
    const result = db.castVote(electionId, targetId, user);
    res.status(200).json({
      success: true,
      message: 'Tu voto fue registrado correctamente en el sistema.',
      receipt: result.receipt,
      votedAt: result.votedAt,
    });
  } catch (err: any) {
    // Return 409 Conflict if already voted or 400 for rules violation
    const isConflict = err.message.includes('Ya has participado') || err.message.includes('dos votos');
    res.status(isConflict ? 409 : 400).json({
      success: false,
      error: err.message || 'No fue posible registrar el voto.',
    });
  }
});

// -------------------------------------------------------------
// RESULTS & STATISTICS
// -------------------------------------------------------------
app.get('/api/elections/:id/results', (req, res) => {
  const user = extractUserFromReq(req);
  const electionId = req.params.id;

  try {
    const results = db.getElectionResults(electionId, user || undefined);
    res.json(results);
  } catch (err: any) {
    res.status(403).json({ error: err.message || 'No se pueden consultar los resultados.' });
  }
});

app.get('/api/elections/:id/voters', requireAdmin, (req, res) => {
  const electionId = req.params.id;
  const voters = db.getVotersForElection(electionId);
  res.json(voters);
});

// -------------------------------------------------------------
// CLASS ACTIVITIES & FINANCES
// -------------------------------------------------------------
app.get('/api/activities', (req, res) => {
  const activities = db.getActivities();
  res.json(activities);
});

app.post('/api/activities', requireAdmin, (req, res) => {
  const { name, description, date, responsible, category, income, expenses } = req.body;
  const user = (req as any).user;

  if (!name || !date || !responsible) {
    res.status(400).json({ error: 'Nombre, fecha y responsable son obligatorios.' });
    return;
  }

  try {
    const newAct = db.createActivity(
      {
        name,
        description: description || '',
        date,
        responsible,
        category: category || 'Kermés',
        income: Number(income) || 0,
        expenses: Number(expenses) || 0,
      },
      user.email
    );
    res.status(201).json(newAct);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/activities/:id', requireAdmin, (req, res) => {
  const user = (req as any).user;
  try {
    const updated = db.updateActivity(req.params.id, req.body, user.email);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/activities/:id', requireAdmin, (req, res) => {
  const user = (req as any).user;
  const success = db.deleteActivity(req.params.id, user.email);
  if (!success) {
    res.status(404).json({ error: 'Actividad no encontrada.' });
    return;
  }
  res.json({ message: 'Actividad eliminada exitosamente.' });
});

app.get('/api/finances', (req, res) => {
  const finances = db.getFinancesSummary();
  res.json(finances);
});

app.post('/api/finances/goals', requireAdmin, (req, res) => {
  const user = (req as any).user;
  const { title, targetAmount, deadline, description } = req.body;
  if (!title || !targetAmount) {
    res.status(400).json({ error: 'Título y monto objetivo son obligatorios.' });
    return;
  }
  try {
    const newGoal = db.createCourseGoal(
      {
        title,
        targetAmount: Number(targetAmount),
        deadline: deadline || new Date().toISOString(),
        description,
      },
      user.email
    );
    res.status(201).json(newGoal);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// ADMIN DASHBOARD & AUDIT TRAILS
// -------------------------------------------------------------
app.get('/api/admin/dashboard', requireAdmin, (req, res) => {
  const stats = db.getAdminStats();
  res.json(stats);
});

app.get('/api/admin/students', requireAdmin, (req, res) => {
  const students = db.getStudentParticipationStatus();
  res.json(students);
});

// Full Student Management (CRUD & Filters)
app.get('/api/admin/students/list', requireAdmin, (req, res) => {
  const search = req.query.search as string | undefined;
  const course = req.query.course as string | undefined;
  const status = req.query.status as string | undefined;
  const students = db.getStudents(search, course, status);
  res.json(students);
});

app.post('/api/admin/students', requireAdmin, (req, res) => {
  const user = (req as any).user;
  const { name, lastName, email, course, studentIdNumber, password, status } = req.body;
  try {
    const student = db.createStudent(
      {
        name,
        lastName,
        email,
        course,
        studentIdNumber,
        password,
        status: status || 'activo',
      },
      user.email
    );
    res.status(201).json(student);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/admin/students/:id', requireAdmin, (req, res) => {
  const user = (req as any).user;
  try {
    const updated = db.updateStudent(req.params.id, req.body, user.email);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/admin/students/:id', requireAdmin, (req, res) => {
  const user = (req as any).user;
  const success = db.deleteStudent(req.params.id, user.email);
  if (!success) {
    res.status(404).json({ error: 'Estudiante no encontrado.' });
    return;
  }
  res.json({ message: 'Estudiante eliminado exitosamente.' });
});

app.post('/api/admin/students/import', requireAdmin, (req, res) => {
  const user = (req as any).user;
  const { students } = req.body;

  if (!Array.isArray(students) || students.length === 0) {
    res.status(400).json({ error: 'Debes proporcionar una lista válida de estudiantes para importar.' });
    return;
  }

  try {
    const result = db.bulkImportStudents(students, user.email);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/admin/audit-logs', requireAdmin, (req, res) => {
  const logs = db.getAuditLogs(100);
  res.json(logs);
});

app.post('/api/admin/reset-demo', (req, res) => {
  db.resetToDefaults();
  res.json({ message: 'Base de datos restablecida a los valores demo con éxito.' });
});

// -------------------------------------------------------------
// VITE MIDDLEWARE / SPA SERVING
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Voto Escolar] Servidor ejecutándose en http://0.0.0.0:${PORT}`);
  });
}

startServer();

import {
  User,
  Election,
  Candidate,
  ElectionResults,
  Activity,
  AdminDashboardStats,
  AuditLog,
  VoterParticipationRecord,
} from '../types.ts';

const TOKEN_KEY = 'voto_escolar_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.error || `Error ${response.status}: ${response.statusText}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (userData: {
    name: string;
    lastName: string;
    email: string;
    password: string;
    course?: string;
    studentIdNumber?: string;
  }) =>
    request<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  getMe: () => request<{ user: User }>('/api/auth/me'),

  logout: () =>
    request<{ message: string }>('/api/auth/logout', {
      method: 'POST',
    }),

  // Elections
  getElections: () => request<Election[]>('/api/elections'),

  getElectionById: (id: string) =>
    request<Election & { candidates: Candidate[]; activityOptions: import('../types.ts').ActivityOption[] }>(`/api/elections/${id}`),

  createElection: (data: Partial<Election> & {
    initialCandidates?: Array<Partial<Candidate>>;
    initialActivityOptions?: Array<Partial<import('../types.ts').ActivityOption>>;
  }) =>
    request<Election>('/api/elections', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  duplicateElection: (id: string) =>
    request<Election>(`/api/admin/elections/${id}/duplicate`, {
      method: 'POST',
    }),

  updateElection: (id: string, updates: Partial<Election>) =>
    request<Election>(`/api/elections/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  deleteElection: (id: string) =>
    request<{ message: string }>(`/api/elections/${id}`, {
      method: 'DELETE',
    }),

  // Activity Options
  getActivityOptions: (electionId: string) =>
    request<import('../types.ts').ActivityOption[]>(`/api/elections/${electionId}/options`),

  createActivityOption: (electionId: string, data: Partial<import('../types.ts').ActivityOption>) =>
    request<import('../types.ts').ActivityOption>(`/api/admin/elections/${electionId}/options`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateActivityOption: (id: string, updates: Partial<import('../types.ts').ActivityOption>) =>
    request<import('../types.ts').ActivityOption>(`/api/admin/options/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  deleteActivityOption: (id: string) =>
    request<{ message: string }>(`/api/admin/options/${id}`, {
      method: 'DELETE',
    }),

  // Candidates
  getCandidates: (electionId?: string) =>
    request<Candidate[]>(electionId ? `/api/candidates?electionId=${electionId}` : '/api/candidates'),

  createCandidate: (data: Partial<Candidate>) =>
    request<Candidate>('/api/candidates', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateCandidate: (id: string, updates: Partial<Candidate>) =>
    request<Candidate>(`/api/candidates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  deleteCandidate: (id: string) =>
    request<{ message: string }>(`/api/candidates/${id}`, {
      method: 'DELETE',
    }),

  // Voting (Polymorphic: supports both candidateId and activityOptionId)
  castVote: (electionId: string, optionId: string) =>
    request<{
      success: boolean;
      message: string;
      receipt: string;
      votedAt: string;
    }>(`/api/elections/${electionId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ selectedOptionId: optionId, candidateId: optionId }),
    }),

  // Results
  getElectionResults: (electionId: string) =>
    request<ElectionResults>(`/api/elections/${electionId}/results`),

  getElectionVoters: (electionId: string) =>
    request<VoterParticipationRecord[]>(`/api/elections/${electionId}/voters`),

  // Activities
  getActivities: () => request<Activity[]>('/api/activities'),

  createActivity: (data: Partial<Activity>) =>
    request<Activity>('/api/activities', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateActivity: (id: string, updates: Partial<Activity>) =>
    request<Activity>(`/api/activities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  deleteActivity: (id: string) =>
    request<{ message: string }>(`/api/activities/${id}`, {
      method: 'DELETE',
    }),

  // Admin
  getAdminStats: () => request<AdminDashboardStats>('/api/admin/dashboard'),

  getAdminStudents: () =>
    request<
      {
        student: User;
        votedElectionsCount: number;
        participations: {
          electionId: string;
          electionTitle: string;
          votedAt: string;
          receiptHash: string;
        }[];
      }[]
    >('/api/admin/students'),

  getStudentsList: (search?: string, course?: string, status?: string) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (course && course !== 'todos') params.append('course', course);
    if (status && status !== 'todos') params.append('status', status);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<User[]>(`/api/admin/students/list${query}`);
  },

  createStudent: (data: {
    name: string;
    lastName: string;
    email: string;
    course?: string;
    studentIdNumber?: string;
    password?: string;
    status?: 'activo' | 'inactivo';
  }) =>
    request<User>('/api/admin/students', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateStudent: (id: string, updates: Partial<User> & { password?: string }) =>
    request<User>(`/api/admin/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  deleteStudent: (id: string) =>
    request<{ message: string }>(`/api/admin/students/${id}`, {
      method: 'DELETE',
    }),

  importStudents: (students: Array<{
    name: string;
    lastName: string;
    email: string;
    course?: string;
    studentIdNumber?: string;
    password?: string;
  }>) =>
    request<{
      importedCount: number;
      skippedCount: number;
      errors: string[];
      createdStudents: User[];
    }>('/api/admin/students/import', {
      method: 'POST',
      body: JSON.stringify({ students }),
    }),

  getAuditLogs: () => request<AuditLog[]>('/api/admin/audit-logs'),

  // Finances
  getFinances: () =>
    request<import('../types.ts').FinancialSummary>('/api/finances'),

  createCourseGoal: (data: {
    title: string;
    targetAmount: number;
    deadline: string;
    description?: string;
  }) =>
    request<import('../types.ts').CourseGoal>('/api/finances/goals', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  resetDemoData: () =>
    request<{ message: string }>('/api/admin/reset-demo', {
      method: 'POST',
    }),

  seedData: () =>
    request<{ message: string }>('/api/admin/reset-demo', {
      method: 'POST',
    }),
};

export type UserRole = 'student' | 'admin';
export type UserStatus = 'activo' | 'inactivo';

export interface User {
  id: string;
  name: string;
  lastName: string;
  email: string;
  role: UserRole;
  course?: string;
  studentIdNumber?: string;
  status?: UserStatus;
  createdAt: string;
}

export type ElectionStatus = 'pendiente' | 'activa' | 'finalizada';
export type ElectionType = 'comite' | 'actividad';

export interface Candidate {
  id: string;
  electionId: string;
  name: string;
  lastName: string;
  course: string;
  position: string;
  photoUrl: string;
  proposal: string;
  active: boolean;
  createdAt: string;
  colorTag?: string;
}

export interface ActivityOption {
  id: string;
  electionId: string;
  title: string;
  description: string;
  proposedDate?: string;
  location?: string;
  estimatedCost?: number;
  imageUrl?: string;
  additionalInfo?: string;
  active: boolean;
  createdAt: string;
}

export interface Election {
  id: string;
  title: string;
  description: string;
  type: ElectionType;
  targetCourse?: string;
  availablePositions?: string[] | string;
  startDate: string;
  endDate: string;
  status: ElectionStatus;
  showResultsToStudents: boolean;
  allowVoteModification?: boolean;
  createdAt: string;
  candidatesCount?: number;
  activityOptionsCount?: number;
  activityOptions?: ActivityOption[];
  candidates?: Candidate[];
  hasVoted?: boolean; // Contextual for current student
  myReceipt?: string;
}

export interface VoterParticipationRecord {
  id: string;
  electionId: string;
  studentId: string;
  studentName: string;
  studentCourse: string;
  votedAt: string;
  receiptHash: string;
}

export interface AnonymousBallot {
  id: string;
  electionId: string;
  candidateId?: string;
  activityOptionId?: string;
  timestamp: string;
  receiptHash: string;
}

export interface CandidateResult {
  candidate: Candidate;
  votes: number;
  percentage: number;
}

export interface ActivityOptionResult {
  option: ActivityOption;
  votes: number;
  percentage: number;
}

export interface ElectionResults {
  electionId: string;
  electionTitle: string;
  electionType: ElectionType;
  status: ElectionStatus;
  showResultsToStudents: boolean;
  totalVotes: number;
  totalEligibleStudents: number;
  participationPercentage: number;
  votedCount: number;
  notVotedCount: number;
  candidateResults: CandidateResult[];
  activityResults?: ActivityOptionResult[];
  winningActivity?: ActivityOptionResult | null;
  lastUpdated: string;
}

export interface StudentParticipationItem {
  student: User;
  votedElectionsCount: number;
  participations: {
    electionId: string;
    electionTitle: string;
    votedAt: string;
    receiptHash: string;
  }[];
}

export interface Activity {
  id: string;
  name: string;
  description: string;
  date: string;
  responsible: string;
  category: 'Kermés' | 'Rifa' | 'Venta' | 'Deportes' | 'Cultural' | 'Otro';
  income: number;
  expenses: number;
  profit: number; // income - expenses
  status?: 'planificada' | 'en curso' | 'finalizada';
  createdAt: string;
}

export interface CourseGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  percentageReached: number;
  deadline: string;
  description: string;
  createdAt: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  activitiesBreakdown: Activity[];
  goals: CourseGoal[];
}

export interface AdminDashboardStats {
  registeredStudentsCount: number;
  activeElectionsCount: number;
  totalVotesCount: number;
  globalParticipationPercentage: number;
  activitiesCount: number;
  totalIncome: number;
  totalExpenses: number;
  accumulatedProfit: number;
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  user: string;
  timestamp: string;
  type: 'election' | 'vote' | 'activity' | 'security' | 'system' | 'user';
}

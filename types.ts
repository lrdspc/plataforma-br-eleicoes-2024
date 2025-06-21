import { LatLngExpression } from 'leaflet';

export enum UserRole {
  ADMINISTRADOR_SISTEMA = 'ADMINISTRADOR_SISTEMA',
  GERENTE_PESQUISA = 'GERENTE_PESQUISA',
  COORDENADOR_CAMPO = 'COORDENADOR_CAMPO',
  PESQUISADOR_CAMPO = 'PESQUISADOR_CAMPO',
  NONE = 'NONE'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string; // Only for mock data setup, not for general use
  creationDate?: string; // ISO Date string
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

export interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

export interface DashboardCardData {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  bgColor?: string;
  textColor?: string;
}

export interface QuotaTarget {
  id: string;
  name: string; // e.g., "Gender: Female", "Age: 18-24"
  targetCount: number;
  achievedCount: number;
}

export enum ProjectStatus {
  PLANEJAMENTO = 'PLANEJAMENTO',
  EM_CAMPO = 'EM_CAMPO',
  ANALISE = 'ANALISE',
  CONCLUIDO = 'CONCLUIDO',
  CANCELADO = 'CANCELADO',
}

export const projectStatusLabels: Record<ProjectStatus, string> = {
  [ProjectStatus.PLANEJAMENTO]: 'Planejamento',
  [ProjectStatus.EM_CAMPO]: 'Em Campo',
  [ProjectStatus.ANALISE]: 'Em Análise',
  [ProjectStatus.CONCLUIDO]: 'Concluído',
  [ProjectStatus.CANCELADO]: 'Cancelado',
};

export enum QuestionType {
  TEXT = 'TEXT',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  SINGLE_CHOICE = 'SINGLE_CHOICE',
  NUMERIC = 'NUMERIC',
  SCALE = 'SCALE', // e.g., Likert scale
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[]; // For MULTIPLE_CHOICE, SINGLE_CHOICE
  scaleMin?: number; // For SCALE
  scaleMax?: number; // For SCALE
  scaleLabels?: string[]; // Optional labels for scale points
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  creationDate: string; // ISO Date string
  startDate?: string;
  endDate?: string;
  targetAudience?: string;
  quotas: QuotaTarget[];
  questions: Question[];
}

export enum SurveyAreaStatus {
  PENDENTE = 'PENDENTE',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  CONCLUIDA = 'CONCLUIDA',
  PROBLEMA = 'PROBLEMA',
}

export const surveyAreaStatusLabels: Record<SurveyAreaStatus, string> = {
  [SurveyAreaStatus.PENDENTE]: 'Pendente',
  [SurveyAreaStatus.EM_ANDAMENTO]: 'Em Andamento',
  [SurveyAreaStatus.CONCLUIDA]: 'Concluída',
  [SurveyAreaStatus.PROBLEMA]: 'Com Problema',
};

export interface SurveyAreaAssignment {
  id: string; // area id
  name: string;
  coordinates: LatLngExpression[];
  interviewsTarget: number;
  interviewsCompleted: number;
  status: SurveyAreaStatus;
  projectId: string; 
  assignedToResearcherId?: string;
}

// Estrutura para uma resposta individual a uma pergunta
export interface Answer {
  questionId: string;
  value: string | string[] | number | null; // Pode ser texto, array de strings para múltipla escolha, número para numérico/escala
}

// Estrutura para uma entrevista/resposta de pesquisa completa
export interface SurveyResponse {
  id: string; // ID único da resposta/entrevista
  projectId: string;
  surveyAreaId: string;
  researcherId: string;
  collectionDate: string; // ISO Date string
  answers: Answer[];
}
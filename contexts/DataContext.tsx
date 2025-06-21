import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Project, User, SurveyAreaAssignment, ProjectStatus, UserRole, SurveyAreaStatus, SurveyResponse } from '../types';
import { initialProjects, initialUsers, initialSurveyAreaAssignments, initialSurveyResponses } from '../data/initialMockData';

interface AppState {
  projects: Project[];
  users: User[];
  surveyAreas: SurveyAreaAssignment[];
  surveyResponses: SurveyResponse[]; // Novo estado para armazenar respostas
}

type Action =
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: Project }
  | { type: 'DELETE_PROJECT'; payload: { projectId: string } }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'DELETE_USER'; payload: { userId: string } }
  | { type: 'COMPLETE_INTERVIEW'; payload: { areaId: string; interviewsDone?: number } }
  | { type: 'UPDATE_PROJECT_STATUS'; payload: { projectId: string; status: ProjectStatus } }
  | { type: 'UPDATE_USER_ROLE'; payload: { userId: string; role: UserRole } }
  | { type: 'ADD_SURVEY_RESPONSE'; payload: SurveyResponse }; // Nova action

const initialState: AppState = {
  projects: initialProjects,
  users: initialUsers,
  surveyAreas: initialSurveyAreaAssignments,
  surveyResponses: initialSurveyResponses, // Inicializa o novo estado
};

const DataContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | undefined>(undefined);

const dataReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'ADD_PROJECT':
      return {
        ...state,
        projects: [action.payload, ...state.projects],
      };
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === action.payload.id ? action.payload : project
        ),
      };
    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(
          project => project.id !== action.payload.projectId
        ),
      };
    case 'ADD_USER':
      if (state.users.find(u => u.email.toLowerCase() === action.payload.email.toLowerCase())) {
        alert(`Erro: Usuário com email ${action.payload.email} já existe.`);
        console.warn(`User with email ${action.payload.email} already exists.`);
        return state;
      }
      return {
        ...state,
        users: [action.payload, ...state.users].sort((a,b) => (a.name > b.name) ? 1: -1),
      };
    case 'UPDATE_USER':
      const userToUpdate = state.users.find(u => u.id === action.payload.id);
      if (userToUpdate && userToUpdate.email.toLowerCase() === 'admin@pbr.com') {
        if (action.payload.email.toLowerCase() !== 'admin@pbr.com') {
          alert('Não é possível alterar o email do administrador principal.');
          return state;
        }
        if (action.payload.role !== UserRole.ADMINISTRADOR_SISTEMA) {
          alert('Não é possível alterar o papel do administrador principal para um não-administrador.');
          return state;
        }
      }
      const existingUserByEmail = state.users.find(u => u.email.toLowerCase() === action.payload.email.toLowerCase() && u.id !== action.payload.id);
      if (existingUserByEmail) {
        alert(`Erro: Usuário com email ${action.payload.email} já existe.`);
        return state;
      }

      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload.id ? action.payload : user
        ).sort((a,b) => (a.name > b.name) ? 1: -1),
      };
    case 'DELETE_USER':
      const userToDelete = state.users.find(u => u.id === action.payload.userId);
      if (userToDelete && userToDelete.email.toLowerCase() === 'admin@pbr.com') {
        alert('Não é possível excluir o administrador principal.');
        return state;
      }
      return {
        ...state,
        users: state.users.filter(
          user => user.id !== action.payload.userId
        ),
      };
    case 'COMPLETE_INTERVIEW':
      return {
        ...state,
        surveyAreas: state.surveyAreas.map(area =>
          area.id === action.payload.areaId
            ? {
                ...area,
                interviewsCompleted: area.interviewsCompleted + (action.payload.interviewsDone || 1),
                status: (area.interviewsCompleted + (action.payload.interviewsDone || 1)) >= area.interviewsTarget
                        ? SurveyAreaStatus.CONCLUIDA
                        : SurveyAreaStatus.EM_ANDAMENTO,
              }
            : area
        ),
      };
    case 'UPDATE_PROJECT_STATUS':
        return {
            ...state,
            projects: state.projects.map(p => 
                p.id === action.payload.projectId ? {...p, status: action.payload.status} : p
            ),
        };
    case 'UPDATE_USER_ROLE': 
        const targetUserForRoleUpdate = state.users.find(u => u.id === action.payload.userId);
        if (targetUserForRoleUpdate && targetUserForRoleUpdate.email.toLowerCase() === 'admin@pbr.com' && action.payload.role !== UserRole.ADMINISTRADOR_SISTEMA) {
            alert('Não é possível alterar o papel do administrador principal para um não-administrador.');
            return state;
        }
        return {
            ...state,
            users: state.users.map(u =>
                u.id === action.payload.userId ? {...u, role: action.payload.role} : u
            ).sort((a,b) => (a.name > b.name) ? 1: -1),
        };
    case 'ADD_SURVEY_RESPONSE': // Lógica para adicionar uma nova resposta de pesquisa
      return {
        ...state,
        surveyResponses: [action.payload, ...state.surveyResponses],
      };
    default:
      return state;
  }
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, initialState);
  return (
    <DataContext.Provider value={{ state, dispatch }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

import { UserRole } from './types';

export const APP_NAME = "Plataforma BR-Eleições";

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  MAP_FIELD: '/map',
  PROJECTS: '/projects',
  USERS: '/users',
  NOT_FOUND: '/404',
};

export const USER_ROLES_HIERARCHY: Record<UserRole, string> = {
  [UserRole.ADMINISTRADOR_SISTEMA]: 'Administrador do Sistema',
  [UserRole.GERENTE_PESQUISA]: 'Gerente de Pesquisa',
  [UserRole.COORDENADOR_CAMPO]: 'Coordenador de Campo',
  [UserRole.PESQUISADOR_CAMPO]: 'Pesquisador de Campo',
  [UserRole.NONE]: 'Nenhum Papel',
};

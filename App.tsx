import React, { ReactNode } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import FieldMapPage from './pages/map/FieldMapPage';
import MainLayout from './components/layout/MainLayout';
import NotFoundPage from './pages/NotFoundPage';
import ProjectListPage from './pages/projects/ProjectListPage';
import ProjectDetailPage from './pages/projects/ProjectDetailPage';
import UserListPage from './pages/users/UserListPage';
import { useAuth } from './hooks/useAuth';
import { UserRole } from './types';
import { ROUTES } from './constants';
import Spinner from './components/common/Spinner';
import SurveyResponsesPage from './pages/responses/SurveyResponsesPage'; // Nova importação

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROUTES.DASHBOARD} replace />; 
  }
  
  return <>{children}</>;
};

const App: React.FC = () => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading && location.pathname !== ROUTES.LOGIN) {
     return (
      <div className="flex items-center justify-center h-screen bg-pbr-bg-main">
        <Spinner size="xl" />
      </div>
    );
  }

  if (location.pathname === ROUTES.LOGIN || (!isAuthenticated && !loading)) {
    return (
      <Routes>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        {!isAuthenticated && location.pathname !== ROUTES.LOGIN && (
            <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
        )}
      </Routes>
    );
  }
  
  return (
    <MainLayout>
      <Routes>
        <Route path={ROUTES.LOGIN} element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        <Route 
          path={ROUTES.DASHBOARD}
          element={
            <ProtectedRoute allowedRoles={[UserRole.GERENTE_PESQUISA, UserRole.COORDENADOR_CAMPO, UserRole.ADMINISTRADOR_SISTEMA]}>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path={ROUTES.MAP_FIELD}
          element={
            <ProtectedRoute allowedRoles={[UserRole.PESQUISADOR_CAMPO, UserRole.COORDENADOR_CAMPO]}>
              <FieldMapPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path={ROUTES.PROJECTS}
          element={
            <ProtectedRoute allowedRoles={[UserRole.GERENTE_PESQUISA, UserRole.ADMINISTRADOR_SISTEMA]}>
              <ProjectListPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path={`${ROUTES.PROJECTS}/:projectId`}
          element={
            <ProtectedRoute allowedRoles={[UserRole.GERENTE_PESQUISA, UserRole.ADMINISTRADOR_SISTEMA]}>
              <ProjectDetailPage />
            </ProtectedRoute>
          }
        />
        <Route 
          path={`${ROUTES.PROJECTS}/:projectId/responses`} // Nova rota
          element={
            <ProtectedRoute allowedRoles={[UserRole.GERENTE_PESQUISA, UserRole.ADMINISTRADOR_SISTEMA, UserRole.COORDENADOR_CAMPO]}>
              <SurveyResponsesPage />
            </ProtectedRoute>
          }
        />
        <Route 
          path={ROUTES.USERS}
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMINISTRADOR_SISTEMA]}>
              <UserListPage />
            </ProtectedRoute>
          } 
        />
        <Route path="/" element={
          user?.role === UserRole.PESQUISADOR_CAMPO 
            ? <Navigate to={ROUTES.MAP_FIELD} replace /> 
            : <Navigate to={ROUTES.DASHBOARD} replace />
        } />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </MainLayout>
  );
};

export default App;
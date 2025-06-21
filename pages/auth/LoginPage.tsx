
import React, { useState, FormEvent } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { APP_NAME, ROUTES, USER_ROLES_HIERARCHY } from '../../constants';
import { Navigate } from 'react-router-dom';
import { User, UserRole } from '../../types';
import { initialUsers } from '../../data/initialMockData';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, fakeLogin, loading, error, isAuthenticated, getRoleDisplayName } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };
  
  if (isAuthenticated) {
    // Redirect based on role if already authenticated
    const currentUserStr = localStorage.getItem('userData');
    if (currentUserStr) {
      const currentUser: User = JSON.parse(currentUserStr);
      if (currentUser.role === UserRole.PESQUISADOR_CAMPO) {
        return <Navigate to={ROUTES.MAP_FIELD} replace />;
      }
    }
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  const handleFakeLogin = async (user: User) => {
    await fakeLogin(user);
  };

  // Simplified testUsers to only include Admin and Pesquisador
  const adminUser = initialUsers.find(u => u.role === UserRole.ADMINISTRADOR_SISTEMA);
  const researcherUser = initialUsers.find(u => u.role === UserRole.PESQUISADOR_CAMPO);

  const testUsers: User[] = [
    adminUser,
    researcherUser,
  ].filter(Boolean) as User[]; // Filter out undefined if a role is missing

  return (
    <div className="min-h-screen flex items-center justify-center bg-pbr-bg-main p-4">
      <div className="bg-pbr-bg-element p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-md">
        <img src="https://picsum.photos/120/40?grayscale" alt="App Logo" className="mx-auto mb-6 h-10 object-contain"/>
        <h1 className="text-2xl sm:text-3xl font-inter font-semibold text-pbr-primary mb-6 text-center">
          {APP_NAME}
        </h1>
        <form onSubmit={handleSubmit}>
          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="seuemail@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <Input
            id="password"
            label="Senha"
            type="password"
            placeholder="******************"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            containerClassName="mb-6"
            disabled={loading}
          />
          {error && <p className="text-pbr-error text-sm text-center mb-4">{error}</p>}
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={loading && (email !== '' || password !== '')} // Show loading only for actual login attempt
            disabled={loading}
          >
            Entrar
          </Button>
          <p className="text-center text-pbr-text-secondary text-xs mt-6">
            Esqueceu a senha? <a href="#" className="text-pbr-primary hover:underline">Recuperar</a>
          </p>
        </form>

        {/* Fake Login Section for Testing */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-pbr-text-secondary text-center mb-3">Login Rápido (Teste)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {testUsers.map(testUser => (
              testUser && (
                <Button
                  key={testUser.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFakeLogin(testUser)}
                  isLoading={loading && email === '' && password === ''} // Show loading only for fake login attempt
                  disabled={loading}
                  className="bg-gray-100 hover:bg-gray-200 text-pbr-text-main"
                >
                  {getRoleDisplayName(testUser.role)}
                </Button>
              )
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;


import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserRole, AuthState } from '../types';
import { ROUTES, USER_ROLES_HIERARCHY } from '../constants';
import { initialUsers } from '../data/initialMockData'; // Import initial users for login check

// FAKE_USERS_DB is now sourced from initialUsers for login purposes.
// The actual user list for CRUD operations will be managed by DataContext.
const FAKE_LOGIN_DB: Record<string, Pick<User, 'id' | 'name' | 'role' | 'email'> & {password?: string}> = {};
initialUsers.forEach(u => {
  if (u.email && u.password) {
    FAKE_LOGIN_DB[u.email.toLowerCase()] = {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        password: u.password
    };
  }
});


export const useAuth = (): AuthState & {
  login: (email: string, pass: string) => Promise<boolean>;
  fakeLogin: (userToLogin: User) => Promise<boolean>; // Added fakeLogin
  logout: () => void;
  loading: boolean;
  error: string | null;
  getRoleDisplayName: (role: UserRole) => string;
} => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('userToken'));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('userToken'));
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('userToken');
    const storedUser = localStorage.getItem('userData');
    if (storedToken && storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);
        setIsAuthenticated(true);
      } catch (e) {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
        setIsAuthenticated(false);
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, pass: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const foundUser = FAKE_LOGIN_DB[email.toLowerCase()];
        if (foundUser && foundUser.password === pass) {
          // Exclude password from userData stored and set in state
          const { password, ...userDataToStore } = foundUser;
          const fakeToken = `fake-jwt-token-${userDataToStore.id}-${Date.now()}`;
          
          localStorage.setItem('userToken', fakeToken);
          localStorage.setItem('userData', JSON.stringify(userDataToStore));
          
          setUser(userDataToStore as User); // Cast as User after removing password
          setToken(fakeToken);
          setIsAuthenticated(true);
          setLoading(false);

          if (userDataToStore.role === UserRole.PESQUISADOR_CAMPO) {
            navigate(ROUTES.MAP_FIELD);
          } else {
            navigate(ROUTES.DASHBOARD);
          }
          resolve(true);
        } else {
          setError('Credenciais inválidas.');
          setLoading(false);
          resolve(false);
        }
      }, 500);
    });
  }, [navigate]);

  const fakeLogin = useCallback(async (userToLogin: User): Promise<boolean> => {
    setLoading(true);
    setError(null);
    return new Promise((resolve) => {
      setTimeout(() => {
        // Exclude password from userData stored and set in state
        const { password, ...userDataToStore } = userToLogin;
        const fakeToken = `fake-jwt-token-${userDataToStore.id}-${Date.now()}`;
        
        localStorage.setItem('userToken', fakeToken);
        localStorage.setItem('userData', JSON.stringify(userDataToStore));
        
        setUser(userDataToStore as User);
        setToken(fakeToken);
        setIsAuthenticated(true);
        setLoading(false);

        if (userDataToStore.role === UserRole.PESQUISADOR_CAMPO) {
          navigate(ROUTES.MAP_FIELD);
        } else {
          navigate(ROUTES.DASHBOARD);
        }
        resolve(true);
      }, 100); // Shorter timeout for fake login
    });
  }, [navigate]);

  const logout = useCallback(() => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    navigate(ROUTES.LOGIN);
  }, [navigate]);

  const getRoleDisplayName = (role: UserRole): string => {
    return USER_ROLES_HIERARCHY[role] || 'Desconhecido';
  };
  
  return { isAuthenticated, user, token, login, fakeLogin, logout, loading, error, getRoleDisplayName };
};

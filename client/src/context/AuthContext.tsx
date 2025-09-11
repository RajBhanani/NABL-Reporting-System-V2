import { createContext, useEffect, useState, type ReactNode } from 'react';

import type { APIError } from '../types/api';
import type { LoginRequest, Roles } from '../types/auth';

import {
  login as loginService,
  logout as logoutService,
  me,
} from '../services/auth.service';

interface User {
  id: string;
  role: Roles;
}

interface AuthContextType {
  isAuthLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  login: (request: LoginRequest) => Promise<boolean | string>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthLoading: true,
  isAuthenticated: false,
  user: null,
  login: (_request: LoginRequest) => Promise.reject(false),
  logout: () => Promise.reject(),
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function verify() {
      try {
        const user = await me();
        setUser(user as User);
        setIsAuthenticated(true);
      } catch (error) {
        console.log((error as APIError)?.message ?? 'Unknown Error');
      } finally {
        setIsAuthLoading(false);
      }
    }
    verify();
  }, []);

  const login = async (request: LoginRequest) => {
    try {
      setIsAuthLoading(true);
      await loginService(request);
      const { id, role } = await me();
      setUser({ id, role: role as Roles });
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      return (error as APIError).message;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const logout = async () => {
    await logoutService();
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthLoading, isAuthenticated, user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

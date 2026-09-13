import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types.ts';
import { api, getStoredToken, setStoredToken } from '../services/api.ts';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    lastName: string;
    email: string;
    password: string;
    course?: string;
    studentIdNumber?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  quickLoginAs: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = getStoredToken();
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const { user: currentUser } = await api.getMe();
        setUser(currentUser);
      } catch (err) {
        console.warn('Sesión previa inválida o expirada:', err);
        setStoredToken(null);
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    setStoredToken(res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const register = async (data: {
    name: string;
    lastName: string;
    email: string;
    password: string;
    course?: string;
    studentIdNumber?: string;
  }) => {
    const res = await api.register(data);
    setStoredToken(res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // Ignore network failure on logout
    } finally {
      setStoredToken(null);
      setToken(null);
      setUser(null);
    }
  };

  const quickLoginAs = async (email: string, password: string) => {
    await login(email, password);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        quickLoginAs,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  availablePersonas: User[];
  tenant: string;
  setTenant: (tenant: string) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  switchPersona: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('meetsync_token'));
  const [availablePersonas, setAvailablePersonas] = useState<User[]>([]);
  const [tenant, setTenant] = useState<string>('MeetSync Enterprise • SOC2');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadAuth() {
      try {
        const data = await api.getMe();
        setUser(data.user);
        setAvailablePersonas(data.availablePersonas);
        if (data.user?.tenant) {
          setTenant(data.user.tenant);
        }
      } catch (err) {
        console.warn('User not authenticated yet or failed to fetch me:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    setToken(res.token);
    setUser(res.user);
    if (res.user.tenant) setTenant(res.user.tenant);
    localStorage.setItem('meetsync_token', res.token);
  };

  const register = async (name: string, email: string, password: string, role?: string) => {
    const res = await api.register(name, email, password, role);
    setToken(res.token);
    setUser(res.user);
    if (res.user.tenant) setTenant(res.user.tenant);
    localStorage.setItem('meetsync_token', res.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('meetsync_token');
  };

  const switchPersona = async (userId: string) => {
    const res = await api.switchPersona(userId);
    if (res.success && res.user) {
      setUser(res.user);
      if (res.user.tenant) setTenant(res.user.tenant);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        availablePersonas,
        tenant,
        setTenant,
        login,
        register,
        logout,
        switchPersona,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

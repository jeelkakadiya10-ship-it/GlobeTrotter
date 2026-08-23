import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  deleteAccount: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('globetrotter_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('globetrotter_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const res = await api.get('/users/me');
          setUser(res.data);
          localStorage.setItem('globetrotter_user', JSON.stringify(res.data));
        } catch (err) {
          console.error('Session validation error:', err);
          logout();
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    setToken(res.data.token);
    setUser(res.data.user);
    localStorage.setItem('globetrotter_token', res.data.token);
    localStorage.setItem('globetrotter_user', JSON.stringify(res.data.user));
  };

  const signup = async (name: string, email: string, password: string) => {
    const res = await api.post('/auth/signup', { name, email, password });
    setToken(res.data.token);
    setUser(res.data.user);
    localStorage.setItem('globetrotter_token', res.data.token);
    localStorage.setItem('globetrotter_user', JSON.stringify(res.data.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('globetrotter_token');
    localStorage.removeItem('globetrotter_user');
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...data };
      setUser(updated);
      localStorage.setItem('globetrotter_user', JSON.stringify(updated));
    }
  };

  const deleteAccount = async (password: string) => {
    await api.delete('/users/me', { data: { password } });
    logout();
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, updateUser, deleteAccount }}>
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
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User } from '../types';
import * as api from '../api';

interface AuthContextType {
  user: User | null;
  login: (userId: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      api.login(storedUserId)
        .then(setUser)
        .catch(() => {
          // if token/user is invalid, clear it
          localStorage.removeItem('userId');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (userId: string) => {
    const loggedInUser = await api.login(userId);
    setUser(loggedInUser);
    localStorage.setItem('userId', loggedInUser.id);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userId');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
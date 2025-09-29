import React, { createContext, useContext, useEffect, useState } from 'react';
import apiClient from '../api/client';

interface User {
  id: number;
  email: string;
  name: string;
  plan: 'basic' | 'pro' | 'premium';
  createdAt: string;
  updatedAt: string;
}

interface UserStats {
  total_projects: number;
  total_sessions: number;
  active_projects: number;
  completed_sessions: number;
}

interface AuthContextType {
  user: User | null;
  stats: UserStats | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, plan?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Проверка токена при загрузке
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          apiClient.setToken(token);
          const response = await apiClient.getProfile();
          setUser(response.user);
          setStats(response.stats);
        }
      } catch (error) {
        console.error('Ошибка проверки аутентификации:', error);
        // Токен недействителен, очищаем его
        apiClient.setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password);
      apiClient.setToken(response.token);
      setUser(response.user);
      
      // Получаем статистику
      const profileResponse = await apiClient.getProfile();
      setStats(profileResponse.stats);
    } catch (error) {
      console.error('Ошибка входа:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string, plan: string = 'basic') => {
    try {
      const response = await apiClient.register(email, password, name, plan);
      apiClient.setToken(response.token);
      setUser(response.user);
      
      // Получаем статистику
      const profileResponse = await apiClient.getProfile();
      setStats(profileResponse.stats);
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      throw error;
    }
  };

  const logout = () => {
    apiClient.setToken(null);
    setUser(null);
    setStats(null);
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const response = await apiClient.updateProfile(data);
      setUser(response.user);
    } catch (error) {
      console.error('Ошибка обновления профиля:', error);
      throw error;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await apiClient.changePassword(currentPassword, newPassword);
    } catch (error) {
      console.error('Ошибка смены пароля:', error);
      throw error;
    }
  };

  const refreshProfile = async () => {
    try {
      const response = await apiClient.getProfile();
      setUser(response.user);
      setStats(response.stats);
    } catch (error) {
      console.error('Ошибка обновления профиля:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    stats,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';

const BACKEND_URL = "http://127.0.0.1:8001";

interface User {
  user_id: string;
  email: string;
  name: string;
  picture?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: (sessionId: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const api = axios.create({
    baseURL: BACKEND_URL,
    withCredentials: true,
  });

  // Add token to requests
  api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const response = await api.get('/api/auth/me');
      setUser(response.data);
    } catch (error) {
      console.log('Auth check failed:', error);
      await AsyncStorage.removeItem('access_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { access_token, ...userData } = response.data;
      await AsyncStorage.setItem('access_token', access_token);
      setUser(userData);
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Error al iniciar sesión';
      throw new Error(message);
    }
  };

const register = async (email: string, password: string, name: string) => {
  try {
    const response = await api.post('/api/auth/register', { email, password, name });
    const { access_token, ...userData } = response.data;
    await AsyncStorage.setItem('access_token', access_token);
    setUser(userData);
  } catch (error: any) {
    console.log("REGISTER ERROR:", error.response?.data);
    const message = error.response?.data?.detail || 'Error al registrarse';
    throw new Error(message);
  }
};

  const loginWithGoogle = async (sessionId: string) => {
    try {
      const response = await api.post('/api/auth/google', { session_id: sessionId });
      const { access_token, ...userData } = response.data;
      await AsyncStorage.setItem('access_token', access_token);
      setUser(userData);
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Error con Google';
      throw new Error(message);
    }
  };

  const logout = async () => {
   try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.log('Logout error:', error);
    } finally {
      await AsyncStorage.removeItem('access_token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

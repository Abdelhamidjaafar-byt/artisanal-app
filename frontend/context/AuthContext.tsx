
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import api from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
  setAuthData: (user: User, token: string) => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('artisan_token');
      const savedUser = localStorage.getItem('artisan_auth');

      if (token && savedUser) {
        setUser(JSON.parse(savedUser));
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email: string, password?: string) => {
    try {
      if (!password) {
        // Fallback for demo buttons that might not provide password, 
        // though ideally we should remove this or default a password if it's a demo account
        // checking if it matches mock data for seamless transition or forcing error
        console.warn("Password is required for real authentication");
        return false;
      }

      const response = await api.post('/auth/login', { email, password });
      const { user: backendUser, token } = response.data;

      // Map backend user to frontend User type
      // Backend role is an array, take the first one
      const userRoles = Array.isArray(backendUser.role)
        ? (backendUser.role as UserRole[])
        : [UserRole.CLIENT];

      const userToSave: User = {
        id: backendUser.id,
        name: backendUser.name,
        email: backendUser.email,
        role: userRoles,
        isApproved: backendUser.isApproved,
        avatar: backendUser.avatar,
        region: backendUser.region,
        bio: backendUser.bio
      };

      setUser(userToSave);
      localStorage.setItem('artisan_token', token);
      localStorage.setItem('artisan_auth', JSON.stringify(userToSave));
      return true;
    } catch (error: any) {
      console.error("Login failed:", error);
      // Propagate the specific error message from the backend if available
      const message = error.response?.data?.message || "Échec de la connexion. Veuillez réessayer.";
      throw new Error(message);
    }
  };

  const updateUser = async (data: Partial<User>) => {
    try {
      const response = await api.patch('/users/profile', data);
      const backendUser = response.data;

      const userRoles = Array.isArray(backendUser.role)
        ? (backendUser.role as UserRole[])
        : [UserRole.CLIENT];

      const userToSave: User = {
        ...backendUser,
        id: backendUser._id || backendUser.id,
        role: userRoles
      };

      setUser(userToSave);
      localStorage.setItem('artisan_auth', JSON.stringify(userToSave));
    } catch (error) {
      console.error("Update profile failed:", error);
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const response = await api.get('/users/profile');
      const backendUser = response.data;

      const userRoles = Array.isArray(backendUser.role)
        ? (backendUser.role as UserRole[])
        : [UserRole.CLIENT];

      const userToSave: User = {
        id: backendUser._id || backendUser.id,
        name: backendUser.name,
        email: backendUser.email,
        role: userRoles,
        isApproved: backendUser.isApproved,
        avatar: backendUser.avatar,
        region: backendUser.region,
        bio: backendUser.bio
      };

      setUser(userToSave);
      localStorage.setItem('artisan_auth', JSON.stringify(userToSave));
    } catch (error) {
      console.error("Refresh user failed:", error);
    }
  };

  const setAuthData = React.useCallback((userToSet: User, token: string) => {
    setUser(userToSet);
    setLoading(false);
    localStorage.setItem('artisan_token', token);
    localStorage.setItem('artisan_auth', JSON.stringify(userToSet));
  }, []);

  const logout = () => {
    setUser(null);
    localStorage.removeItem('artisan_auth');
    localStorage.removeItem('artisan_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, refreshUser, setAuthData, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

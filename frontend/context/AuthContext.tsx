
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import api from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
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
      const userRole = backendUser.role && backendUser.role.length > 0
        ? (backendUser.role[0] as UserRole)
        : UserRole.CLIENT;

      const userToSave: User = {
        id: backendUser.id,
        name: backendUser.name,
        email: backendUser.email,
        role: userRole,
        // Backend doesn't return these yet, keep defaults or properties
        avatar: backendUser.avatar,
        region: backendUser.region,
        craftType: backendUser.craftType,
        bio: backendUser.bio
      };

      setUser(userToSave);
      localStorage.setItem('artisan_token', token);
      localStorage.setItem('artisan_auth', JSON.stringify(userToSave));
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('artisan_auth');
    localStorage.removeItem('artisan_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

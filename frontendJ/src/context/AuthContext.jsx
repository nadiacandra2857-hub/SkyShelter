import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Periksa sesi saat startup
  useEffect(() => {
    let mounted = true;
    const initAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const profile = await authService.getCurrentUser();
          if (mounted && profile) {
            setUser(profile);
          }
        }
      } catch (err) {
        console.warn('Sesi login tidak valid:', err);
        authService.logout();
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    // Event listener unauthorized (token expired)
    const handleUnauthorized = () => {
      setUser(null);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      mounted = false;
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (username, password) => {
    const data = await authService.login(username, password);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;

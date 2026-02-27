// Authcontext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loginWithGoogle: (userInfo: User) => Promise<boolean>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${API_BASE_URL}/auth/protected`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => {
          if (!response.ok) throw new Error('Invalid token');
          return response.json();
        })
        .then((data) => {
          setUser({
            id: data.user.customer_id,
            name: data.user.email.split('@')[0],
            email: data.user.email,
          });
        })
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          throw new Error(data.message || 'Login failed');
        } else {
          throw new Error('Server returned an unexpected response');
        }
      }

      const { token } = await response.json();
      localStorage.setItem('token', token);

      const userData = await fetch(`${API_BASE_URL}/auth/protected`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!userData.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await userData.json();
      setUser({
        id: data.user.customer_id,
        name: data.user.email.split('@')[0],
        email: data.user.email,
      });

      return true;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          throw new Error(data.message || 'Signup failed');
        } else {
          throw new Error('Server returned an unexpected response');
        }
      }

      const { token } = await response.json();
      localStorage.setItem('token', token);

      setUser({
        id: token, // Replace with actual customer_id if returned by backend
        name,
        email,
      });

      return true;
    } catch (err) {
      console.error('Signup error:', err);
      return false;
    }
  };

  const loginWithGoogle = async (userInfo: User): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userInfo),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          throw new Error(data.message || 'Google login failed');
        } else {
          throw new Error('Server returned an unexpected response');
        }
      }

      const { token } = await response.json();
      localStorage.setItem('token', token);

      setUser(userInfo);

      return true;
    } catch (err) {
      console.error('Google login error:', err);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  const value: AuthContextType = {
    user,
    login,
    signup,
    logout,
    loginWithGoogle,
    isAuthenticated: !!user,
    isLoading,
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
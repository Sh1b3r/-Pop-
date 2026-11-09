import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { INITIAL_USERS } from '../data/mockStore';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, role?: Role) => Promise<boolean>;
  signup: (name: string, email: string) => Promise<boolean>;
  logout: () => void;
  users: User[];
  updateUserRole: (id: string, role: Role) => void;
  toggleUserStatus: (id: string) => void;
  addUser: (name: string, email: string, role: Role) => void;
  deleteUser: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const stored = localStorage.getItem('pop_admin_users');
      return stored ? JSON.parse(stored) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('pop_auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('pop_auth_token') || null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('pop_admin_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (user && token) {
      localStorage.setItem('pop_auth_user', JSON.stringify(user));
      localStorage.setItem('pop_auth_token', token);
    } else {
      localStorage.removeItem('pop_auth_user');
      localStorage.removeItem('pop_auth_token');
    }
  }, [user, token]);

  const login = async (email: string, role?: Role): Promise<boolean> => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));

    const existingUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    const matchedUser: User = existingUser || {
      id: `usr_${Date.now()}`,
      name: email.split('@')[0],
      email,
      role: role || (email.includes('admin') ? 'SuperAdmin' : email.includes('manager') ? 'Manager' : 'Customer'),
      isActive: true,
      createdAt: new Date().toISOString()
    };

    if (!existingUser) {
      setUsers((prev) => [...prev, matchedUser]);
    }

    const mockToken = `jwt_${btoa(email)}_${Date.now()}`;
    setUser(matchedUser);
    setToken(mockToken);
    setIsLoading(false);
    return true;
  };

  const signup = async (name: string, email: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name,
      email,
      role: 'Customer',
      isActive: true,
      createdAt: new Date().toISOString()
    };

    setUsers((prev) => [...prev, newUser]);
    const mockToken = `jwt_${btoa(email)}_${Date.now()}`;
    setUser(newUser);
    setToken(mockToken);
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  const updateUserRole = (id: string, role: Role) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
    if (user && user.id === id) {
      setUser((prev) => (prev ? { ...prev, role } : null));
    }
  };

  const toggleUserStatus = (id: string) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, isActive: !u.isActive } : u)));
  };

  const addUser = (name: string, email: string, role: Role) => {
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name,
      email,
      role,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    setUsers((prev) => [...prev, newUser]);
  };

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        users,
        updateUserRole,
        toggleUserStatus,
        addUser,
        deleteUser
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


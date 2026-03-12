'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole, MOCK_USERS } from './mock';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  login: (roleMock: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  const login = (roleMock: UserRole) => {
    // Find the first user with that role in mocks
    const mockUser = MOCK_USERS.find(u => u.role === roleMock);
    if (mockUser) {
        setUser(mockUser);
        
        // Redirect logic based on role
        if (roleMock === 'PSYCHOLOGIST') {
            router.push('/dashboard/psychology');
        } else if (roleMock === 'PATROL_BRIGADIER') {
            router.push('/dashboard/incidents');
        } else {
             // Admin, General, Sub-General
            router.push('/dashboard');
        }
    }
  };

  const logout = () => {
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
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

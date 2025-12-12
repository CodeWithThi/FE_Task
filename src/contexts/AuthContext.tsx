import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mockUsers: Record<UserRole, User> = {
  admin: {
    id: '1',
    name: 'Nguyễn Văn Admin',
    email: 'admin@trungtam.edu.vn',
    role: 'admin',
    department: 'Công nghệ thông tin',
    status: 'active',
  },
  director: {
    id: '2',
    name: 'Trần Thị Giám Đốc',
    email: 'giamdoc@trungtam.edu.vn',
    role: 'director',
    department: 'Ban giám đốc',
    status: 'active',
  },
  pmo: {
    id: '3',
    name: 'Lê Văn PMO',
    email: 'pmo@trungtam.edu.vn',
    role: 'pmo',
    department: 'Phòng điều phối',
    status: 'active',
  },
  leader: {
    id: '4',
    name: 'Phạm Thị Leader',
    email: 'leader@trungtam.edu.vn',
    role: 'leader',
    department: 'Bộ môn Toán',
    status: 'active',
  },
  staff: {
    id: '5',
    name: 'Hoàng Văn Staff',
    email: 'staff@trungtam.edu.vn',
    role: 'staff',
    department: 'Bộ môn Toán',
    status: 'active',
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, password: string, role: UserRole) => {
    // Mock login - in real app, this would call an API
    setUser(mockUsers[role]);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
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

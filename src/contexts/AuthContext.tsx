import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users database - in real app, this would be from API/database
const mockUsersDatabase: User[] = [
  {
    id: '1',
    name: 'Nguyễn Văn Admin',
    email: 'admin@trungtam.edu.vn',
    role: 'admin',
    department: 'Công nghệ thông tin',
    status: 'active',
  },
  {
    id: '2',
    name: 'Trần Thị Giám Đốc',
    email: 'giamdoc@trungtam.edu.vn',
    role: 'director',
    department: 'Ban giám đốc',
    status: 'active',
  },
  {
    id: '3',
    name: 'Lê Văn PMO',
    email: 'pmo@trungtam.edu.vn',
    role: 'pmo',
    department: 'Phòng điều phối',
    status: 'active',
  },
  {
    id: '4',
    name: 'Phạm Thị Leader',
    email: 'leader@trungtam.edu.vn',
    role: 'leader',
    department: 'Bộ môn Toán',
    status: 'active',
  },
  {
    id: '5',
    name: 'Hoàng Văn Staff',
    email: 'staff@trungtam.edu.vn',
    role: 'staff',
    department: 'Bộ môn Toán',
    status: 'active',
  },
];

// Mock password for demo - all users use same password
const DEMO_PASSWORD = '123456';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Validate that the stored user exists in our database
        const validUser = mockUsersDatabase.find(u => u.id === parsedUser.id && u.email === parsedUser.email);
        if (validUser && validUser.status === 'active') {
          setUser(validUser);
        } else {
          sessionStorage.removeItem('user');
        }
      } catch {
        sessionStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, password: string): boolean => {
    // Find user by email
    const foundUser = mockUsersDatabase.find(
      u => u.email.toLowerCase() === email.toLowerCase()
    );
    
    // Validate password and user status
    if (foundUser && password === DEMO_PASSWORD && foundUser.status === 'active') {
      setUser(foundUser);
      // Store session (in real app, would use secure tokens)
      sessionStorage.setItem('user', JSON.stringify(foundUser));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoading }}>
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

import { createContext, useContext, useState, type ReactNode } from 'react';

export interface User {
  id: string;
  username: string;
  password?: string;
  role: 'principal' | 'hod';
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users
const USERS: User[] = [
  {
    id: '1',
    username: 'principal',
    password: 'principal123',
    role: 'principal',
    name: 'Principal'
  },
  {
    id: '2',
    username: 'hod',
    password: 'hod123',
    role: 'hod',
    name: 'HOD'
  }
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (username: string, password: string): boolean => {
    const foundUser = USERS.find(
      u => u.username === username && u.password === password
    );
    
    if (foundUser) {
      const userToStore = { ...foundUser };
      delete (userToStore as any).password;
      setUser(userToStore);
      localStorage.setItem('user', JSON.stringify(userToStore));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
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

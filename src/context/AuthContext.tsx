import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authAPI, handleAPIError, type User } from '../services/api';
import axios from 'axios';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
  serverStatus: 'connecting' | 'ready' | 'error';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Base URL (match what is in your api.ts)
const API_URL = 'http://localhost:8000';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [serverStatus, setServerStatus] = useState<'connecting' | 'ready' | 'error'>('connecting');

  useEffect(() => {
    const initApp = async () => {
      // 1. Wait for Backend to start
      const isServerUp = await waitForBackend();
      
      if (!isServerUp) {
        setServerStatus('error');
        setLoading(false);
        return;
      }

      setServerStatus('ready');

      // 2. Check Auth Status
      const savedUser = localStorage.getItem('user');
      const token = localStorage.getItem('access_token');
      
      if (savedUser && token) {
        try {
          const currentUser = await authAPI.getCurrentUser();
          const userData: User = {
            ...currentUser,
            name: currentUser.full_name || currentUser.username
          };
          setUser(userData);
        } catch (error) {
          localStorage.removeItem('user');
          localStorage.removeItem('access_token');
        }
      }
      setLoading(false);
    };

    initApp();
  }, []);

  // Helper: Polls the server health endpoint until it responds
  const waitForBackend = async (): Promise<boolean> => {
    const maxRetries = 20; // Wait up to 20 seconds
    let retries = 0;

    while (retries < maxRetries) {
      try {
        // Try to hit the health endpoint
        await axios.get(`${API_URL}/api/health`, { timeout: 2000 });
        return true; // Success! Server is up.
      } catch (error) {
        retries++;
        // Wait 1 second before trying again
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    return false; // Server failed to start
  };

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authAPI.login(username, password);
      
      const userData: User = {
        ...response.user,
        name: response.user.full_name || response.user.username
      };
      
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      return { success: true };
    } catch (error: any) {
      const errorMessage = handleAPIError(error);
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
  };

  // 3. Custom Loading Screen
  if (loading || serverStatus === 'connecting') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e0e0e0',
          borderTop: '4px solid #00BCD4',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px'
        }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <h2 style={{ color: '#333', fontSize: '18px', fontWeight: '600' }}>
          Starting Server...
        </h2>
        <p style={{ color: '#666', fontSize: '14px' }}>
          This may take a few seconds.
        </p>
      </div>
    );
  }

  if (serverStatus === 'error') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        color: '#A4262C'
      }}>
        <h2>Server Error</h2>
        <p>Could not connect to the backend server.</p>
        <p>Please check your internet connection and restart the app.</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, serverStatus }}>
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

export type { User } from '../services/api';